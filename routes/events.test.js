const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const EventDAO = require('../daos/events');

describe("/events", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  let calendar, calendarBase;
  beforeAll(async() => {
    calendar = (await request(server).post("/calendars").send({ name: 'test-calendar' })).body;
    calendarBase = `/calendars/${calendar._id}`;
  });
  afterEach(async() => {
    jest.restoreAllMocks();
  });

  //Negative test cases
  describe("GET /calendars/:calendarId/events/:eventId", () => {
    it("should return 404 if no matching event id", async () => {
      const badEventId = "id1";
      const testEndpoint = `${calendarBase}/events/${badEventId}`;
      const res = await request(server).get(testEndpoint);
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /calendars/:calendarId/events', () => {
    it('should return a 400 without a provided name', async () => {
      const testEndpoint = `${calendarBase}/events`;
      const res = await request(server)
        .post(testEndpoint)
        .send({date: '2020-07-15'});
      expect(res.statusCode).toEqual(400);    
    });

    it('should return a 400 without a provided date', async () => {
      const testEndpoint = `${calendarBase}/events`;
      const res = await request(server)
        .post(testEndpoint)
        .send({name: 'event1'});
      expect(res.statusCode).toEqual(400);    
    });
  });

  describe('PUT /calendars/:calendarId/events/:eventId', () => {
    let event;
    beforeEach(async() => {
      const postEndpoint = `${calendarBase}/events/`;
      event = (await request(server).post(postEndpoint).send({name: 'test-event', date: '2020-07-15'})).body;
    });

    it("should return a 400 with no data in the request body", async () => {
      const testEndpoint = `${calendarBase}/events/${event._id}`; 
      const res = await request(server).put(testEndpoint)
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /calendars/:calendarId/events/:eventId', () => {
    let event;
    beforeEach(async() => {
      const postEndpoint = `${calendarBase}/events/`;
      event = (await request(server).post(postEndpoint).send({name: 'test-event', date: '2020-07-15'})).body;
    });

    it('should return a 500 if an error occurs during deletion', async() => {
      const mockDeleteById = jest.spyOn(EventDAO, 'deleteById');
      mockDeleteById.mockImplementation(() => {throw new Error;});

      const testEndpoint = `${calendarBase}/events/${event._id}`;
      const res = await request(server).delete(testEndpoint);
      expect(res.statusCode).toEqual(500);
    });
  });

  //Positive test cases
  describe('POST /calendars/:calendarId/events', () => {
    it('should return new event', async() => {
      const newEvent = {
        name: 'test-event',
        date: '2020-02-16',
      }

      const testEndpoint = `${calendarBase}/events/`;
      postedEvent = (await request(server)
        .post(testEndpoint)
        .send(newEvent)
      ).body;

      expect(postedEvent._id).not.toBeNull();
      expect(postedEvent.name).toBe(newEvent.name);
      expect(postedEvent.date).toBe(new Date(newEvent.date).toISOString());
    });
  });

  describe('GET /calendars/:calendarId/events/:eventId after multiple POST', () => {
    let event1, event2;
    beforeEach(async () => {
      const postEndpoint = `${calendarBase}/events/`;
      event1 = (await request(server)
        .post(postEndpoint)
        .send({name: 'test-event1', date: '2020-07-15'})
      ).body;
      event2 = (await request(server)
        .post(postEndpoint)
        .send({name: 'test-event2', date: '2020-07-31'})
      ).body;
    });
 
    it('should return event1 using its id', async () => {
      const testEndpoint = `${calendarBase}/events/${event1._id}`;
      const res = await request(server).get(testEndpoint);
      expect(res.statusCode).toEqual(200);   

      const storedEvent = res.body;
      expect(storedEvent).toMatchObject({ 
        name: event1.name, 
        date: event1.date,
        _id: event1._id, 
      });
    });

    it('should return event2 using its id', async () => {
      const testEndpoint = `${calendarBase}/events/${event2._id}`;
      const res = await request(server).get(testEndpoint);
      expect(res.statusCode).toEqual(200);   

      const storedEvent = res.body;
      expect(storedEvent).toMatchObject({ 
        name: event2.name, 
        date: event2.date,
        _id: event2._id, 
      });
    });
  });

  describe('GET /calendars/:calendarId/events after multiple POST', () => {
    let event1, event2, event3, event4;
    beforeEach(async () => {
      const postEndpoint = `${calendarBase}/events/`;
      event1 = (await request(server)
        .post(postEndpoint)
        .send({name: 'test-event1', date: '2020-07-15'})
      ).body;
      event2 = (await request(server)
        .post(`/calendars/${calendar._id}/events`)
        .send({name: 'test-event2', date: '2020-07-31'})
      ).body;
      event3 = (await request(server)
        .post(`/calendars/${calendar._id}/events`)
        .send({name: 'test-event3', date: '2020-06-01'})
      ).body;
      event4 = (await request(server)
        .post(`/calendars/${calendar._id}/events`)
        .send({name: 'test-event4', date: '2020-08-31'})
        ).body;
    });

    it('should return events within date range (inclusive)', async () => {
      const res = await request(server).get(`${calendarBase}/events?from=2020-07-15&to=2020-08-31`);
      expect(res.statusCode).toEqual(200);   

      const storedEvents = res.body;
      expect(storedEvents).toMatchObject([event1, event2, event4]);
    });

    it('should return all events when date range is not specified', async () => {
      const res = await request(server).get(`${calendarBase}/events`);
      expect(res.statusCode).toEqual(200);   

      const storedEvents = res.body;
      expect(storedEvents).toMatchObject([event1, event2, event3, event4]);
    });
  });

  describe('PUT /calendars/:calendarId/events/:eventId after POST', () => {
    let event, testEndpoint;
    beforeEach(async() => {
      const postEndpoint = `${calendarBase}/events/`;
      event = (await request(server)
        .post(postEndpoint)
        .send({name: 'test-event', date: '2020-07-15'})
      ).body;
      testEndpoint = `${calendarBase}/events/${event._id}`;
    });

    it('should store and return event1 with new name', async () => {  
      const updatedName = 'updated name';

      const res = await request(server)
        .put(testEndpoint)
        .send({ name: updatedName });
      expect(res.statusCode).toEqual(200);    

      const storedEvent = (await request(server)
        .get(testEndpoint))
        .body;
      expect(storedEvent).toMatchObject({ 
        name: updatedName, 
        date: (new Date(event.date)).toISOString(),
        _id: event._id 
      });
    });

    it('should store and return event1 with new date', async () => {
      const updatedDate = '2020-07-16';

      const res = await request(server)
        .put(testEndpoint)
        .send({ date: updatedDate });
      expect(res.statusCode).toEqual(200);    

      const storedEvent = (await request(server)
        .get(testEndpoint))
        .body;
      expect(storedEvent).toMatchObject({ 
        name: event.name,
        date: (new Date(updatedDate)).toISOString(), 
        _id: event._id 
      });
    });
  });

  describe('DELETE /calendars/:calendarId/events/:eventId after POST', () => {
    let event;
    beforeEach(async() => {
      const postEndpoint = `${calendarBase}/events/`;
      event = (await request(server)
        .post(postEndpoint)
        .send({name: 'test-event', date: '2020-07-15'})
      ).body;
    });

    it('should delete and not return event on next GET', async () => {
      const testEndpoint = `${calendarBase}/events/${event._id}`;

      const res = await request(server).delete(testEndpoint);
      expect(res.statusCode).toEqual(200);    

      const storedCalendarResponse = (await request(server).get(testEndpoint));
      expect(storedCalendarResponse.status).toEqual(404);
    });
  })
});
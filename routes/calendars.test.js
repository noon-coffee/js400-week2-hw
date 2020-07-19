  
const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');
const CalendarDAO = require('../daos/calendars');

describe("/calendars", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB)

  describe("GET /:id", () => {
    it("should return 404 if no matching id", async () => {
      const res = await request(server).get("/calendars/id1");
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('POST /', () => {
    it('should return a 400 without a provided name', async () => {
      const res = await request(server).post("/calendars/").send({});
      expect(res.statusCode).toEqual(400);    
    });
  });

  describe('GET /:id after multiple POST /', () => {
    let calendar1, calendar2;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      calendar2 = (await request(server).post("/calendars").send({ name: 'calendar2' })).body;
    });

    it('should return calendar1 using its id', async () => {
      const res = await request(server).get("/calendars/" + calendar1._id);
      expect(res.statusCode).toEqual(200);    
      const storedCalendar = res.body;
      expect(storedCalendar).toMatchObject({ 
        name: 'calendar1', 
        _id: calendar1._id 
      });
    });

    it('should return calendar2 using its id', async () => {
      const res = await request(server).get("/calendars/" + calendar2._id);
      expect(res.statusCode).toEqual(200);    
      const storedCalendar = res.body;
      expect(storedCalendar).toMatchObject({ 
        name: 'calendar2', 
        _id: calendar2._id 
      });
    });
  });

  describe('GET / after multiple POST /', () => {
    let calendar1, calendar2;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
      calendar2 = (await request(server).post("/calendars").send({ name: 'calendar2' })).body;
    });

    it('should return all calendars', async () => {
      const res = await request(server).get("/calendars/");
      expect(res.statusCode).toEqual(200);    
      const storedCalendars = res.body;
      expect(storedCalendars).toMatchObject([calendar1, calendar2]);
    });
  });

  describe('PUT /:id after POST /', () => {
    let calendar1;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
    });

    it('should store and return calendar1 with new name', async () => {
      const res = await request(server)
        .put("/calendars/" + calendar1._id)
        .send({ name: 'new name' });
      expect(res.statusCode).toEqual(200);    

      const storedCalendar = (await request(server).get("/calendars/" + calendar1._id)).body;
      expect(storedCalendar).toMatchObject({ 
        name: 'new name', 
        _id: calendar1._id 
      });
    });

    /*
     * Though the homework instructions mention that calendars.test.js does not need to be
     * modified, I wanted to be consistent with the Widgets in-class example by returning
     * a 400 when there's no data in the request body and so created this test to provide
     * test coverage for it (i.e. bring test coverage to 100%). 
     */
    it("should return a 400 with no data in the request body", async () => {
      const res = await request(server).put("/calendars/" + calendar1._id)
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('DELETE /:id after POST /', () => {
    let calendar1;

    beforeEach(async () => {
      calendar1 = (await request(server).post("/calendars").send({ name: 'calendar1' })).body;
    });

    it('should delete and not return calendar1 on next GET', async () => {
      const res = await request(server).delete("/calendars/" + calendar1._id);
      expect(res.statusCode).toEqual(200);    
      const storedCalendarResponse = (await request(server).get("/calendars/" + calendar1._id));
      expect(storedCalendarResponse.status).toEqual(404);
    });

    /*
     * Though the homework instructions mention that calendars.test.js does not need to be
     * modified, I wanted to be consistent with the Widgets in-class example by returning
     * a 500 when an error occurs during the delete operation and so created this test to provide
     * test coverage for it (i.e. bring test coverage to 100%). 
     * Please let me know if you have feedback on this "jest.spyOn" approach that I researched
     * on StackOverflow.
     */
    it('should return a 500 if an error occurs during deletion', async() => {
      const mockDeleteById = jest.spyOn(CalendarDAO, 'deleteById');
      mockDeleteById.mockImplementation(() => {throw new Error;});

      const res = await request(server).delete("/calendars/" + calendar1._id);
      expect(res.statusCode).toEqual(500);    
    });
  });
});
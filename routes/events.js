const { Router } = require("express");
const router = Router({mergeParams: true});

const EventDAO = require('../daos/events');

// GET /calendars/:id/events/:id 
// - returns event with provided id from specified calendar
router.get("/events/:eventId", async (req, res, next) => {
  const {calendarId, eventId} = req.params;

  const event = await EventDAO.getById(calendarId, eventId);
  if (!event) { 
    res.status(404).send('event not found'); 
  } else {
    res.json(event);
  }
});

// POST /calendars/:id/events
// - creates an event for the specified calendar using JSON from the request body
router.post("/events", async (req, res, next) => {
  const {calendarId} = req.params;
  const { name, date } = req.body;

  if (!name) { 
    res.status(400).send(`body parameter "name" is required`); 
    return;
  }
  if (!date) { 
    res.status(400).send(`body parameter "date" is required`); 
    return;
  } 

  const event = await EventDAO.create(calendarId, name, date);
  res.json(event);
});

// PUT /calendars/:id/events/:id 
// - updates event with provided id from specified calendar to have data from request body
router.put("/events/:eventId", async (req, res, next) => {
  const {calendarId, eventId} = req.params;
  const event = req.body;

  if (!event || JSON.stringify(event) === '{}' ) {
    res.status(400).send('event is required"');
    return;
  }

  const updatedEvent = await EventDAO.updateById(calendarId, eventId, event);
  res.json(updatedEvent);
});

// DELETE /calendars/:id/events/:id 
// - deletes event with provided id from specified calendar
router.delete("/events/:eventId", async (req, res, next) => {
  const {calendarId, eventId} = req.params;

  try {
    await EventDAO.deleteById(calendarId, eventId);
    res.sendStatus(200);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

// GET /calendars/:id/events 
// - get an array for all the events for the specified calendar
// Optional query parameters from and to to specify start and end dates, 
// inclusively, that the returned events should be contained within
router.get("/events", async (req, res, next) => {
  const {calendarId} = req.params;
  let {from, to} = req.query;

  let events;
  if (from && to) {
    events = await EventDAO.getForDates(calendarId, from, to);
  } else {
    events = await EventDAO.getAll(calendarId)
  }
  res.json(events);
});

module.exports = router;
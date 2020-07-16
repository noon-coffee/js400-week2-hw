const { Router } = require("express");
const router = Router();

const CalendarDAO = require('../daos/calendars');

//POST /calendars - creates a calendar using the JSON in the request body
router.post("/", async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).send('body parameter "name" is required"');
  } else {
    const calendar = await CalendarDAO.create(name);
    res.json(calendar);
  }
});

//GET /calendars/:id - returns calendar with provided id
router.get("/:id", async (req, res, next) => {
  const calendar = await CalendarDAO.getById(req.params.id);
  if (calendar) {
    res.json(calendar);
  } else {
    res.sendStatus(404);
  }
});

//GET /calendars - returns an array of all calendars
router.get("/", async (req, res, next) => {
  const calendars = await CalendarDAO.getAll();
  res.json(calendars);
});

//PUT /calendars/:id - updates calendar with the provided id to have the data in the request body
router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const calendar = req.body;
  if (!calendar || JSON.stringify(calendar) === '{}' ) {
    res.status(400).send('calendar is required"');
  } else {
    const updatedCalendar = await CalendarDAO.updateById(id, calendar);
    res.json(updatedCalendar);
  }
});

//DELETE /calendars/:id - deletes a calendar with the provided id
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  try {
    await CalendarDAO.deleteById(id);
    res.sendStatus(200);
  } catch(e) {
    res.status(500).send(e.message);
  }
});


module.exports = router;
const Events = require('../models/events');

module.exports = {};

/*
 * Create
 */
module.exports.create = async (calendarId, name, date) => {
  return await Events.create({ calendarId, name, date });
};

/*
 * Read
 */
module.exports.getById = async (calendarId, eventId) => {
  try {
    const event = await Events
      .findOne({ calendarId: calendarId, _id: eventId })
      .lean();
    return event;
  } catch (e) {
    return null;
  }
};

module.exports.getAll = async(calendarId) => {
  return await Events.find({calendarId: calendarId});
};

module.exports.getForDates = async (calendarId, from, to) => {
  const events = await Events
  .find({
    calendarId : calendarId,
    date : {
      '$gte' : new Date(from),
      '$lte' : new Date(to),
    }
  })
  return events;
}

/*
 * Update
 */
module.exports.updateById = async (calendarId, eventId, event) => {
  return await Events
  .updateOne({ calendarId: calendarId, _id: eventId }, event);
};

/*
 * Delete
 */
module.exports.deleteById = async (calendarId, eventId) => {
  await Events
    .deleteOne({ calendarId: calendarId, _id: eventId });
};


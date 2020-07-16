const Calendars = require('../models/calendars');

module.exports = {};
  
module.exports.create = async (name) => {
  return await Calendars.create({ name });
};

module.exports.getById = async (id) => {
  try {
    const calendar = await Calendars.findOne({ _id: id }).lean();
    return calendar;
  } catch (e) {
    return null;
  }
};

module.exports.getAll = async() => {
  return await Calendars.find();
};

module.exports.updateById = async (id, calendar) => {
  //DeprecationWarning: collection.update is deprecated. Use updateOne, updateMany, or bulkWrite instead.
  //return await Calendars.update({ _id: id }, calendar);
  return await Calendars.updateOne({_id: id}, calendar);
};

module.exports.deleteById = async (id) => {
  //DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
  //await Calendars.remove({ _id: id });
  await Calendars.deleteOne({ _id: id });
}
const Counter = require("../models/Counter");

async function getNextSequence(name) {
  const updated = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  ).exec();

  return updated.seq;
}

module.exports = { getNextSequence };

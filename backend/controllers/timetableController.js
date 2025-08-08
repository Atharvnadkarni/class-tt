const redisClient = require("../redis");

const getTimetable = async (req, res) => {
  try {
    const timetable = await redisClient.get("timetable");
    res
      .status(200)
      .json({ message: "Timetable fetched successfully", timetable });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveTimetable = async (req, res) => {
  try {
    const {body} = req
    await redisClient.set('timetable', JSON.stringify(body))
    res
      .status(200)
      .json({ message: "Timetable saved successfully", timetable: body });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {getTimetable, saveTimetable}
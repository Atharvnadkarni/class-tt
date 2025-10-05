const { redisClient } = require("../redis");

const getTimetable = async (req, res) => {
  const options = req.params
  try {
    const timetable = await redisClient.get("timetable");
    const parsedTimetable = JSON.parse(timetable);
    let filteredTimetable = {};

    if (options.teacher) {
      // Loop through each class
      for (const className in parsedTimetable) {
      const classTimetable = parsedTimetable[className];
      // Loop through each period in the class
      for (const period in classTimetable) {
        const periodData = classTimetable[period];
        if (!periodData || !periodData.teachers) continue;
        // Check if any teacher matches
        const teacherLists = Object.values(periodData.teachers);
        if (teacherLists.some(list => list.includes(options.teacher))) {
        if (!filteredTimetable[className]) filteredTimetable[className] = {};
        filteredTimetable[className][period] = periodData;
        }
      }
      }
    } else {
      filteredTimetable = parsedTimetable;
    }
    res
      .status(200)
      .json({ message: "Timetable fetched successfully", JSON.stringify(filteredTimetable) });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveTimetable = async (req, res) => {
  try {
    const { body } = req;
    await redisClient.set("timetable", JSON.stringify(body));
    res
      .status(200)
      .json({
        message: "Timetable saved successfully",
        timetable: JSON.stringify(body),
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTimetable, saveTimetable };

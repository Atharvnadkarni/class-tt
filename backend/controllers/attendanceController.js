const redisClient = require("../redis");

const getAttendance = async (req, res) => {
  try {
    const attendance = await redisClient.get("attendance");
    const jsonAttendance = JSON.parse(attendance);
    if (jsonAttendance.date != new Date().toISOString()) {
      await redisClient.set(
        "attendance",
        JSON.stringify({
          date: new Date().toISOString(),
          attendance: Object.fromEntries(
            Object.entries(jsonAttendance.attendance).map(([key, value]) => [
              key,
              0,
            ])
          ),
        })
      );
      return res.status(200).json({
        message: "Attendance record fetched successfully",
        attendance: JSON.stringify({
          date: new Date().toISOString(),
          attendance: Object.fromEntries(
            Object.entries(jsonAttendance.attendance).map(([key, value]) => [
              key,
              0,
            ])
          ),
        }),
      });
    }
    res
      .status(200)
      .json({ message: "Attendance record fetched successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveAttendance = async (req, res) => {
  try {
    const { body } = req;
    const date = new Date().toISOString();
    const finalAttendanceData = { date, attendance: body };
    await redisClient.set("attendance", JSON.stringify(finalAttendanceData));
    res.status(200).json({
      message: "Attendance record saved successfully",
      attendance: JSON.stringify(body),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAttendance, saveAttendance };

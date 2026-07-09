const { redisClient } = require("../redis");
const { SingleClassTimetableGenerator } = require("../utils/timetableGen");
const {main: generateClass} = require("../utils/ttGenerator")

const getTimetable = async (req, res) => {
  const { teacher } = req.query;
  try {
    const timetable = await redisClient.get("timetable");
    const parsedTimetable = JSON.parse(timetable);
    let filteredTimetable = {};

    if (teacher) {
      // Loop through each  class
      for (const className in parsedTimetable) {
        const classTimetable = parsedTimetable[className];
        // Loop through each period in the class
        for (const period in classTimetable) {
          const periodData = classTimetable[period];
          if (!periodData || !periodData.teachers) continue;
          // Check if any teacher matches
          const teacherLists = Object.values(periodData.teachers);
          if (teacherLists.some((list) => list.includes(teacher))) {
            if (!filteredTimetable[className])
              filteredTimetable[className] = {};
            filteredTimetable[className][period] = periodData;
          }
        }
      }
    } else {
      filteredTimetable = parsedTimetable;
    }
    res.status(200).json({
      message: "Timetable fetched successfully",
      timetable: JSON.stringify(filteredTimetable),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveTimetable = async (req, res) => {
  try {
    const { body } = req;
    await redisClient.set("timetable", JSON.stringify(body));
    res.status(200).json({
      message: "Timetable saved successfully",
      timetable: JSON.stringify(body),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const generateTimeTable = async (req, res) => {
  const modifyFormat = (formatOriginal) => {
  const splitSubjects = ["ATL", "Art", "Comp", "Music"];

  const value = {};

  formatOriginal.forEach((tr) => {
    const firstKey = Object.keys(tr)[0];

    const name = Object.values(tr).filter(
      (val) => typeof val === "string",
    )[0];

    const nameindex = Object.keys(tr).filter((k) => tr[k] == name)[0];

    const nokey = tr[firstKey] == name ? Object.keys(tr)[1] : firstKey;

    const { [nokey]: _, [nameindex]: _2, ...subjects } = tr;

    const newSubjects = {};

    Object.entries(subjects).forEach(([subject, count]) => {
      if (splitSubjects.includes(subject) && Number(count) === 2) {
        newSubjects[`${subject}1`] = 1;
        newSubjects[`${subject}2`] = 1;
      } else {
        newSubjects[subject] = count;
      }
    });

    value[name] = {
      subjects: newSubjects,
    };
  });

  return value;
};
const SUBJECT_MAP = [
  { regex: /^French/i, code: "FK" },
  { regex: /^Communicative French/i, code: "CFK" },
  { regex: /^English/i, code: "ENG" },
  { regex: /^Math/i, code: "MATH" },
  { regex: /^Physics/i, code: "PHYS" },
  { regex: /^Chemistry/i, code: "CHEM" },
  { regex: /^Biology/i, code: "BIO" },
  { regex: /^Soc\.?\s*Sci/i, code: "SS" },
  { regex: /^History/i, code: "HIST" },
  { regex: /^Geog/i, code: "GEOG" },

  // Periods
  { regex: /^WE/i, code: "SCILWE" },
  { regex: /^Sci\.?\s*Lab/i, code: "SCILWE" },
  { regex: /^Sci\s*Lab/i, code: "SCILWE" },

  { regex: /^MA/i, code: "ATLMA" },
  { regex: /^CE/i, code: "ATLCE" },

  { regex: /^MM/i, code: "YOGAMM" },
  { regex: /^Yoga/i, code: "YOGAMM" },

  { regex: /^LS/i, code: "MUSLS" },
  { regex: /^Lib/i, code: "LIB" },
  { regex: /^Library/i, code: "LIB" },

  { regex: /^NSS/i, code: "NSSNCC" },
  { regex: /^Dance Assist/i, code: "SDDANCE" },
];

function transformWorkload(data, targetClass = "8B") {
  const workload = {};

  function parseSubject(task) {
    const match = SUBJECT_MAP.find((x) => x.regex.test(task));
    return match ? match.code : null;
  }

  function getClasses(task) {
    const matches = task.match(/\d+\s*[A-Z]+/gi);
    if (!matches) return [];

    const classes = [];

    matches.forEach((m) => {
      const grade = m.match(/\d+/)[0];
      const divs = m.match(/[A-Z]+$/)[0];

      divs.split("").forEach((div) => {
        classes.push(`${grade}${div}`);
      });
    });

    return classes;
  }

  data.forEach((teacher) => {
    const teacherWorkload = {};

    teacher.workload.forEach((entry) => {
      const subject = parseSubject(entry.task);
      if (!subject) return;

      const classes = getClasses(entry.task);

      if (!classes.includes(targetClass)) return;

      const periods = Math.round(entry.periods / classes.length);

      teacherWorkload[subject] =
        (teacherWorkload[subject] || 0) + periods;
    });

    if (Object.keys(teacherWorkload).length) {
      workload[teacher.name] = teacherWorkload;
    }
  });

  return workload;
}
  const {workloads:origLoads, constraints:origStraints, className} = req.body;
  const workloads = modifyFormat(origLoads);
  const constraints = transformWorkload(origStraints);
  const a = await generateClass(workloads)
  try {
    const oldTimetable = await redisClient.get("timetable")
    // const { body } = req;
    await redisClient.set("timetable", JSON.stringify({...JSON.parse(oldTimetable), [className]:newTimetable}));
    res.status(200).json({
      message: "Timetable saved successfully",
      timetable: JSON.stringify(newTimetable),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTimetable, saveTimetable, generateTimeTable };

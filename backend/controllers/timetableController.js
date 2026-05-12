const { redisClient } = require("../redis");
const { SingleClassTimetableGenerator } = require("../utils/timetableGen");

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
  const transformConstraints = (data) => {
    const result = {
      notSameDay: [],
      nextTo: [],
      batchwisies: [],
      farfaraway: [],
    };

    const generatedMap = {};

    // Create numbered subjects
    const ensureGenerated = (subject, count = 2) => {
      if (!generatedMap[subject]) {
        generatedMap[subject] = [];
      }

      while (generatedMap[subject].length < count) {
        generatedMap[subject].push(
          `${subject}${generatedMap[subject].length + 1}`,
        );
      }

      return generatedMap[subject];
    };

    // ----------------------------
    // CONSECUTIVE -> nextTo
    // ATL + ATL => ATL1 + ATL2
    // ----------------------------
    data.consecutive.forEach((group) => {
      const subject = group[0][0];

      const generated = ensureGenerated(subject, 2);

      result.nextTo.push([generated[0], generated[1]]);
    });

    // ----------------------------
    // BATCHWISE
    // [["ATL"], ["WE", "MA"]]
    // =>
    // [["ATL1"], ["WE"]]
    // [["ATL2"], ["MA"]]
    // ----------------------------
    data.batchwise.forEach((group) => {
      const subject = group[0][0];
      const teachers = group[1];

      const generated = ensureGenerated(subject, teachers.length);

      teachers.forEach((teacher, i) => {
        result.batchwisies.push([[generated[i]], [teacher]]);
      });
    });

    // ----------------------------
    // FAR FAR AWAY
    // ----------------------------
    data.farFarAway.forEach((group) => {
      const transformed = [];

      group.forEach((pair) => {
        const newPair = [];

        pair.forEach((item) => {
          if (generatedMap[item]) {
            newPair.push(...generatedMap[item]);
          } else {
            newPair.push(item);
          }
        });

        transformed.push(newPair);
      });

      result.farfaraway.push(transformed);
    });

    // ----------------------------
    // NOT SAME DAY
    // Add generated pairs together
    // ----------------------------

    // Add all duplicated/generated subjects
    Object.entries(generatedMap).forEach(([subject, values]) => {
      if (values.length > 1) {
        result.notSameDay.push(values);
      }
    });

    // Original list
    result.notSameDay.push(data.notSameDay);

    return result;
  };
  const {workloads:origLoads, constraints:origStraints, className} = req.body;
  const workloads = modifyFormat(origLoads);
  const constraints = transformConstraints(origStraints);
  const generator = new SingleClassTimetableGenerator(workloads, constraints);
  const newTimetable = generator.generate("7B");
  try {
    // const { body } = req;
    await redisClient.set("timetable", JSON.stringify(newTimetable));
    res.status(200).json({
      message: "Timetable saved successfully",
      timetable: JSON.stringify(newTimetable),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTimetable, saveTimetable, generateTimeTable };

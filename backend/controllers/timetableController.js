const { redisClient } = require("../redis");
const { gen } = require("../utils/ttGenerator");

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
  const SUBJECT_MAP = [
    { regex: /\benglish\b/i, code: "ENG" },
    { regex: /\bmath(s|ematics)?\b/i, code: "MATH" },
    { regex: /\bphysics\b/i, code: "PHYS" },
    { regex: /\bchemistry\b/i, code: "CHEM" },
    { regex: /\bbiology\b/i, code: "BIO" },

    // Social Science
    { regex: /\bhistory\b|\bcivics\b|\bpolitical science\b/i, code: "HISTPS" },
    { regex: /\bgeography\b/i, code: "GEOG" },

    // Languages
    { regex: /\bfrench\b/i, code: "FK" },
    { regex: /\bconversational french\b/i, code: "CFK" },
    { regex: /\bhindi\b/i, code: "HINDI" },

    // Science Lab / Work Experience
    {
      regex: /\bscience lab\b|\bscilab\b|\bscience work experience\b/i,
      code: "SCILWE",
    },

    // ATL
    {
      regex: /\batl.*computer\b|\batl.*coding\b|\batl.*ce\b/i,
      code: "ATLCE",
    },
    {
      regex: /\batl.*math\b|\batl.*mathematics\b|\batl.*ma\b/i,
      code: "ATLMA",
    },

    // Arts
    {
      regex: /\bart.*hw\b|\bart.*homework\b|\bart homework\b/i,
      code: "ARTHW",
    },
    {
      regex: /\bart.*class\b|\bart.*creative\b|\bart.*ch\b/i,
      code: "ARTCH",
    },

    // Computers
    { regex: /\bcomputer\s*1\b/i, code: "COMP1" },
    { regex: /\bcomputer\s*2\b/i, code: "COMP2" },

    // Activities
    { regex: /\bmusic.*gk\b|\bgk.*music\b/i, code: "MUSGK" },
    {
      regex: /\bmusic.*life skills\b|\blife skills\b|\bmusls\b/i,
      code: "MUSLS",
    },
    {
      regex: /\bsports\b|\bdance\b|\bphysical education\b/i,
      code: "SDDANCE",
    },
    { regex: /\byoga\b/i, code: "YOGAMM" },
    { regex: /\bnss\b|\bncc\b/i, code: "NSSNCC" },
    { regex: /\blibrary\b/i, code: "LIB" },
  ];
  function modifyFormat(data, targetClass = "8B") {
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

        teacherWorkload[subject] = (teacherWorkload[subject] || 0) + periods;
      });

      if (Object.keys(teacherWorkload).length) {
        workload[teacher.name] = teacherWorkload;
      }
    });

    return workload;
  }
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
  const {
    workloads: origLoads,
    constraints: origStraints,
    className,
  } = req.body;
  const workloads = modifyFormat(origLoads, className);
  console.log("oreo", workloads, origLoads);
  const constraints = transformConstraints(origStraints);
  const newTimetable = gen(workloads, className);
  try {
    const oldTimetable = await redisClient.get("timetable");
    // const { body } = req;
    await redisClient.set(
      "timetable",
      JSON.stringify({
        ...JSON.parse(oldTimetable),
        [className]: newTimetable,
      }),
    );
    res.status(200).json({
      message: "Timetable saved successfully",
      timetable: JSON.stringify(newTimetable),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getTimetable, saveTimetable, generateTimeTable };

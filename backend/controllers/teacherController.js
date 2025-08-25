const Teacher = require("../models/Teacher");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const redisClient = require("../redis");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const getTeachers = async (req, res) => {
  try {
    const teacher = await Teacher.find();
    res.status(200).json({ message: "Teachers fetched successfully", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher fetched successfully", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createTeacher = async (req, res) => {
  const { body } = req;
  const hashedPassword = await bcrypt.hash(body.password, 10);
  try {
    const newTeacher = await Teacher.create(
      Object.assign({}, body, { password: hashedPassword })
    );
    res
      .status(201)
      .json({ message: "Teacher created successfully", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const updateTeacher = async (req, res) => {
  const { body } = req;
  const { id } = req.params;
  let hashedPassword;
  if (body.password) {
    hashedPassword = await bcrypt.hash(body.password, 10);
  }

  try {
    const newTeacher = body.password
      ? await Teacher.findByIdAndUpdate(
          id,
          Object.assign({}, body, { password: hashedPassword }),
          { new: true }
        )
      : await Teacher.findByIdAndUpdate(id, body, { new: true });
    if (!newTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res
      .status(200)
      .json({ message: "Teacher updated successfully", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const loginTeacher = async (req, res) => {
  const { username, password } = req.body;
  try {
    const teacher = await Teacher.login(username, password);

    // create token
    const token = createToken(teacher._id);
    res.status(200).json({
      _id: teacher._id,
      username,
      token,
      tier: teacher.tier,
      name: teacher.name,
      displayName: teacher.displayName,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signupTeacher = async (req, res) => {
  const { name, subjects, username, password } = req.body;
  try {
    const teacher = await Teacher.signup(name, subjects, username, password);

    // create token
    const token = createToken(teacher._id);
    res.status(201).json({ username, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const findTeacherInBatchArray = (teacher, teacherArray) => {
  let index = [];
  for (let i = 0; i < teacherArray.length; i++) {
    const batch = teacherArray[i];
    console.log(teacherArray)
    for (let j = 0; j < batch.length; j++) {
      const teacher_ = batch[j];
      if (teacher_ == teacher) {
        index = [i,j]
      }
    }
  }
  return index;
}
// const getNestedValue = (array, indexArr) => {
//   let latestDivision = array;
//   for (const index of indexArr) {
//     latestDivision = latestDivision[index]
//   }
//   return latestDivision
// }

const getTeacherWorkload = async (req, res) => {
  // get timetable
  const { id: _id } = req.params;
  const teacher = await Teacher.findById(_id);

  const timetableStr = await redisClient.get("timetable");
  const timetable = JSON.parse(timetableStr);

  const teacherSubjects = {};
  // see tr subjects
  for (const class_ of Object.keys(timetable)) {
    const classKeys = timetable[class_];
    for (const key of Object.keys(classKeys)) {
      const value = classKeys[key];
      if (value && value?.subject && value?.teachers) {
        const subjectBatches = value?.subject;
        const subjectArray = Object.values(subjectBatches);
        const teacherBatches = value?.teachers;
        const teacherArray = Object.values(teacherBatches);
        const teacherIndex = findTeacherInBatchArray(teacher.displayName, teacherArray)
        if (teacherIndex.length > 1) {
          const subject = subjectArray[teacherIndex[0]]
          if (!teacherSubjects[[subject, class_].join(" | ")]) {
            teacherSubjects[[subject, class_].join(" | ")] = 0;
          }
          teacherSubjects[[subject, class_].join(" | ")] += 1;
        }
      }
    }
  }
  console.log(teacherSubjects);
  const { name, displayName, username } = teacher.toObject();
  const trSubjectsArray = Object.entries(teacherSubjects).map(
    ([subject, allotted]) => ({
      subject: subject.split(" | ")[0],
      class: subject.split(" | ")[1],
      allotted: allotted,
    })
  );

  const subjectOrder = [
    "Math",
    "Eng",
    "Science",
    "SS",
    "Hindi",
    "Konkani",
    "French",
    "Mental Math",
    "CE",
    "Science Lab",
    "CH",
    "CK",
    "CF",
    "PE",
    "Games",
    "Yoga",
    "MA",
    "Art",
    "Music",
    "SD",
    "Dance",
    "Comp",
    "Library",
    "STEAM",
    "ATL",
    "WE",
    "GK",
    "LS",
    "H&W",
  ];
  trSubjectsArray.sort((a, b) => {
    return subjectOrder.indexOf(a.subject) - subjectOrder.indexOf(b.subject);
  });

  // return allotted
  return res.json({
    message: "Workload obtained successfully",
    teacher: { name, displayName, username },
    workload: trSubjectsArray,
  });
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  signupTeacher,
  getTeacherWorkload,
};

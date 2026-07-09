const sat = require("@ortools-node/cp-sat");

const teacherAssignments = {
  MUSLS: ["Gladson", "Melifa"],
  SDDANCE: ["Kimberly", "Melifa", "Mamta"],
  ENG: ["Melifa"],
  MATH: ["Shaefali"],
  BIO: ["Shilpa"],
  SCILWE: ["Lab", "Shwetambari"],
  CF: ["Shwetambari"],
  FRENCH: ["Shwetambari"],
  CFK: ["Shwetambari"],
  FK: ["Shwetambari"],
  CK: ["Reshma"],
  KONK: ["Reshma"],
  CHEM: ["Calorina"],
  LIB: ["Archana", "Nutan", "Shwetambari"],
  HINDI: ["Abha"],
  MUSGK: ["Gladson", "Rona"],
  PE: ["Sonia", "Sidharth"],
  PHYS: ["Priyanka"],
  ATLCE: ["Kavin", "Melifa"],
  ATLMA: ["Kavin", "Vilton"],
  GEOGECO: ["Rona"],
  HISTPS: ["Melifa"],
  COMP1: ["Prajakta", "Levendra"],
  COMP2: ["Levendra", "Prajakta"],
  ARTHW: ["Radha", "Neha", "Godeliva"],
  ARTCH: ["Radha", "Abha"],
  GAMES: ["Sonia", "Sidharth"],
  NSSNCC: ["Shwetambari", "Sidharth"],
  YOGAMM: ["Ashutosh", "Shaefali"],
};

async function main() {
  const dayList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const workload = {
    Shwetambari: {
      FK: 6,
      CFK: 1,
      NSSNCC: 1,
      ATLMA: 1,
      SCILWE: 1,
      MUSLS: 1,
      LIB: 1,
      SDDANCE: 1,
    },
    Melifa: {
      ENG: 5,
      ATLCE: 1,
      HISTPS: 3,
      SDDANCE: 1,
    },
    Shaefali: {
      MATH: 7,
      YOGAMM: 1,
    },
    Shilpa: {
      BIO: 3,
    },
    Calorina: {
      CHEM: 3,
    },
    Priyanka: {
      PHYS: 3,
    },
    Rona: {
      MUSGK: 1,
    },
  };
  const fullWorkload = {};
  Object.values(workload).forEach((teacherWl) => {
    Object.entries(teacherWl).forEach(([subject, count]) => {
      fullWorkload[subject] = (fullWorkload[subject] || 0) + count;
    });
  });
  console.log("yyz", workload, fullWorkload);
  const days = [
    ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"],
    ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"],
    ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9"],
    ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9"],
    ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
    ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"],
  ];
  const periods = days.flat();
  const totalSum = Object.values(fullWorkload).reduce(
    (prev, curr) => curr + prev,
    0,
  );
  fullWorkload.Free = 54 - totalSum;
  const constraints = [
    { putTogether: ["ATLCE", "ATLMA"] },
    { putTogether: ["ARTHW", "ARTCH"] },
    { putTogether: ["COMP1", "COMP2"] },
    { notSameDay: ["MUSGK", "MUSLS"] },
  ];
  const model = new sat.CpModel();

  //   const subjects = Object.entries(workload).map(([name, wl]) => [
  //     ...Object.keys(wl),
  //   ]).flat();
  const subjects = Object.keys(fullWorkload);
  console.log(subjects);

  // ------------------------
  // Variables
  // x[subject][period]
  // ------------------------

  const x = {};

  for (const subject of subjects) {
    x[subject] = {};

    for (const period of periods) {
      x[subject][period] = model.newBoolVar(`${subject}_P${period}`);
    }
  }
  console.log("HAHA", x);

  // ------------------------
  // One subject each period
  // ------------------------

  for (const period of periods) {
    model.addExactlyOne(subjects.map((subject) => x[subject][period]));
  }

  // ------------------------
  // Required number of periods
  // ------------------------

  for (const subject of subjects) {
    model.addEquality(
      sat.LinearExpr.sum(periods.map((period) => x[subject][period])),
      fullWorkload[subject],
    );
  }

  // ------------------------
  // Put subjects together
  // ------------------------

  const pairsByDay = {};
  for (const day of dayList) {
    pairsByDay[day] = [];
  }

  for (const constraint of constraints) {
    
    if (constraint.putTogether) {
      const [a, b] = constraint.putTogether;
      if (!x[a] || !x[b]) {
        console.warn(`Skipping constraint: ${a}, ${b}`);
        continue;
      }

      const possiblePairs = [];

      for (let day = 0; day < 6; day++) {
        // One boolean meaning "this pair is on this day"
        const pairOnDay = model.newBoolVar(`${a}_${b}_${dayList[day]}`);

        const dayPairs = [];

        for (let p = 0; p < 8; p++) {
          const first = periods[day * 9 + p];
          const second = periods[day * 9 + p + 1];

          const pair = model.newBoolVar(`${a}_${b}_${first}`);
          // console.log("xxx",a,b,first,x)
          model.addImplication(pair, x[a][first]);
          model.addImplication(pair, x[b][second]);

          model.addBoolOr([pair, x[a][first].not(), x[b][second].not()]);

          possiblePairs.push(pair);
          dayPairs.push(pair);
        }

        // If any slot on this day is chosen,
        // pairOnDay becomes true.
        for (const pair of dayPairs) {
          model.addImplication(pair, pairOnDay);
        }

        // If pairOnDay is true,
        // at least one slot on this day must be chosen.
        model.addBoolOr([pairOnDay.not(), ...dayPairs]);

        pairsByDay[dayList[day]].push(pairOnDay);
      }

      // Exactly one consecutive placement
      model.addExactlyOne(possiblePairs);
    } else if (constraint.notSameDay) {
      
      const [a, b] = constraint.notSameDay;
      if (!x[a] || !x[b]) {
        console.warn(`Skipping constraint: ${a}, ${b}`);
        continue;
      }
      console.log(a, b);
      console.log("x[a] exists?", !!x[a]);
      console.log("x[b] exists?", !!x[b]);

      for (const day of days) {
        model.addLessOrEqual(
          sat.LinearExpr.sum([
            ...day.map((p) => x[a][p]),
            ...day.map((p) => x[b][p]),
          ]),
          1,
        );
      }
    }
  }

  // More than two doubles
  for (const day of dayList) {
    const todayPairs = pairsByDay[day];
    console.log("pa", day, todayPairs, pairsByDay);
    model.addLessOrEqual(sat.LinearExpr.sum(todayPairs), 1);
  }

  // Single/Double allowed, triple not
  for (const subject of subjects) {
    for (const day of days) {
      for (let i = 0; i <= day.length - 3; i++) {
        model.addLessOrEqual(
          sat.LinearExpr.sum([
            x[subject][day[i]],
            x[subject][day[i + 1]],
            x[subject][day[i + 2]],
          ]),
          2,
        );
      }
    }
  }
  // SIngle recommended

  const isolated = [];

  for (const subject of subjects) {
    for (const day of days) {
      for (let i = 1; i < day.length - 1; i++) {
        const iso = model.newBoolVar(`${subject}_${day[i]}_isolated`);

        model.addImplication(iso, x[subject][day[i]]);
        model.addImplication(iso, x[subject][day[i - 1]].not());
        model.addImplication(iso, x[subject][day[i + 1]].not());

        model.addBoolOr([
          iso,
          x[subject][day[i]].not(),
          x[subject][day[i - 1]],
          x[subject][day[i + 1]],
        ]);

        isolated.push(iso);
      }
    }
  }

  model.maximize(sat.LinearExpr.sum(isolated));

  // ------------------------
  // Solve
  // ------------------------

  const solver = new sat.CpSolver();
  solver.parameters.randomSeed = Math.floor(Math.random() * 1_000_000);
  solver.parameters.randomizeSearch = true;

  const status = await solver.solve(model);

  if (
    status === sat.CpSolverStatus.OPTIMAL ||
    status === sat.CpSolverStatus.FEASIBLE
  ) {
    console.log("Timetable");

    const dayNames = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const timetable = [];

    days.forEach((day, dayIndex) => {
      const row = { Day: dayNames[dayIndex] };

      day.forEach((period, periodIndex) => {
        row[`P${periodIndex + 1}`] = subjects.find((s) =>
          solver.booleanValue(x[s][period]),
        );
      });

      timetable.push(row);
    });

    const ttteacherAssignments = [];
    timetable.forEach((day) => {
      const trassignment = { Day: day.Day };
      for (const [period, sub] of Object.entries(day).slice(1)) {
        trassignment[period] = teacherAssignments[sub];
      }
      ttteacherAssignments.push(trassignment);
    });
    console.table(timetable);
  } else {
    console.log("No solution");
  }
}

// async function mainPlus(workload, classes) {
//   const dayList = [
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//     "Sunday",
//   ];
//   const workloads = {
//     "8A": {
//       MUSLS: 1,
//       SDDANCE: 1,
//       ENG: 5,
//       MATH: 7,
//       BIO: 3,
//       SCILWE: 1,
//       CK: 1,
//       KONK: 6,
//       CHEM: 3,
//       LIB: 1,
//       HINDI: 5,
//       MUSGK: 1,
//       PE: 1,
//       PHYS: 3,
//       ATLCE: 1,
//       ATLMA: 1,
//       GEOGECO: 3,
//       HISTPS: 3,
//       COMP1: 1,
//       COMP2: 1,
//       ARTHW: 1,
//       ARTCH: 1,
//       GAMES: 1,
//       NSSNCC: 1,
//       YOGAMM: 1,
//     },

//     "8B": {
//       MUSLS: 1,
//       SDDANCE: 1,
//       ENG: 5,
//       MATH: 7,
//       BIO: 3,
//       SCILWE: 1,
//       CFK: 1,
//       FK: 6,
//       CHEM: 3,
//       LIB: 1,
//       HINDI: 5,
//       MUSGK: 1,
//       PE: 1,
//       PHYS: 3,
//       ATLCE: 1,
//       ATLMA: 1,
//       GEOGECO: 3,
//       HISTPS: 3,
//       COMP1: 1,
//       COMP2: 1,
//       ARTHW: 1,
//       ARTCH: 1,
//       GAMES: 1,
//       NSSNCC: 1,
//       YOGAMM: 1,
//     },

//     "8C": {
//       MUSLS: 1,
//       SDDANCE: 1,
//       ENG: 5,
//       MATH: 7,
//       BIO: 3,
//       SCILWE: 1,
//       CF: 1,
//       FRENCH: 6,
//       CHEM: 3,
//       LIB: 1,
//       HINDI: 5,
//       MUSGK: 1,
//       PE: 1,
//       PHYS: 3,
//       ATLCE: 1,
//       ATLMA: 1,
//       GEOGECO: 3,
//       HISTPS: 3,
//       COMP1: 1,
//       COMP2: 1,
//       ARTHW: 1,
//       ARTCH: 1,
//       GAMES: 1,
//       NSSNCC: 1,
//       YOGAMM: 1,
//     },
//   };
//   const days = [
//     ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9"],
//     ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"],
//     ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9"],
//     ["R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9"],
//     ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"],
//     ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"],
//   ];
//   const periods = days.flat();
//   const totalSum = Object.values(workloads).reduce(
//     (prev, curr) => curr + prev,
//     0,
//   );
//   const constraints = [
//     { putTogether: ["ATLCE", "ATLMA"] },
//     { putTogether: ["ARTHW", "ARTCH"] },
//     { putTogether: ["COMP1", "COMP2"] },
//     { notSameDay: ["MUSGK", "MUSLS"] },
//   ];
//   const model = new sat.CpModel();

//   //   const subjects = Object.entries(workload).map(([name, wl]) => [
//   //     ...Object.keys(wl),
//   //   ]).flat();
//   const classes = Object.keys(workloads);
//   const subjects = classes.map(classe => ({[classe]:Object.keys(workloads[classe])}));
//   console.log(subjects);

//   // ------------------------
//   // Variables
//   // x[classe][subject][period]
//   // ------------------------

//   const x = {};
//   for (const classe of classes) {
//     x[classe] = {};
//     for (const subject of subjects) {
//     x[classe][subject] = {};
//     for (const period of periods) {
//       x[classe][subject][period] = model.newBoolVar(`${classe}_${subject}_P${period}`);
//     }
//   }
//   }

//   // ------------------------
//   // Teacher cannot teach two classes at once
//   // ------------------------

//   for (const period of periods) {
//     for (const teacher of [
//       ...new Set(Object.values(teacherAssignments).flat()),
//     ]) {
//       const teacherSubjects = Object.keys(teacherAssignments).filter(
//         (subject) => teacherAssignments[subject].includes(teacher),
//       );

//       model.addLessOrEqual(
//         sat.LinearExpr.sum(
//           classes.flatMap((classe) =>
//             teacherSubjects.map((subject) => x[classe][subject][period]),
//           ),
//         ),
//         1,
//       );
//     }
//   }
//   console.log("HAHA", x);
//   for (const period of periods) {
//     model.addEquality(
//         x["8A"]["FRENCH"][period],
//         x["8B"]["KONK"][period]
//     );
// }
//   for (const classe of classes) {
//     // ------------------------
//     // One subject each period
//     // ------------------------

//     for (const period of periods) {
//       model.addExactlyOne(
//         subjects.map((subject) => x[classe][subject][period]),
//       );
//     }

//     // ------------------------
//     // Required number of periods
//     // ------------------------

//     for (const subject of subjects) {
//       model.addEquality(
//         sat.LinearExpr.sum(periods.map((period) => x[classe][subject][period])),
//         workloads[classe][subject],
//       );
//     }

//     // ------------------------
//     // Put subjects together
//     // ------------------------

//     const pairsByDay = {};
//     for (const day of dayList) {
//       pairsByDay[day] = [];
//     }

//     for (const constraint of constraints) {
//       if (constraint.putTogether) {
//         const [a, b] = constraint.putTogether;

//         const possiblePairs = [];

//         for (let day = 0; day < 6; day++) {
//           // One boolean meaning "this pair is on this day"
//           const pairOnDay = model.newBoolVar(`${a}_${b}_${dayList[day]}`);

//           const dayPairs = [];

//           for (let p = 0; p < 8; p++) {
//             const first = periods[day * 9 + p];
//             const second = periods[day * 9 + p + 1];

//             const pair = model.newBoolVar(`${a}_${b}_${first}`);

//             model.addImplication(pair, x[classe][a][first]);
//             model.addImplication(pair, x[classe][b][second]);

//             model.addBoolOr([
//               pair,
//               x[classe][a][first].not(),
//               x[classe][b][second].not(),
//             ]);

//             possiblePairs.push(pair);
//             dayPairs.push(pair);
//           }

//           // If any slot on this day is chosen,
//           // pairOnDay becomes true.
//           for (const pair of dayPairs) {
//             model.addImplication(pair, pairOnDay);
//           }

//           // If pairOnDay is true,
//           // at least one slot on this day must be chosen.
//           model.addBoolOr([pairOnDay.not(), ...dayPairs]);

//           pairsByDay[dayList[day]].push(pairOnDay);
//         }

//         // Exactly one consecutive placement
//         model.addExactlyOne(possiblePairs);
//       } else if (constraint.notSameDay) {
//         const [a, b] = constraint.notSameDay;

//         for (const day of days) {
//           model.addLessOrEqual(
//             sat.LinearExpr.sum([
//               ...day.map((p) => x[classe][a][p]),
//               ...day.map((p) => x[classe][b][p]),
//             ]),
//             1,
//           );
//         }
//       }
//     }

//     // More than two doubles
//     for (const day of dayList) {
//       const todayPairs = pairsByDay[day];
//       console.log("pa", day, todayPairs, pairsByDay);
//       model.addLessOrEqual(sat.LinearExpr.sum(todayPairs), 1);
//     }

//     // Single/Double allowed, triple not
//     for (const subject of subjects) {
//       for (const day of days) {
//         for (let i = 0; i <= day.length - 3; i++) {
//           model.addLessOrEqual(
//             sat.LinearExpr.sum([
//               x[classe][subject][day[i]],
//               x[classe][subject][day[i + 1]],
//               x[classe][subject][day[i + 2]],
//             ]),
//             2,
//           );
//         }
//       }
//     }
//     // SIngle recommended

//     const isolated = [];

//     for (const subject of subjects) {
//       for (const day of days) {
//         for (let i = 1; i < day.length - 1; i++) {
//           const iso = model.newBoolVar(`${subject}_${day[i]}_isolated`);

//           model.addImplication(iso, x[classe][subject][day[i]]);
//           model.addImplication(iso, x[classe][subject][day[i - 1]].not());
//           model.addImplication(iso, x[classe][subject][day[i + 1]].not());

//           model.addBoolOr([
//             iso,
//             x[classe][subject][day[i]].not(),
//             x[classe][subject][day[i - 1]],
//             x[classe][subject][day[i + 1]],
//           ]);

//           isolated.push(iso);
//         }
//       }
//     }

//     model.maximize(sat.LinearExpr.sum(isolated));
//   }

//   // ------------------------
//   // Solve
//   // ------------------------

//   const solver = new sat.CpSolver();
//   solver.parameters.randomSeed = Math.floor(Math.random() * 1_000_000);
//   solver.parameters.randomizeSearch = true;

//   const status = await solver.solve(model);

//   for (const classe of classes) {
//     console.log(`\n${classe}`);

//     const timetable = [];

//     days.forEach((day, dayIndex) => {
//       const row = { Day: dayList[dayIndex] };

//       day.forEach((period, periodIndex) => {
//         row[`P${periodIndex + 1}`] = subjects.find((s) =>
//           solver.booleanValue(x[classe][s][period]),
//         );
//       });

//       timetable.push(row);
//     });

//     console.table(timetable);
//   }
// }

main();

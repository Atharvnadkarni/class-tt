/**
 * Single Class Timetable Generator with Sequential Class Support
 * Generates timetables for one class at a time, considering previously generated classes
 */

class SingleClassTimetableGenerator {
  constructor(workloads, totalConstraints) {
    this.workloads = workloads;
    this.totalConstraints = totalConstraints;

    // Static storage for all generated timetables
    if (!SingleClassTimetableGenerator.existingTimetables) {
      SingleClassTimetableGenerator.existingTimetables = {};
    }

    // Initialize the base TimetableGenerator
    this.generator = new TimetableGenerator(
      this.mergeConstraints(workloads, totalConstraints),
    );

    this.timetable = this.initializeTimetable();
    this.subjectAllocation = this.initializeSubjectAllocation();
    if (!SingleClassTimetableGenerator.forcedSlots) {
      SingleClassTimetableGenerator.forcedSlots = {};
    }
  }

  /**
   * Static method to get all existing timetables
   */
  static getExistingTimetables() {
    return SingleClassTimetableGenerator.existingTimetables || {};
  }

  /**
   * Static method to clear all existing timetables
   */
  static clearExistingTimetables() {
    SingleClassTimetableGenerator.existingTimetables = {};
  }

  /**
   * Static method to get timetable for a specific class
   */
  static getTimetable(className) {
    return SingleClassTimetableGenerator.existingTimetables[className];
  }

  /**
   * Initialize empty timetable structure
   */
  initializeTimetable() {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const timetable = {};

    for (const day of days) {
      for (const period of periods) {
        timetable[`${day}-${period}`] = {
          subject: {},
          teachers: {},
        };
      }
    }

    return timetable;
  }

  /**
   * Initialize subject allocation tracking
   */
  initializeSubjectAllocation() {
    const allocation = {};

    for (const teacher in this.workloads) {
      if (teacher === "constraints") continue;

      allocation[teacher] = {};
      for (const subject in this.workloads[teacher].subjects) {
        allocation[teacher][subject] =
          this.workloads[teacher].subjects[subject];
      }
    }

    return allocation;
  }

  /**
   * Merge simplified constraints with totalConstraints
   */
  mergeConstraints(workload, totalConstraints) {
    const merged = JSON.parse(JSON.stringify(workload));

    if (!merged.constraints) {
      merged.constraints = {};
    }

    if (
      merged.constraints.notfirst &&
      Array.isArray(merged.constraints.notfirst)
    ) {
      for (const teacher in merged) {
        if (teacher !== "constraints" && merged[teacher].subjects) {
          if (!merged[teacher].subjectValues) {
            merged[teacher].subjectValues = {};
          }

          for (const subject in merged[teacher].subjects) {
            if (merged.constraints.notfirst.includes(subject)) {
              merged[teacher].subjectValues[subject] = "Notfirst";
            }
          }
        }
      }

      delete merged.constraints.notfirst;
    }

    if (totalConstraints) {
      merged.constraints.notSameDay = totalConstraints.notSameDay || [];

      merged.constraints.nextTo = totalConstraints.nextTo || [];

      merged.constraints.batchwisies = totalConstraints.batchwisies || [];

      merged.constraints.farfaraway = totalConstraints.farfaraway || [];

      merged.constraints.sameDayInAllClasses =
        totalConstraints.sameDayInAllClasses || [];

      // NEW
      merged.constraints.putTogether = totalConstraints.putTogether || [];
    }

    return merged;
  }

  /**
   * Generate timetable for this class, considering existing timetables
   */
  generate(className) {
    // NEW
    this.currentClassName = className;

    console.log(`\n🎯 Generating timetable for class ${className}`);

    const existingTimetables =
      SingleClassTimetableGenerator.getExistingTimetables();

    const batchSubjects = this.generator.getAllBatchSubjects();

    const teachers = this.generator.teachers;

    for (const teacher of teachers) {
      const subjects = Object.keys(this.workloads[teacher].subjects);

      for (const subject of subjects) {
        if (batchSubjects.has(subject)) {
          continue;
        }

        if (this.isSubjectAlreadyAllocated(subject)) {
          this.subjectAllocation[teacher][subject]--;
          continue;
        }

        while (this.subjectAllocation[teacher][subject] > 0) {
          const validSlots = this.getAvailableValidSlots(subject, teacher);

          if (validSlots.length === 0) {
            console.warn(`No valid slots for ${subject}`);
            break;
          }

          const weights = this.generator.calculateSlotWeights(
            validSlots,
            teacher,
            subject,
          );

          const selectedSlot = this.generator.weightedRNG(validSlots, weights);

          const allocationSuccess = this.allocateSlot(
            selectedSlot,
            subject,
            teacher,
          );

          if (!allocationSuccess) {
            continue;
          }

          // NEW
          this.handlePutTogetherConstraint(subject, selectedSlot);

          const batchInfo = this.generator.getBatchAssignment(subject);

          const hasNextTo =
            this.generator.constraints.nextTo &&
            this.generator.constraints.nextTo.some((pair) =>
              pair.includes(subject),
            );

          if (batchInfo.isInBatchwises && hasNextTo) {
            this.generator.handleNextToConstraint(
              subject,
              teacher,
              selectedSlot,
            );

            this.updateAllocationFromNextTo(subject);

            this.handleBatchwiseAllocation(subject, batchInfo, selectedSlot);

            if (batchInfo.pairedSubject) {
              let pairedTeacher = null;

              for (const t of Object.keys(this.subjectAllocation)) {
                if (this.subjectAllocation[t][batchInfo.pairedSubject] > 0) {
                  pairedTeacher = t;
                  break;
                }
              }

              if (pairedTeacher) {
                this.generator.allocateSlot(
                  selectedSlot,
                  batchInfo.pairedSubject,
                  pairedTeacher,
                );

                this.subjectAllocation[pairedTeacher][
                  batchInfo.pairedSubject
                ]--;
              }
            }

            this.syncTimetableFromBaseGenerator();
          } else if (batchInfo.isInBatchwises) {
            this.generator.handleBatchwisesNextToConstraint(
              subject,
              teacher,
              selectedSlot,
            );

            this.handleBatchwiseAllocation(subject, batchInfo, selectedSlot);
          } else {
            this.generator.handleNextToConstraint(
              subject,
              teacher,
              selectedSlot,
            );

            this.updateAllocationFromNextTo(subject);

            this.syncTimetableFromBaseGenerator();
          }

          this.generator.handleFarfarawayConstraint(
            subject,
            teacher,
            selectedSlot,
          );
        }
      }
    }

    if (Object.keys(existingTimetables).length > 0) {
      this.handleSameDayInAllClassesConstraints();
    }

    this.storeTimetable(className);

    return this.timetable;
  }

  /**
   * Store the generated timetable in static storage
   */
  storeTimetable(className) {
    SingleClassTimetableGenerator.existingTimetables[className] = JSON.parse(
      JSON.stringify(this.timetable),
    );
    console.log(`💾 Stored timetable for class ${className}`);
  }

  /**
   * Get available valid slots considering existing timetables
   */
  getAvailableValidSlots(subject, teacher) {
    const allValidSlots = this.generator.getValidSlots();

    const availableSlots = [];

    // NEW
    const forcedSlot =
      SingleClassTimetableGenerator.forcedSlots?.[this.currentClassName]?.[
        subject
      ];

    // NEW
    const putTogetherPair = this.getPutTogetherPair(
      subject,
      this.currentClassName,
    );

    for (const slot of allValidSlots) {
      // NEW
      if (forcedSlot && slot !== forcedSlot) {
        continue;
      }

      // NEW
      if (putTogetherPair) {
        const partnerSlot = this.findSubjectSlotInClass(
          putTogetherPair.className,
          putTogetherPair.subject,
        );

        // Partner already placed,
        // MUST use same slot
        if (partnerSlot && partnerSlot !== slot) {
          continue;
        }
      }

      if (!this.generator.isValidSlot(slot, subject, teacher)) {
        continue;
      }

      const subjectBatchInfo = this.generator.getBatchAssignment(subject);

      const isBatchwise = subjectBatchInfo.isInBatchwises;

      if (
        Object.keys(this.timetable[slot].subject).length > 0 &&
        !isBatchwise
      ) {
        continue;
      }

      if (isBatchwise && Object.keys(this.timetable[slot].subject).length > 0) {
        const existingSubjects = Object.values(this.timetable[slot].subject);

        const isPartnerInSlot = this.generator.batchwisies.some(
          ([subjects]) =>
            subjects.includes(subject) &&
            subjects.some((s) => existingSubjects.includes(s)),
        );

        if (!isPartnerInSlot) {
          continue;
        }
      }

      const hasClash = this.hasTeacherClashWithExistingTimetables(
        slot,
        teacher,
      );

      if (!hasClash) {
        if (
          this.totalConstraints.noConsecutive &&
          this.hasConsecutiveSubject(slot, subject)
        ) {
          continue;
        }

        availableSlots.push(slot);
      } else {
        const resolved = this.tryResolveClash(slot, teacher);

        if (resolved) {
          if (
            this.totalConstraints.noConsecutive &&
            this.hasConsecutiveSubject(slot, subject)
          ) {
            continue;
          }

          availableSlots.push(slot);
        }
      }
    }

    return availableSlots;
  }

  /**
   * Handle batchwise allocation for a subject
   */
  findSubjectSlotInClass(className, subject) {
    const timetable = SingleClassTimetableGenerator.getTimetable(className);

    if (!timetable) return null;

    for (const [slot, slotData] of Object.entries(timetable)) {
      if (
        slotData.subject &&
        Object.values(slotData.subject).includes(subject)
      ) {
        return slot;
      }
    }

    return null;
  }

  getPutTogetherPair(subject, className) {
    const constraints = this.totalConstraints.putTogether || [];

    for (const pair of constraints) {
      const [[subj1, class1], [subj2, class2]] = pair;

      if (subject === subj1 && className === class1) {
        return {
          subject: subj2,
          className: class2,
        };
      }

      if (subject === subj2 && className === class2) {
        return {
          subject: subj1,
          className: class1,
        };
      }
    }

    return null;
  }

  handlePutTogetherConstraint(subject, slot) {
    const pair = this.getPutTogetherPair(subject, this.currentClassName);

    if (!pair) return;

    // If paired class already generated,
    // validate same slot exists
    const existingTimetable = SingleClassTimetableGenerator.getTimetable(
      pair.className,
    );

    if (existingTimetable) {
      const existingSlot = this.findSubjectSlotInClass(
        pair.className,
        pair.subject,
      );

      if (existingSlot && existingSlot !== slot) {
        console.warn(
          `❌ putTogether violation:
${subject} (${this.currentClassName}) at ${slot}
but ${pair.subject} (${pair.className}) at ${existingSlot}`,
        );
      }

      return;
    }

    // Store forced slot for future generation
    if (!SingleClassTimetableGenerator.forcedSlots[pair.className]) {
      SingleClassTimetableGenerator.forcedSlots[pair.className] = {};
    }

    SingleClassTimetableGenerator.forcedSlots[pair.className][pair.subject] =
      slot;

    console.log(`🔒 Forced ${pair.subject} (${pair.className}) -> ${slot}`);
  }

  handleBatchwiseAllocation(subject, batchInfo, selectedSlot) {
    console.log(`🔄 Handling batchwise allocation for ${subject}`);

    if (batchInfo.pairedSubject) {
      // This subject has a paired subject (like ATL1 paired with MA)
      console.log(
        `Found paired subject: ${batchInfo.pairedSubject} for ${subject}`,
      );

      // Find the teacher for the paired subject
      let pairedTeacher = null;
      for (const t of Object.keys(this.subjectAllocation)) {
        if (this.subjectAllocation[t][batchInfo.pairedSubject] > 0) {
          pairedTeacher = t;
          break;
        }
      }

      if (pairedTeacher) {
        console.log(
          `Allocating paired subject ${batchInfo.pairedSubject} taught by ${pairedTeacher} to same slot ${selectedSlot}`,
        );

        // Allocate the paired subject to the same slot with next available key
        const currentKeys = Object.keys(this.timetable[selectedSlot].subject);
        const nextKey =
          currentKeys.length > 0 ? Math.max(...currentKeys.map(Number)) + 1 : 1;

        this.timetable[selectedSlot].subject[nextKey] = batchInfo.pairedSubject;

        // Ensure teachers object exists
        if (!this.timetable[selectedSlot].teachers) {
          this.timetable[selectedSlot].teachers = {};
        }

        this.timetable[selectedSlot].teachers[nextKey] = [pairedTeacher];
        this.subjectAllocation[pairedTeacher][batchInfo.pairedSubject]--;
        console.log(
          `✅ Allocated ${pairedTeacher}'s ${batchInfo.pairedSubject} to ${selectedSlot} (key: ${nextKey})`,
        );
      }
    } else {
      // Single subject without pairing - allocate normally
      console.log(`Single subject batchwise: ${subject}`);
    }
  }

  /**
   * Sync timetable from base generator after nextTo constraint placements
   */
  syncTimetableFromBaseGenerator() {
    for (const slot in this.generator.timetable) {
      const baseSlotData = this.generator.timetable[slot];
      const mySlotData = this.timetable[slot];

      // If base generator has subjects that we don't have, copy them
      if (
        baseSlotData.subject &&
        Object.keys(baseSlotData.subject).length > 0
      ) {
        if (
          !mySlotData.subject ||
          Object.keys(mySlotData.subject).length === 0
        ) {
          // Convert base generator array format to object format
          this.timetable[slot].subject = {};
          this.timetable[slot].teachers = {};

          if (Array.isArray(baseSlotData.subject)) {
            // Convert array to object with numbered keys
            baseSlotData.subject.forEach((subject, index) => {
              // Handle nested arrays (from batchwise allocation)
              let cleanSubject = subject;
              console.log(
                `DEBUG: Processing subject at index ${index}:`,
                JSON.stringify(subject),
                typeof subject,
              );

              if (Array.isArray(subject)) {
                cleanSubject = subject[0]; // Extract the actual subject name
                console.log(`DEBUG: Extracted from array: ${cleanSubject}`);
              } else if (typeof subject === "string") {
                cleanSubject = subject;
                console.log(`DEBUG: Using string directly: ${cleanSubject}`);
              } else {
                console.log(
                  `DEBUG: Unexpected subject type: ${typeof subject}`,
                  subject,
                );
                cleanSubject = String(subject); // Convert to string as fallback
              }

              this.timetable[slot].subject[index + 1] = cleanSubject;
              console.log(`DEBUG: Final assignment: ${cleanSubject}`);

              // Handle teacher assignment
              let teacherData = baseSlotData.teacher?.[index] || ["Unknown"];
              if (!Array.isArray(teacherData)) {
                teacherData = [teacherData]; // Ensure it's always an array
              }

              this.timetable[slot].teachers[index + 1] = teacherData;

              console.log(
                `Converted ${JSON.stringify(subject)} -> ${cleanSubject} with teacher ${teacherData[0]}`,
              );
            });
          } else if (
            baseSlotData.subject &&
            typeof baseSlotData.subject === "object"
          ) {
            // Copy object format directly
            this.timetable[slot].subject = { ...baseSlotData.subject };
            this.timetable[slot].teachers = { ...baseSlotData.teachers };
          }

          console.log(
            `Synced slot ${slot} from base generator (converted format)`,
          );

          // Ensure teachers object exists after copying
          if (!this.timetable[slot].teachers) {
            this.timetable[slot].teachers = {};
          }
        } else {
          // Merge subjects from base generator into our slot
          let merged = false;

          // Handle array format from base generator
          if (Array.isArray(baseSlotData.subject)) {
            baseSlotData.subject.forEach((subject, index) => {
              // Handle nested arrays (from batchwise allocation)
              let cleanSubject = subject;
              console.log(
                `DEBUG MERGE: Processing subject at index ${index}:`,
                JSON.stringify(subject),
                typeof subject,
              );

              if (Array.isArray(subject)) {
                cleanSubject = subject[0]; // Extract the actual subject name
                console.log(
                  `DEBUG MERGE: Extracted from array: ${cleanSubject}`,
                );
              } else if (typeof subject === "string") {
                cleanSubject = subject;
                console.log(
                  `DEBUG MERGE: Using string directly: ${cleanSubject}`,
                );
              } else {
                console.log(
                  `DEBUG MERGE: Unexpected subject type: ${typeof subject}`,
                  subject,
                );
                cleanSubject = String(subject); // Convert to string as fallback
              }

              // Check if this subject is part of a nextTo pair and the adjacent slot has its pair
              let isNextToPairInAdjacentSlot = false;
              if (this.generator.constraints.nextTo) {
                for (const [subj1, subj2] of this.generator.constraints
                  .nextTo) {
                  if (cleanSubject === subj1 || cleanSubject === subj2) {
                    const pairSubject = cleanSubject === subj1 ? subj2 : subj1;

                    // Check if the adjacent slot has the paired subject
                    const [day, periodStr] = slot.split("-");
                    const period = parseInt(periodStr);
                    const adjacentSlots = [];
                    if (period > 1) adjacentSlots.push(`${day}-${period - 1}`);
                    if (period < 9) adjacentSlots.push(`${day}-${period + 1}`);

                    for (const adjSlot of adjacentSlots) {
                      if (
                        this.timetable[adjSlot] &&
                        Object.values(
                          this.timetable[adjSlot].subject || {},
                        ).includes(pairSubject)
                      ) {
                        isNextToPairInAdjacentSlot = true;
                        console.log(
                          `DEBUG MERGE: ${cleanSubject} is nextTo pair with ${pairSubject} in adjacent slot ${adjSlot}`,
                        );
                        break;
                      }
                    }
                    break;
                  }
                }
              }

              // Check if this subject is part of a batchwise pair and the slot has its batchwise partner
              let isBatchwisePartnerInSlot = false;
              if (this.generator.constraints.batchwisies) {
                for (const [subjects, partners] of this.generator.constraints
                  .batchwisies) {
                  // Check if current subject is a partner of any subject in the slot
                  if (partners.includes(cleanSubject)) {
                    // Check if any subject from the subjects array is in the current slot
                    for (const subject of subjects) {
                      if (Object.values(mySlotData.subject).includes(subject)) {
                        isBatchwisePartnerInSlot = true;
                        console.log(
                          `DEBUG MERGE: ${cleanSubject} is batchwise partner with ${subject} in slot ${slot}`,
                        );
                        break;
                      }
                    }
                  }
                  // Also check if current subject is in the subjects array and its partner is in the slot
                  if (subjects.includes(cleanSubject)) {
                    for (const partner of partners) {
                      if (Object.values(mySlotData.subject).includes(partner)) {
                        isBatchwisePartnerInSlot = true;
                        console.log(
                          `DEBUG MERGE: ${cleanSubject} is batchwise partner with ${partner} in slot ${slot}`,
                        );
                        break;
                      }
                    }
                  }
                  if (isBatchwisePartnerInSlot) break;
                }
              }

              // Check if subject is already in the target slot to prevent duplicates
              const subjectAlreadyInSlot = Object.values(
                mySlotData.subject,
              ).includes(cleanSubject);

              // Debug logging
              console.log(
                `DEBUG MERGE: Slot ${slot} has ${Object.keys(mySlotData.subject).length} subjects: [${Object.values(mySlotData.subject).join(", ")}]`,
              );
              console.log(
                `DEBUG MERGE: subjectAlreadyInSlot=${subjectAlreadyInSlot}, isNextToPairInAdjacentSlot=${isNextToPairInAdjacentSlot}, isBatchwisePartnerInSlot=${isBatchwisePartnerInSlot}`,
              );

              // Allow merge if slot is empty, if it's the same subject, if it's a nextTo pair placement, or if it's a batchwise partner, but not if already present
              // Also prevent more than 2 subjects per slot, but allow batchwise partners to replace non-batchwise subjects
              const slotHasRoom = Object.keys(mySlotData.subject).length < 2;
              const slotIsFullWithNonBatchwise =
                Object.keys(mySlotData.subject).length === 2 &&
                !isBatchwisePartnerInSlot;

              // Special case: allow batchwise partner to replace non-batchwise subject if slot is full
              if (isBatchwisePartnerInSlot && slotIsFullWithNonBatchwise) {
                // Find and replace non-batchwise subject
                for (const [key, existingSubject] of Object.entries(
                  mySlotData.subject,
                )) {
                  if (
                    existingSubject !== cleanSubject &&
                    !this.isBatchwisePartner(existingSubject, cleanSubject)
                  ) {
                    console.log(
                      `Replacing non-batchwise ${existingSubject} with batchwise partner ${cleanSubject} in slot ${slot}`,
                    );
                    mySlotData.subject[key] = cleanSubject;

                    // Update teacher assignment
                    if (mySlotData.teachers) {
                      let teacherData = baseSlotData.teacher?.[index] || [
                        "Unknown",
                      ];
                      if (!Array.isArray(teacherData)) {
                        teacherData = [teacherData];
                      }
                      mySlotData.teachers[key] = teacherData;
                    }
                    console.log(
                      `Merged ${cleanSubject} into slot ${slot} (replaced non-batchwise subject)`,
                    );
                    merged = true;
                    break;
                  }
                }
              }

              // Additional check: if this is a batchwise partner and slot has wrong subjects, force replacement
              if (
                isBatchwisePartnerInSlot &&
                Object.keys(mySlotData.subject).length === 2
              ) {
                const slotSubjects = Object.values(mySlotData.subject);
                const hasCorrectPartner = slotSubjects.includes(cleanSubject);
                const hasWrongSubject = slotSubjects.some(
                  (s) =>
                    s !== cleanSubject &&
                    !this.isBatchwisePartner(s, cleanSubject),
                );

                if (hasWrongSubject && !hasCorrectPartner) {
                  // Find wrong subject to replace
                  for (const [key, existingSubject] of Object.entries(
                    mySlotData.subject,
                  )) {
                    if (
                      existingSubject !== cleanSubject &&
                      !this.isBatchwisePartner(existingSubject, cleanSubject)
                    ) {
                      console.log(
                        `FORCE REPLACING wrong subject ${existingSubject} with batchwise partner ${cleanSubject} in slot ${slot}`,
                      );
                      mySlotData.subject[key] = cleanSubject;

                      // Update teacher assignment
                      if (mySlotData.teachers) {
                        let teacherData = baseSlotData.teacher?.[index] || [
                          "Unknown",
                        ];
                        if (!Array.isArray(teacherData)) {
                          teacherData = [teacherData];
                        }
                        mySlotData.teachers[key] = teacherData;
                      }
                      console.log(
                        `FORCE MERGED ${cleanSubject} into slot ${slot} (replaced wrong subject)`,
                      );
                      merged = true;
                      break;
                    }
                  }
                }
              }

              if (
                !subjectAlreadyInSlot &&
                slotHasRoom &&
                (Object.keys(mySlotData.subject).length === 0 ||
                  (Object.keys(mySlotData.subject).length === 1 &&
                    Object.values(mySlotData.subject).includes(cleanSubject)) ||
                  isNextToPairInAdjacentSlot ||
                  isBatchwisePartnerInSlot)
              ) {
                const nextKey =
                  Object.keys(mySlotData.subject).length > 0
                    ? Math.max(...Object.keys(mySlotData.subject).map(Number)) +
                      1
                    : 1;

                mySlotData.subject[nextKey] = cleanSubject;

                // Ensure teachers object exists
                if (!mySlotData.teachers) {
                  mySlotData.teachers = {};
                }

                // Handle teacher assignment
                let teacherData = baseSlotData.teacher?.[index] || ["Unknown"];
                if (!Array.isArray(teacherData)) {
                  teacherData = [teacherData]; // Ensure it's always an array
                }

                mySlotData.teachers[nextKey] = teacherData;
                console.log(
                  `Merged ${cleanSubject} into slot ${slot} from base generator`,
                );
                merged = true;
              } else {
                console.warn(
                  `Skipping merge of ${cleanSubject} into ${slot} - slot already occupied with other subjects`,
                );
              }
            });
          } else if (
            baseSlotData.subject &&
            typeof baseSlotData.subject === "object"
          ) {
            // Handle object format
            for (const [key, subject] of Object.entries(baseSlotData.subject)) {
              // Check if this subject is part of a nextTo pair and the adjacent slot has its pair
              let isNextToPairInAdjacentSlot = false;
              if (this.generator.constraints.nextTo) {
                for (const [subj1, subj2] of this.generator.constraints
                  .nextTo) {
                  if (subject === subj1 || subject === subj2) {
                    const pairSubject = subject === subj1 ? subj2 : subj1;

                    // Check if the adjacent slot has the paired subject
                    const [day, periodStr] = slot.split("-");
                    const period = parseInt(periodStr);
                    const adjacentSlots = [];
                    if (period > 1) adjacentSlots.push(`${day}-${period - 1}`);
                    if (period < 9) adjacentSlots.push(`${day}-${period + 1}`);

                    for (const adjSlot of adjacentSlots) {
                      if (
                        this.timetable[adjSlot] &&
                        Object.values(
                          this.timetable[adjSlot].subject || {},
                        ).includes(pairSubject)
                      ) {
                        isNextToPairInAdjacentSlot = true;
                        console.log(
                          `DEBUG MERGE OBJ: ${subject} is nextTo pair with ${pairSubject} in adjacent slot ${adjSlot}`,
                        );
                        break;
                      }
                    }
                    break;
                  }
                }
              }

              // Check if subject is already in the target slot to prevent duplicates
              const subjectAlreadyInSlot = Object.values(
                mySlotData.subject,
              ).includes(subject);

              // Allow merge if slot is empty, if it's the same subject, or if it's a nextTo pair placement, but not if already present
              // Also prevent more than 2 subjects per slot
              const slotHasRoom = Object.keys(mySlotData.subject).length < 2;

              if (
                !subjectAlreadyInSlot &&
                slotHasRoom &&
                (Object.keys(mySlotData.subject).length === 0 ||
                  (Object.keys(mySlotData.subject).length === 1 &&
                    Object.values(mySlotData.subject).includes(subject)) ||
                  isNextToPairInAdjacentSlot)
              ) {
                const nextKey =
                  Object.keys(mySlotData.subject).length > 0
                    ? Math.max(...Object.keys(mySlotData.subject).map(Number)) +
                      1
                    : 1;

                mySlotData.subject[nextKey] = subject;

                // Ensure teachers object exists
                if (!mySlotData.teachers) {
                  mySlotData.teachers = {};
                }

                if (baseSlotData.teachers && baseSlotData.teachers[key]) {
                  mySlotData.teachers[nextKey] = baseSlotData.teachers[key];
                } else {
                  mySlotData.teachers[nextKey] = []; // Fallback to empty array
                }
                console.log(
                  `Merged ${subject} into slot ${slot} from base generator`,
                );
                merged = true;
              } else {
                console.warn(
                  `Skipping merge of ${subject} into ${slot} - slot already occupied with other subjects`,
                );
              }
            }
          }

          if (merged) {
            console.log(`Updated slot ${slot} with merged subjects`);
          }
        }
      }
    }

    // Post-sync validation: ensure no arrays remain in final timetable
    this.validateAndCleanTimetable();
  }

  /**
   * Validate and clean any remaining arrays in the timetable
   */
  isBatchwisePartner(subject1, subject2) {
    if (!this.generator.constraints.batchwisies) return false;

    for (const [subjects, partners] of this.generator.constraints.batchwisies) {
      // Check if subject1 and subject2 are batchwise partners
      if (
        (subjects.includes(subject1) && partners.includes(subject2)) ||
        (subjects.includes(subject2) && partners.includes(subject1))
      ) {
        return true;
      }
    }
    return false;
  }

  hasConsecutiveSubject(slot, subject) {
    const [day, periodStr] = slot.split("-");
    const period = parseInt(periodStr);

    // Check previous period
    if (period > 1) {
      const prevSlot = `${day}-${period - 1}`;
      const prevSlotData = this.timetable[prevSlot];
      if (prevSlotData && prevSlotData.subject) {
        const prevSubjects = Object.values(prevSlotData.subject);
        // Check if any subject in previous slot is the same as current subject
        if (prevSubjects.includes(subject)) {
          return true;
        }
      }
    }

    // Check next period
    if (period < 9) {
      const nextSlot = `${day}-${period + 1}`;
      const nextSlotData = this.timetable[nextSlot];
      if (nextSlotData && nextSlotData.subject) {
        const nextSubjects = Object.values(nextSlotData.subject);
        // Check if any subject in next slot is the same as current subject
        if (nextSubjects.includes(subject)) {
          return true;
        }
      }
    }

    return false;
  }

  validateAndCleanTimetable() {
    console.log("DEBUG: Validating and cleaning timetable...");

    for (const slot in this.timetable) {
      const slotData = this.timetable[slot];

      // Check for duplicate subjects in the same slot
      const subjects = Object.values(slotData.subject || {});
      const subjectCounts = {};

      for (const subject of subjects) {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      }

      // Handle duplicate subjects
      for (const [subject, count] of Object.entries(subjectCounts)) {
        if (count > 1) {
          console.log(
            `DEBUG: Found duplicate subject ${subject} in ${slot} (${count} times)`,
          );
          this.handleDuplicateSubjectsInSlot(slot, subject, count);
        }
      }

      // Clean subject arrays
      for (const [key, subject] of Object.entries(slotData.subject || {})) {
        if (Array.isArray(subject)) {
          console.log(
            `DEBUG: Found array in ${slot}.subject.${key}:`,
            JSON.stringify(subject),
          );
          if (subject.length > 0) {
            slotData.subject[key] = subject[0]; // Extract first element
            console.log(
              `DEBUG: Cleaned ${slot}.subject.${key} to:`,
              slotData.subject[key],
            );
          } else {
            delete slotData.subject[key]; // Remove empty arrays
            console.log(
              `DEBUG: Removed empty array from ${slot}.subject.${key}`,
            );
          }
        }
      }

      // Clean teacher arrays and handle duplicate subjects
      for (const [key, teacher] of Object.entries(slotData.teachers || {})) {
        if (!Array.isArray(teacher)) {
          console.log(
            `DEBUG: Found non-array teacher in ${slot}.teachers.${key}:`,
            JSON.stringify(teacher),
          );
          slotData.teachers[key] = [teacher]; // Convert to array
          console.log(
            `DEBUG: Converted ${slot}.teachers.${key} to array:`,
            slotData.teachers[key],
          );
        }
      }
    }

    console.log("DEBUG: Timetable validation complete");
  }

  /**
   * Handle duplicate subjects in the same slot by redistributing them
   */
  handleDuplicateSubjectsInSlot(slot, subject, count) {
    console.log(`DEBUG: Handling ${count} duplicate ${subject} in ${slot}`);

    // Find all keys for this subject
    const subjectKeys = [];
    for (const [key, subj] of Object.entries(this.timetable[slot].subject)) {
      if (subj === subject) {
        subjectKeys.push(key);
      }
    }

    // Keep only the first occurrence, remove the rest
    for (let i = 1; i < subjectKeys.length; i++) {
      const keyToRemove = subjectKeys[i];
      const teacherData = this.timetable[slot].teachers[keyToRemove];

      console.log(
        `DEBUG: Removing duplicate ${subject} from ${slot}.${keyToRemove} (teacher: ${teacherData})`,
      );

      // Remove the duplicate subject and teacher
      delete this.timetable[slot].subject[keyToRemove];
      delete this.timetable[slot].teachers[keyToRemove];

      // Try to reallocate the removed subject to an empty slot
      this.reallocateDuplicateSubject(subject, teacherData);
    }
  }

  /**
   * Reallocate a duplicate subject to an empty slot
   */
  reallocateDuplicateSubject(subject, teacherData) {
    // Find an empty slot for the duplicate subject
    for (const [slot, slotData] of Object.entries(this.timetable)) {
      if (Object.keys(slotData.subject).length === 0) {
        const nextKey = 1;
        this.timetable[slot].subject[nextKey] = subject;
        this.timetable[slot].teachers[nextKey] = teacherData;
        console.log(
          `DEBUG: Reallocated duplicate ${subject} to ${slot} with teacher ${teacherData[0]}`,
        );
        return;
      }
    }
    console.log(`DEBUG: Could not find empty slot for duplicate ${subject}`);
  }

  /**
   * Update allocation tracking after nextTo constraint places subjects
   */
  updateAllocationFromNextTo(subject) {
    console.log(`🔧 Checking allocation update for ${subject}`);
    // Find the paired subject from nextTo constraints
    if (!this.generator.constraints.nextTo) return;

    for (const [subj1, subj2] of this.generator.constraints.nextTo) {
      if (subject === subj1 || subject === subj2) {
        const pairedSubject = subject === subj1 ? subj2 : subj1;
        console.log(`🔍 Found paired subject: ${pairedSubject} for ${subject}`);

        // Check if the paired subject was placed by nextTo in the base generator
        let pairedSubjectFound = false;
        for (const slot in this.generator.timetable) {
          const baseSlotData = this.generator.timetable[slot];
          if (
            baseSlotData.subject &&
            Object.values(baseSlotData.subject).includes(pairedSubject)
          ) {
            pairedSubjectFound = true;
            console.log(
              `✅ Paired subject ${pairedSubject} found in base generator at ${slot}`,
            );
            break;
          }
        }

        if (pairedSubjectFound) {
          // Find which teacher teaches the paired subject and update allocation
          for (const teacher of Object.keys(this.subjectAllocation)) {
            if (this.subjectAllocation[teacher][pairedSubject] > 0) {
              // Decrement the allocation since it was placed by nextTo
              this.subjectAllocation[teacher][pairedSubject]--;
              console.log(
                `Updated allocation: Decremented ${teacher}'s ${pairedSubject} due to nextTo placement`,
              );

              // Check if the paired subject has batchwise constraints and handle them
              const pairedBatchInfo =
                this.generator.getBatchAssignment(pairedSubject);
              if (
                pairedBatchInfo.isInBatchwises &&
                pairedBatchInfo.pairedSubject
              ) {
                console.log(
                  `🔄 Handling batchwise allocation for nextTo-placed ${pairedSubject}`,
                );

                // Find the slot where the paired subject was placed
                let pairedSubjectSlot = null;
                for (const slot in this.generator.timetable) {
                  const baseSlotData = this.generator.timetable[slot];
                  if (
                    baseSlotData.subject &&
                    Object.values(baseSlotData.subject).includes(pairedSubject)
                  ) {
                    pairedSubjectSlot = slot;
                    break;
                  }
                }

                if (pairedSubjectSlot) {
                  // Find teacher for the batchwise partner
                  let batchwiseTeacher = null;
                  for (const t of Object.keys(this.subjectAllocation)) {
                    if (
                      this.subjectAllocation[t][pairedBatchInfo.pairedSubject] >
                      0
                    ) {
                      batchwiseTeacher = t;
                      break;
                    }
                  }

                  if (batchwiseTeacher) {
                    console.log(
                      `Allocating batchwise partner ${pairedBatchInfo.pairedSubject} taught by ${batchwiseTeacher} to same slot ${pairedSubjectSlot}`,
                    );

                    // Place the batchwise partner in the base generator
                    this.generator.allocateSlot(
                      pairedSubjectSlot,
                      pairedBatchInfo.pairedSubject,
                      batchwiseTeacher,
                    );
                    this.subjectAllocation[batchwiseTeacher][
                      pairedBatchInfo.pairedSubject
                    ]--;
                    console.log(
                      `✅ Allocated ${batchwiseTeacher}'s ${pairedBatchInfo.pairedSubject} to ${pairedSubjectSlot} (batchwise with ${pairedSubject})`,
                    );
                  }
                }
              }
              break;
            }
          }
        } else {
          console.log(
            `❌ Paired subject ${pairedSubject} not found in base generator`,
          );
        }
        break;
      }
    }
  }

  /**
   * Check if a subject has already been allocated in the timetable
   */
  isSubjectAlreadyAllocated(subject) {
    console.log(`🔍 Checking if ${subject} is already allocated`);
    for (const slot in this.timetable) {
      const slotData = this.timetable[slot];
      if (
        slotData.subject &&
        Object.values(slotData.subject).includes(subject)
      ) {
        console.log(`✅ Found ${subject} in slot ${slot}`);
        return true;
      }
    }
    console.log(`❌ ${subject} not found in any slot`);
    return false;
  }

  /**
   * Check if teacher has a clash with existing timetables
   */
  hasTeacherClashWithExistingTimetables(slot, teacher) {
    const existingTimetables =
      SingleClassTimetableGenerator.getExistingTimetables();

    for (const [className, existingTimetable] of Object.entries(
      existingTimetables,
    )) {
      const slotData = existingTimetable[slot];
      if (slotData) {
        // Check if teacher is assigned to any period in this slot
        for (const period in slotData.teachers) {
          if (slotData.teachers[period].includes(teacher)) {
            console.log(
              `   Clash detected: ${teacher} already scheduled in ${className} at ${slot}`,
            );
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Try to resolve teacher clash by finding alternative slots
   */
  tryResolveClash(slot, teacher) {
    // For now, just log the attempt - could implement more sophisticated resolution
    console.log(`   Attempting to resolve clash for ${teacher} at ${slot}`);
    return false; // Don't use clashing slots for now
  }

  /**
   * Allocate a subject and teacher to a slot
   */
  allocateSlot(slot, subject, teacher) {
    // Check if slot already has any subjects (prevent multiple subjects per slot)
    if (Object.keys(this.timetable[slot].subject).length > 0) {
      console.warn(
        `Cannot allocate ${subject} to ${slot} - slot already occupied`,
      );
      return false; // Indicate allocation failed
    }

    // Use key 1 for single subject allocation
    this.timetable[slot].subject[1] = subject;

    // Ensure teachers object exists
    if (!this.timetable[slot].teachers) {
      this.timetable[slot].teachers = {};
    }

    this.timetable[slot].teachers[1] = [teacher];
    this.subjectAllocation[teacher][subject]--;

    console.log(`✅ Allocated ${teacher}'s ${subject} to ${slot}`);
    return true; // Indicate allocation succeeded
  }

  /**
   * Handle sameDayInAllClasses constraints
   */
  handleSameDayInAllClassesConstraints() {
    if (!this.generator.constraints.sameDayInAllClasses) return;

    console.log("🔄 Handling sameDayInAllClasses constraints...");

    const existingTimetables =
      SingleClassTimetableGenerator.getExistingTimetables();

    for (const [subjects, classes] of this.generator.constraints
      .sameDayInAllClasses) {
      console.log(
        `Processing sameDayInAllClasses for subjects: [${subjects.join(", ")}] in classes: [${classes.join(", ")}]`,
      );

      for (const subject of subjects) {
        // Find slots for this subject in current timetable
        const currentSlots = this.findSubjectSlots(subject, this.timetable);

        // Find slots for this subject in existing timetables
        for (const [className, existingTimetable] of Object.entries(
          existingTimetables,
        )) {
          // Check if this existing class should be considered
          const shouldConsider =
            classes.includes("ALL") || classes.includes(className);

          if (shouldConsider) {
            const existingSlots = this.findSubjectSlots(
              subject,
              existingTimetable,
            );

            if (currentSlots.length > 0 && existingSlots.length > 0) {
              // Get the day from the existing timetable
              const [dayExisting] = existingSlots[0].split("-");

              // Check if current timetable has this subject on the same day
              const sameDaySlots = currentSlots.filter((slot) =>
                slot.startsWith(dayExisting),
              );

              if (sameDaySlots.length === 0) {
                console.log(
                  `SameDayInAllClasses: ${subject} is on ${dayExisting} in ${className} but not aligned, attempting to align...`,
                );

                // Try to move the subject to the same day
                this.alignSubjectToDay(subject, dayExisting, className);
              } else {
                console.log(
                  `SameDayInAllClasses: ${subject} is already aligned on ${dayExisting}`,
                );
              }
            }
          }
        }
      }
    }
  }

  /**
   * Find all slots where a subject is allocated
   */
  findSubjectSlots(subject, timetable) {
    const slots = [];

    for (const [slot, slotData] of Object.entries(timetable)) {
      if (this.subjectsMatch(slotData.subject, subject)) {
        slots.push(slot);
      }
    }

    return slots;
  }

  /**
   * Check if slotData.subject object contains the target subject
   */
  subjectsMatch(slotSubjects, targetSubject) {
    // slotSubjects is now an object with period keys
    for (const period in slotSubjects) {
      const subject = slotSubjects[period];
      if (!subject) continue;

      // Handle consolidated subjects like "ATL1 - MA"
      const consolidatedSubjects = subject.split(" - ");
      if (consolidatedSubjects.includes(targetSubject)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Align a subject to a specific day
   */
  alignSubjectToDay(subject, targetDay, referenceClass) {
    // Find all empty slots on the target day
    const targetDaySlots = [];
    for (let period = 1; period <= 9; period++) {
      const slot = `${targetDay}-${period}`;
      if (Object.keys(this.timetable[slot].subject).length === 0) {
        targetDaySlots.push(slot);
      }
    }

    if (targetDaySlots.length === 0) {
      console.log(
        `No empty slots available on ${targetDay} to align ${subject}`,
      );
      return;
    }

    // Find current slots of the subject
    const currentSlots = this.findSubjectSlots(subject, this.timetable);

    for (const currentSlot of currentSlots) {
      if (targetDaySlots.length > 0) {
        const targetSlot = targetDaySlots.shift();

        // Check for teacher clashes with existing timetables
        const teacher = this.getTeacherFromSlot(currentSlot, subject);
        const hasClash = this.hasTeacherClashWithExistingTimetables(
          targetSlot,
          teacher,
        );

        if (hasClash) {
          console.log(
            `Cannot move ${subject} to ${targetSlot} due to teacher clash`,
          );
          continue;
        }

        // Move the subject
        console.log(
          `Moving ${subject} from ${currentSlot} to ${targetSlot} for sameDayInAllClasses constraint`,
        );
        this.moveSubjectToSlot(currentSlot, targetSlot, subject);
      }
    }
  }

  /**
   * Move a subject from one slot to another
   */
  moveSubjectToSlot(fromSlot, toSlot, subject) {
    const fromData = this.timetable[fromSlot];
    const toData = this.timetable[toSlot];

    // Find subject key in from slot
    let subjectKey = null;
    let teacher = null;

    for (const key in fromData.subject) {
      if (fromData.subject[key] === subject) {
        subjectKey = key;
        teacher =
          fromData.teachers[key] && fromData.teachers[key][0]
            ? fromData.teachers[key][0]
            : "Unknown";
        break;
      }
    }

    if (!subjectKey) {
      console.log(`Subject ${subject} not found in slot ${fromSlot}`);
      return;
    }

    // Find next available key in to slot
    const toSlotKeys = Object.keys(toData.subject);
    const nextKey =
      toSlotKeys.length > 0 ? Math.max(...toSlotKeys.map(Number)) + 1 : 1;

    // Move subject and teacher
    toData.subject[nextKey] = subject;
    toData.teachers[nextKey] = [teacher];

    // Clear the original slot
    delete fromData.subject[subjectKey];
    delete fromData.teachers[subjectKey];

    console.log(
      `Moved ${subject} from ${fromSlot} (key: ${subjectKey}) to ${toSlot} (key: ${nextKey})`,
    );
  }

  /**
   * Get teacher for a specific subject in a slot
   */
  getTeacherFromSlot(slot, subject) {
    const slotData = this.timetable[slot];
    for (const subjectKey in slotData.subject) {
      if (slotData.subject[subjectKey] === subject) {
        return slotData.teachers[subjectKey] && slotData.teachers[subjectKey][0]
          ? slotData.teachers[subjectKey][0]
          : null;
      }
    }
    return null;
  }

  /**
   * Validate the generated timetable
   */
  validate() {
    const errors = [];

    // Check if all allocations are complete
    for (const teacher in this.subjectAllocation) {
      for (const subject in this.subjectAllocation[teacher]) {
        if (this.subjectAllocation[teacher][subject] !== 0) {
          errors.push(
            `${teacher}'s ${subject} still needs ${this.subjectAllocation[teacher][subject]} slots`,
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Print the generated timetable
   */
  printTimetable(className) {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Create header
    let header = "╔═══════════";
    for (let i = 1; i <= 9; i++) {
      header += "╤══════════";
    }
    header += "╗\n";

    let dayHeader = "║ Day       ";
    for (let i = 1; i <= 9; i++) {
      dayHeader += `│ Period ${i} `;
    }
    dayHeader += "║\n";

    let separator = "╟───────────";
    for (let i = 1; i <= 9; i++) {
      separator += "┼──────────";
    }
    separator += "╢\n";

    console.log(
      `\n========== CLASS ${className.toUpperCase()} TIMETABLE ==========\n`,
    );
    console.log(header + dayHeader + separator);

    // Print each day's schedule
    for (const day of days) {
      let row = `║ ${day.padEnd(9)} `;

      for (const period of periods) {
        const slot = `${day}-${period}`;
        const slotData = this.timetable[slot];

        // Check if there are subjects in this slot
        const subjectKeys = Object.keys(slotData.subject);
        if (subjectKeys.length > 0) {
          // Get all subjects for display
          const subjects = subjectKeys.map((key) => slotData.subject[key]);
          const teachers = subjectKeys.map((key) =>
            slotData.teachers[key] && slotData.teachers[key][0]
              ? slotData.teachers[key][0]
              : "Unknown",
          );

          // If multiple subjects, show them combined
          if (subjectKeys.length > 1) {
            const combinedSubjects = subjects.join("+");
            row += `│ ${combinedSubjects.substring(0, 8).padEnd(8)} `;
          } else {
            row += `│ ${subjects[0].substring(0, 8).padEnd(8)} `;
          }
        } else {
          row += "│ -        ";
        }
      }

      row += "║\n";
      console.log(row);

      // Add separator after each day
      if (day !== "Saturday") {
        console.log(separator);
      }
    }

    // Add footer
    let footer = "╚═══════════";
    for (let i = 1; i <= 9; i++) {
      footer += "╧══════════";
    }
    footer += "╝\n";

    console.log(footer);
  }
}

// Import the required TimetableGenerator class
class TimetableGenerator {
  constructor(workloads) {
    this.workloads = workloads;
    this.constraints = workloads.constraints || {};
    this.timetable = this.initializeTimetable();
    this.teachers = this.extractTeachers();
    this.allSubjects = this.extractAllSubjects();
    this.days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    this.subjectAllocation = this.initializeSubjectAllocation();
    this.slashSubjects = this.extractSlashSubjects();
    this.slashSubjectUsage = new Map(); // Track usage of slash subjects
    this.batchwisies = this.extractBatchwisies();
    this.batchAssignments = new Map(); // Track batch assignments per subject pair
    this.teacherPeriodCounts = new Map(); // Track periods per day for each teacher
    this.MAX_PERIODS_PER_DAY = 2; // Maximum periods a teacher can have per day
  }

  /**
   * Initialize empty timetable structure
   */
  initializeTimetable() {
    const timetable = {};
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    days.forEach((day) => {
      periods.forEach((period) => {
        timetable[`${day}-${period}`] = { subject: [], teacher: [] };
      });
    });

    return timetable;
  }

  /**
   * Extract all teachers from workloads (excluding constraints)
   */
  extractTeachers() {
    const teachers = [];
    for (const key in this.workloads) {
      if (key !== "constraints" && this.workloads[key].subjects) {
        teachers.push(key);
      }
    }
    return teachers;
  }

  /**
   * Extract all unique subjects from all teachers
   */
  extractAllSubjects() {
    const subjects = new Set();
    this.teachers.forEach((teacher) => {
      Object.keys(this.workloads[teacher].subjects).forEach((subject) => {
        subjects.add(subject);
      });
    });
    return Array.from(subjects);
  }

  /**
   * Extract subjects that contain "/" (batch-wise subjects)
   */
  extractSlashSubjects() {
    return this.allSubjects.filter((subject) => subject.includes("/"));
  }

  /**
   * Extract batchwisies configuration from constraints
   */
  extractBatchwisies() {
    if (!this.constraints.batchwisies) {
      return [];
    }
    return this.constraints.batchwisies;
  }

  /**
   * Get batch assignment for a subject in batchwises group
   * Returns {batch: batchOption, consolidatedName: string | null}
   */
  getBatchAssignment(subject) {
    for (const group of this.batchwisies) {
      const [subjects, batches] = group;
      if (subjects.includes(subject)) {
        // subjects is a string like "ATL1" in original format
        // batches is the paired subject like "MA"
        return {
          batch: batches,
          pairedSubject: batches,
          consolidatedName: subject,
          isInBatchwises: true,
        };
      }
    }
    return { batch: null, consolidatedName: null, isInBatchwises: false };
  }

  /**
   * Initialize subject allocation tracking for teachers
   */
  initializeSubjectAllocation() {
    const allocation = {};
    this.teachers.forEach((teacher) => {
      allocation[teacher] = { ...this.workloads[teacher].subjects };
    });
    return allocation;
  }

  /**
   * Get current period count for a teacher on a specific day
   */
  getTeacherPeriodCount(teacher, day) {
    if (!this.teacherPeriodCounts.has(teacher)) {
      this.teacherPeriodCounts.set(teacher, new Map());
    }
    return this.teacherPeriodCounts.get(teacher).get(day) || 0;
  }

  /**
   * Increment period count for a teacher on a specific day
   */
  incrementTeacherPeriodCount(teacher, day) {
    if (!this.teacherPeriodCounts.has(teacher)) {
      this.teacherPeriodCounts.set(teacher, new Map());
    }
    const dayCounts = this.teacherPeriodCounts.get(teacher);
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  }

  /**
   * Calculate period balance score for a slot (lower is better for balancing)
   */
  calculatePeriodBalanceScore(slot, teacher) {
    const [day] = slot.split("-");
    const currentCount = this.getTeacherPeriodCount(teacher, day);

    // Prefer days with fewer periods for this teacher
    // Score increases with more periods on the same day
    return currentCount;
  }

  /**
   * Get all valid (empty) slots in timetable
   */
  getValidSlots(skipMaxPeriodsCheck = false) {
    return Object.keys(this.timetable).filter((slot) => {
      const { subject, teacher } = this.timetable[slot];
      return subject.length === 0 && teacher.length === 0;
    });
  }

  /**
   * Check if a slot is valid for a given subject/teacher
   */
  isValidSlot(slot, subject, teacher, skipMaxPeriodsCheck = false) {
    const { subject: slotSubjects, teacher: slotTeachers } =
      this.timetable[slot];

    // Extract day and period from slot
    const [day, periodStr] = slot.split("-");
    const period = parseInt(periodStr);

    // Slot must be empty
    if (Array.isArray(slotSubjects) && slotSubjects.length > 0) {
      return false;
    }
    if (Array.isArray(slotTeachers) && slotTeachers.length > 0) {
      return false;
    }

    // Check maximum periods per day constraint
    const currentPeriodCount = this.getTeacherPeriodCount(teacher, day);

    // Emergency override: if no feasible slots available, ignore max periods constraint
    if (!skipMaxPeriodsCheck) {
      const hasAnyFeasibleSlots = this.getValidSlots(true).some(
        (slot) => this.isValidSlot(slot, subject, teacher, true), // Skip max periods check
      );

      if (
        !hasAnyFeasibleSlots &&
        currentPeriodCount >= this.MAX_PERIODS_PER_DAY
      ) {
        // Allow allocation even if at max periods, since no other options exist
      } else if (currentPeriodCount >= this.MAX_PERIODS_PER_DAY) {
        return false;
      }
    } else {
      // Normal max periods check
      if (currentPeriodCount >= this.MAX_PERIODS_PER_DAY) {
        return false;
      }
    }

    // Check Notfirst constraint - subjects marked as "Notfirst" cannot be in first period
    const subjectValue = this.workloads[teacher].subjectValues?.[subject];

    if (period === 1 && subjectValue === "Notfirst") {
      return false;
    }

    // Check notSameDay constraint
    if (this.constraints.notSameDay) {
      for (const constraintGroup of this.constraints.notSameDay) {
        // Handle both pairs and groups of multiple subjects
        if (Array.isArray(constraintGroup)) {
          if (constraintGroup.includes(subject)) {
            // Check if any other subject in this group already exists on the same day
            const conflictSubjects = constraintGroup.filter(
              (s) => s !== subject,
            );

            for (const conflictSubject of conflictSubjects) {
              for (const [slotKey, slotData] of Object.entries(
                this.timetable,
              )) {
                if (
                  slotKey.startsWith(day) &&
                  this.subjectsMatch(slotData.subject, conflictSubject)
                ) {
                  return false;
                }
              }
            }
          }
        }
      }
    }

    // Check farfaraway constraint
    if (!this.isValidForFarfaraway(slot, subject)) {
      return false;
    }

    return true;
  }

  /**
   * Check if subject matches in array (handles both strings and arrays)
   */
  subjectsMatch(subjectArray, targetSubject) {
    if (Array.isArray(subjectArray)) {
      // Handle [consolidatedName, batch] format - check both elements
      if (
        subjectArray.length === 2 &&
        typeof subjectArray[0] === "string" &&
        typeof subjectArray[1] === "string"
      ) {
        return (
          this.normalizeSubject(subjectArray[0]) ===
            this.normalizeSubject(targetSubject) ||
          this.normalizeSubject(subjectArray[1]) ===
            this.normalizeSubject(targetSubject)
        );
      }
      // Handle regular array format
      return subjectArray.some(
        (s) =>
          this.normalizeSubject(s) === this.normalizeSubject(targetSubject),
      );
    }
    return (
      this.normalizeSubject(subjectArray) ===
      this.normalizeSubject(targetSubject)
    );
  }

  /**
   * Normalize subject name for comparison
   */
  normalizeSubject(subject) {
    if (Array.isArray(subject)) {
      return subject.sort().join("/");
    }
    return subject;
  }

  /**
   * Get teaching value for a subject (Important = high priority)
   */
  getSubjectValue(teacher, subject) {
    const values = this.workloads[teacher].subjectValues || {};
    const value = values[subject] || "Normal";
    return value === "Important" ? 2 : 1;
  }

  /**
   * Find which teacher teaches a given subject
   */
  findTeacherForSubject(subject) {
    for (const teacher of this.teachers) {
      if (this.workloads[teacher].subjects[subject] !== undefined) {
        return teacher;
      }
    }
    return null;
  }

  /**
   * Weighted RNG: select random option based on weights
   */
  weightedRNG(options, weights) {
    if (options.length === 0) return null;

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < options.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return options[i];
      }
    }

    return options[options.length - 1];
  }

  /**
   * Calculate weights for slots based on subject priority and constraints
   */
  calculateSlotWeights(slots, teacher, subject) {
    return slots.map((slot) => {
      const [day, periodStr] = slot.split("-");
      const period = parseInt(periodStr);
      const subjectValue =
        this.workloads[teacher].subjectValues?.[subject] || "Normal";
      const hasBreakDuty = this.workloads[teacher].BreakDuty;

      let baseWeight = 1 / slots.length;

      // Apply subject value multiplier
      const valueMultiplier = subjectValue === "Important" ? 2 : 1;
      baseWeight *= valueMultiplier;

      // Bonus for Important subjects in first period ONLY if this teacher has BreakDuty
      if (period === 1 && subjectValue === "Important" && hasBreakDuty) {
        baseWeight *= 3; // Give 3x weight for first period
      }

      // Penalty for Normal subjects in first period ONLY if this teacher has BreakDuty and Important subjects exist
      if (period === 1 && subjectValue === "Normal" && hasBreakDuty) {
        // Check if this teacher has any Important subjects
        const hasImportantSubjects = Object.values(
          this.workloads[teacher].subjectValues || {},
        ).some((value) => value === "Important");

        if (hasImportantSubjects) {
          baseWeight *= 0.1; // Reduce weight for first period
        }
      }

      // Apply period balancing - reduce weight for days with many periods
      const balanceScore = this.calculatePeriodBalanceScore(slot, teacher);
      const balanceMultiplier = Math.max(0.3, 1 - balanceScore * 0.2); // Decrease weight with each additional period
      baseWeight *= balanceMultiplier;

      // Apply maximum periods per day constraint
      const currentPeriodCount = this.getTeacherPeriodCount(teacher, day);
      if (currentPeriodCount >= this.MAX_PERIODS_PER_DAY) {
        baseWeight *= 0.01; // Severely penalize if already at max
      } else if (currentPeriodCount === this.MAX_PERIODS_PER_DAY - 1) {
        baseWeight *= 0.5; // Moderate penalty if approaching max
      }

      return baseWeight;
    });
  }

  /**
   * Allocate a subject to a teacher in a slot
   */
  allocateSlot(slot, subject, teacher) {
    const batchInfo = this.getBatchAssignment(subject);
    const [day] = slot.split("-");

    if (batchInfo.isInBatchwises) {
      // For batchwises, consolidate subject name and set subject=[consolidated, batch]
      this.timetable[slot].subject = [
        batchInfo.consolidatedName,
        batchInfo.batch,
      ];
      this.timetable[slot].teacher = [teacher];

      // Also allocate the batch subject to the teacher who teaches it
      const batchTeacher = this.findTeacherForSubject(batchInfo.batch);
      if (
        batchTeacher &&
        this.subjectAllocation[batchTeacher][batchInfo.batch] !== undefined
      ) {
        this.subjectAllocation[batchTeacher][batchInfo.batch]--;
      }
    } else {
      // For regular subjects, keep existing behavior but as array
      this.timetable[slot].subject.push(subject);
      this.timetable[slot].teacher.push(teacher);
    }

    this.subjectAllocation[teacher][subject]--;

    // Track period count for balancing
    this.incrementTeacherPeriodCount(teacher, day);
  }

  /**
   * Handle nextTo constraint: place paired subjects adjacent by shifting existing content if needed
   */
  handleNextToConstraint(allocatedSubject, allocatedTeacher, slot) {
    if (!this.constraints.nextTo) return;

    // Debug: Log when regular nextTo is called
    if (
      allocatedSubject === "ATL1" ||
      allocatedSubject === "ATL2" ||
      allocatedSubject === "Art1" ||
      allocatedSubject === "Art2"
    ) {
      console.log(
        `Regular NextTo called for ${allocatedSubject} by ${allocatedTeacher} at ${slot}`,
      );
    }

    for (const [subj1, subj2] of this.constraints.nextTo) {
      if (allocatedSubject !== subj1 && allocatedSubject !== subj2) continue;

      const pairSubject = allocatedSubject === subj1 ? subj2 : subj1;

      // Debug: Log when we find a pair
      if (
        allocatedSubject === "ATL1" ||
        allocatedSubject === "ATL2" ||
        allocatedSubject === "Art1" ||
        allocatedSubject === "Art2"
      ) {
        console.log(
          `Found regular pair: ${allocatedSubject} -> ${pairSubject}`,
        );
      }

      const [day, periodStr] = slot.split("-");
      const period = parseInt(periodStr);

      // Try to place pair subject in next period (or previous if at end)
      let targetPeriod;
      if (period === 9) {
        targetPeriod = 8;
      } else if (period === 1) {
        targetPeriod = 2;
      } else {
        targetPeriod = Math.random() < 0.5 ? period - 1 : period + 1;
      }

      const targetSlot = `${day}-${targetPeriod}`;
      const targetData = this.timetable[targetSlot];

      // Check if pair subject needs allocation
      for (const teacher of this.teachers) {
        if (this.subjectAllocation[teacher][pairSubject] > 0) {
          if (
            targetData &&
            targetData.subject &&
            Object.keys(targetData.subject).length === 0 &&
            targetData &&
            targetData.teachers &&
            Object.keys(targetData.teachers).length === 0
          ) {
            // Target slot is empty, place pair subject directly
            this.allocateSlot(targetSlot, pairSubject, teacher);
            if (
              allocatedSubject === "ATL1" ||
              allocatedSubject === "ATL2" ||
              allocatedSubject === "Art1" ||
              allocatedSubject === "Art2"
            ) {
              console.log(`Placed ${pairSubject} at ${targetSlot}`);
            }
            return;
          } else {
            // Target slot is occupied - FORCE the placement using the same strategies as batchwises
            console.log(
              `Target slot ${targetSlot} is occupied, forcing placement for regular nextTo...`,
            );

            // Try multiple strategies to force placement
            const forcePlaced = this.forceAdjacentPlacement(
              allocatedSubject,
              pairSubject,
              teacher,
              slot,
              day,
              period,
            );
            if (forcePlaced) {
              console.log(
                `Successfully forced placement of ${pairSubject} next to ${allocatedSubject}`,
              );
              return;
            }
          }
        }
      }
    }
  }

  /**
   * Handle nextTo constraint for batchwises subjects - called after batchwises allocation
   */
  handleBatchwisesNextToConstraint(allocatedSubject, allocatedTeacher, slot) {
    if (!this.constraints.nextTo) return;

    // Debug: Log when batchwises nextTo is called
    console.log(
      `Batchwises NextTo called for ${allocatedSubject} by ${allocatedTeacher} at ${slot}`,
    );

    // Check if this subject is part of any nextTo pair
    for (const [subj1, subj2] of this.constraints.nextTo) {
      if (allocatedSubject !== subj1 && allocatedSubject !== subj2) continue;

      const pairSubject = allocatedSubject === subj1 ? subj2 : subj1;

      // Debug: Log when we find a pair
      console.log(
        `Found batchwises pair: ${allocatedSubject} -> ${pairSubject}`,
      );

      const [day, periodStr] = slot.split("-");
      const period = parseInt(periodStr);

      // Try to place pair subject in next period (or previous if at end)
      let targetPeriod;
      if (period === 9) {
        targetPeriod = 8;
      } else if (period === 1) {
        targetPeriod = 2;
      } else {
        targetPeriod = Math.random() < 0.5 ? period - 1 : period + 1;
      }

      const targetSlot = `${day}-${targetPeriod}`;
      const targetData = this.timetable[targetSlot];

      // Debug: Log target slot info
      console.log(
        `Target slot: ${targetSlot}, empty: ${targetData.subject.length === 0}`,
      );

      // Check if pair subject needs allocation
      for (const teacher of this.teachers) {
        if (this.subjectAllocation[teacher][pairSubject] > 0) {
          // Debug: Log when we find teacher with allocation
          console.log(
            `Found teacher ${teacher} with ${pairSubject} allocation: ${this.subjectAllocation[teacher][pairSubject]}`,
          );

          if (
            targetData.subject.length === 0 &&
            targetData.teacher.length === 0
          ) {
            // Target slot is empty, place pair subject directly
            this.allocateSlot(targetSlot, pairSubject, teacher);
            console.log(`Placed ${pairSubject} at ${targetSlot}`);
            return;
          } else {
            // Target slot is occupied - FORCE the placement by shifting or finding alternative
            console.log(
              `Target slot ${targetSlot} is occupied, forcing placement...`,
            );

            // Try multiple strategies to force placement
            const forcePlaced = this.forceAdjacentPlacement(
              allocatedSubject,
              pairSubject,
              teacher,
              slot,
              day,
              period,
            );
            if (forcePlaced) {
              console.log(
                `Successfully forced placement of ${pairSubject} next to ${allocatedSubject}`,
              );
              return;
            }
          }
        }
      }
    }
  }

  /**
   * Force adjacent placement by trying multiple strategies
   */
  forceAdjacentPlacement(
    allocatedSubject,
    pairSubject,
    teacher,
    originalSlot,
    day,
    period,
  ) {
    // Strategy 1: Try both adjacent periods (before and after)
    const adjacentPeriods = [];
    if (period > 1) adjacentPeriods.push(period - 1);
    if (period < 9) adjacentPeriods.push(period + 1);

    // Try each adjacent period
    for (const targetPeriod of adjacentPeriods) {
      const targetSlot = `${day}-${targetPeriod}`;
      const targetData = this.timetable[targetSlot];

      if (targetData.subject.length === 0 && targetData.teacher.length === 0) {
        // Empty slot, place directly
        this.allocateSlot(targetSlot, pairSubject, teacher);
        console.log(
          `Forced placement: ${pairSubject} at ${targetSlot} (empty slot)`,
        );
        return true;
      }
    }

    // Strategy 2: Try to shift existing content from adjacent slots
    for (const targetPeriod of adjacentPeriods) {
      const targetSlot = `${day}-${targetPeriod}`;
      const shiftSuccess = this.shiftSlotContent(
        targetSlot,
        pairSubject,
        teacher,
      );
      if (shiftSuccess) {
        this.allocateSlot(targetSlot, pairSubject, teacher);
        console.log(
          `Forced placement: ${pairSubject} at ${targetSlot} (after shifting)`,
        );
        return true;
      }
    }

    // Strategy 3: Find any empty slot on the same day and move existing content there
    for (const targetPeriod of adjacentPeriods) {
      const targetSlot = `${day}-${targetPeriod}`;
      const targetData = this.timetable[targetSlot];

      if (targetData.subject.length > 0) {
        // Find any empty slot on the same day
        for (let p = 1; p <= 9; p++) {
          const emptySlot = `${day}-${p}`;
          const emptyData = this.timetable[emptySlot];
          if (
            emptyData.subject.length === 0 &&
            emptyData.teacher.length === 0
          ) {
            // Move content from targetSlot to emptySlot
            this.timetable[emptySlot].subject = [...targetData.subject];
            this.timetable[emptySlot].teacher = [...targetData.teacher];

            // Clear targetSlot
            this.timetable[targetSlot].subject = [];
            this.timetable[targetSlot].teacher = [];

            // Place pair subject
            this.allocateSlot(targetSlot, pairSubject, teacher);
            console.log(
              `Forced placement: ${pairSubject} at ${targetSlot} (moved content to ${emptySlot})`,
            );
            return true;
          }
        }
      }
    }

    // Strategy 4: If all else fails, find any adjacent slot on any day and move both subjects there
    console.log(
      `Extreme measure: relocating both subjects to ensure adjacency`,
    );
    return this.relocateBothSubjectsForAdjacency(
      allocatedSubject,
      pairSubject,
      teacher,
      day,
      period,
    );
  }

  /**
   * Extreme measure: relocate both subjects to ensure adjacency
   */
  relocateBothSubjectsForAdjacency(
    allocatedSubject,
    pairSubject,
    teacher,
    preferredDay,
    preferredPeriod,
  ) {
    // Find a pair of adjacent empty slots on any day
    for (const day of this.days) {
      for (let period = 1; period <= 8; period++) {
        const slot1 = `${day}-${period}`;
        const slot2 = `${day}-${period + 1}`;
        const data1 = this.timetable[slot1];
        const data2 = this.timetable[slot2];

        if (
          data1.subject.length === 0 &&
          data1.teacher.length === 0 &&
          data2.subject.length === 0 &&
          data2.teacher.length === 0
        ) {
          // Found adjacent empty slots, place both subjects here

          // Remove the originally allocated subject from its current slot
          const originalSlot = Object.entries(this.timetable).find(
            ([slot, data]) =>
              this.subjectsMatch(data.subject, allocatedSubject) &&
              data.teacher.includes(teacher),
          );
          if (originalSlot) {
            this.timetable[originalSlot[0]].subject = [];
            this.timetable[originalSlot[0]].teacher = [];
          }

          // Place both subjects in adjacent slots
          this.allocateSlot(slot1, allocatedSubject, teacher);
          this.allocateSlot(slot2, pairSubject, teacher);
          console.log(
            `Extreme relocation: ${allocatedSubject} at ${slot1}, ${pairSubject} at ${slot2}`,
          );
          return true;
        }
      }
    }

    console.log(
      `Failed to force adjacency for ${allocatedSubject} and ${pairSubject}`,
    );
    return false;
  }

  /**
   * Shift content from an occupied slot to the next available period on the same day
   */
  shiftSlotContent(occupiedSlot, newSubject, newTeacher) {
    const [day, periodStr] = occupiedSlot.split("-");
    const startPeriod = parseInt(periodStr);

    // Get the content that needs to be moved
    const originalSubject = this.timetable[occupiedSlot].subject[0];
    const originalTeacher = this.timetable[occupiedSlot].teacher[0];

    // Try to find the next available period on the same day
    for (let period = startPeriod + 1; period <= 9; period++) {
      const targetSlot = `${day}-${period}`;
      const targetData = this.timetable[targetSlot];

      if (
        targetData.subject.length === 0 &&
        targetData.teacher.length === 0 &&
        this.isValidSlot(targetSlot, originalSubject, originalTeacher)
      ) {
        // Found an empty valid slot, move the content

        // Move the original content to the new slot
        this.timetable[targetSlot].subject = [
          ...this.timetable[occupiedSlot].subject,
        ];
        this.timetable[targetSlot].teacher = [
          ...this.timetable[occupiedSlot].teacher,
        ];

        // Clear the original slot
        this.timetable[occupiedSlot].subject = [];
        this.timetable[occupiedSlot].teacher = [];

        return true;
      }
    }

    // If no forward slot available, try backward
    for (let period = startPeriod - 1; period >= 1; period--) {
      const targetSlot = `${day}-${period}`;
      const targetData = this.timetable[targetSlot];

      if (
        targetData.subject.length === 0 &&
        targetData.teacher.length === 0 &&
        this.isValidSlot(targetSlot, originalSubject, originalTeacher)
      ) {
        // Found an empty valid slot, move the content

        // Move the original content to the new slot
        this.timetable[targetSlot].subject = [
          ...this.timetable[occupiedSlot].subject,
        ];
        this.timetable[targetSlot].teacher = [
          ...this.timetable[occupiedSlot].teacher,
        ];

        // Clear the original slot
        this.timetable[occupiedSlot].subject = [];
        this.timetable[occupiedSlot].teacher = [];

        return true;
      }
    }

    return false; // No available slot to shift to
  }

  /**
   * Find an alternative slot for a subject when preferred slot is occupied
   */
  findAlternativeSlot(subject, teacher, occupiedSlot) {
    const [occupiedDay, occupiedPeriod] = occupiedSlot.split("-");
    const occupiedPeriodNum = parseInt(occupiedPeriod);

    // First, try to find adjacent slots (distance = 1)
    const adjacentSlots = [];
    for (let period = 1; period <= 9; period++) {
      const distance = Math.abs(period - occupiedPeriodNum);
      if (distance !== 1) continue; // Only consider adjacent periods

      const slot = `${occupiedDay}-${period}`;
      const slotData = this.timetable[slot];

      if (
        slotData.subject.length === 0 &&
        slotData.teacher.length === 0 &&
        this.isValidSlot(slot, subject, teacher)
      ) {
        adjacentSlots.push({ slot, distance });
      }
    }

    // If adjacent slots available, pick one randomly
    if (adjacentSlots.length > 0) {
      const randomIndex = Math.floor(Math.random() * adjacentSlots.length);
      return adjacentSlots[randomIndex].slot;
    }

    // If no adjacent slots, try slots with distance = 2 (one period between)
    const distanceTwoSlots = [];
    for (let period = 1; period <= 9; period++) {
      const distance = Math.abs(period - occupiedPeriodNum);
      if (distance !== 2) continue; // Only consider slots with one period gap

      const slot = `${occupiedDay}-${period}`;
      const slotData = this.timetable[slot];

      if (
        slotData.subject.length === 0 &&
        slotData.teacher.length === 0 &&
        this.isValidSlot(slot, subject, teacher)
      ) {
        distanceTwoSlots.push({ slot, distance });
      }
    }

    if (distanceTwoSlots.length > 0) {
      const randomIndex = Math.floor(Math.random() * distanceTwoSlots.length);
      return distanceTwoSlots[randomIndex].slot;
    }

    // If no slots within distance 2, try any other same-day slot
    const otherSameDaySlots = [];
    for (let period = 1; period <= 9; period++) {
      const distance = Math.abs(period - occupiedPeriodNum);
      if (distance <= 2) continue; // Skip already checked periods

      const slot = `${occupiedDay}-${period}`;
      const slotData = this.timetable[slot];

      if (
        slotData.subject.length === 0 &&
        slotData.teacher.length === 0 &&
        this.isValidSlot(slot, subject, teacher)
      ) {
        otherSameDaySlots.push({ slot, distance });
      }
    }

    // Sort by distance (closest first)
    otherSameDaySlots.sort((a, b) => a.distance - b.distance);

    if (otherSameDaySlots.length > 0) {
      return otherSameDaySlots[0].slot;
    }

    // If no same day slots available, try any valid slot
    const validSlots = this.getValidSlots().filter((slot) =>
      this.isValidSlot(slot, subject, teacher),
    );

    if (validSlots.length > 0) {
      // Use weighted RNG to select from valid slots
      const weights = this.calculateSlotWeights(validSlots, teacher, subject);
      return this.weightedRNG(validSlots, weights);
    }

    return null; // No alternative slot found
  }

  /**
   * Get day group for a day (MTW vs WRF)
   */
  getDayGroup(day) {
    const mtwDays = ["Monday", "Tuesday", "Wednesday"];
    const wrfDays = ["Thursday", "Friday"];

    if (mtwDays.includes(day)) return "MTW";
    if (wrfDays.includes(day)) return "WRF";
    return "Saturday"; // Excluded from MTWRF
  }

  /**
   * Check if two days are in opposite groups (MTW vs WRF)
   */
  areDaysOpposite(day1, day2) {
    const group1 = this.getDayGroup(day1);
    const group2 = this.getDayGroup(day2);

    // Saturday is excluded, so if either is Saturday, they're not in opposite groups
    if (group1 === "Saturday" || group2 === "Saturday") return false;

    return group1 !== group2 && group1 !== "Saturday" && group2 !== "Saturday";
  }

  /**
   * Check if slot satisfies farfaraway constraints for a subject
   */
  isValidForFarfaraway(slot, subject) {
    if (!this.constraints.farfaraway) return true;

    for (const [subjects, dayPattern] of this.constraints.farfaraway) {
      if (!subjects.includes(subject)) continue;

      const [slotDay] = slot.split("-");

      // Check if this subject is already placed somewhere
      for (const [existingSlot, slotData] of Object.entries(this.timetable)) {
        if (this.subjectsMatch(slotData.subject, subject)) {
          const [existingDay] = existingSlot.split("-");

          // For farfaraway, subjects should be on opposite day groups
          if (!this.areDaysOpposite(existingDay, slotDay)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Find all subjects that are paired with given subject in farfaraway constraints
   */
  getFarfarawayPartners(subject) {
    if (!this.constraints.farfaraway) return [];

    const partners = [];
    for (const [subjects, dayPattern] of this.constraints.farfaraway) {
      if (subjects.includes(subject)) {
        partners.push(...subjects.filter((s) => s !== subject));
      }
    }
    return partners;
  }

  /**
   * Handle farfaraway constraint: place subjects on opposite day groups
   */
  handleFarfarawayConstraint(allocatedSubject, allocatedTeacher, slot) {
    if (!this.constraints.farfaraway) return;

    const partners = this.getFarfarawayPartners(allocatedSubject);
    if (partners.length === 0) return;

    const [allocatedDay] = slot.split("-");
    const allocatedGroup = this.getDayGroup(allocatedDay);

    for (const partnerSubject of partners) {
      // Find teacher for partner subject
      for (const teacher of this.teachers) {
        if (this.subjectAllocation[teacher][partnerSubject] > 0) {
          // Find slots in opposite day group
          const oppositeSlots = this.getValidSlots().filter((slot) => {
            const [slotDay] = slot.split("-");
            const slotGroup = this.getDayGroup(slotDay);

            return (
              this.areDaysOpposite(allocatedDay, slotDay) &&
              this.isValidSlot(slot, partnerSubject, teacher) &&
              this.isValidForFarfaraway(slot, partnerSubject)
            );
          });

          if (oppositeSlots.length > 0) {
            // Use weighted RNG to select from opposite day slots
            const weights = this.calculateSlotWeights(
              oppositeSlots,
              teacher,
              partnerSubject,
            );
            const selectedSlot = this.weightedRNG(oppositeSlots, weights);
            this.allocateSlot(selectedSlot, partnerSubject, teacher);
            return;
          }
        }
      }
    }
  }
  getAllBatchSubjects() {
    const batchSubjects = new Set();
    for (const group of this.batchwisies) {
      const [subjects, batches] = group;
      // Add all batch options to the set
      if (Array.isArray(batches)) {
        batches.forEach((batch) => batchSubjects.add(batch));
      } else {
        batchSubjects.add(batches);
      }
    }
    return batchSubjects;
  }

  /**
   * Generate the timetable
   */
  generate() {
    const batchSubjects = this.getAllBatchSubjects();

    for (const teacher of this.teachers) {
      const subjects = Object.keys(this.workloads[teacher].subjects);

      for (const subject of subjects) {
        // Skip subjects that are only used as batch options
        if (batchSubjects.has(subject)) {
          continue;
        }

        // Debug: Track Science allocation specifically
        if (subject === "Science") {
          console.log(`\n=== Processing Science for ${teacher} ===`);
          console.log(
            `Total Science allocation: ${this.subjectAllocation[teacher][subject]}`,
          );
        }

        while (this.subjectAllocation[teacher][subject] > 0) {
          // Check if we have any feasible slots at all
          const allValidSlots = this.getValidSlots();
          const hasAnyFeasibleSlots = allValidSlots.length > 0;

          let feasibleSlots;
          if (hasAnyFeasibleSlots) {
            feasibleSlots = allValidSlots.filter((slot) =>
              this.isValidSlot(slot, subject, teacher),
            );
          } else {
            // Emergency: no feasible slots available, ignore max periods constraint
            feasibleSlots = allValidSlots.filter((slot) =>
              this.isValidSlot(slot, subject, teacher, true),
            );
          }

          // Debug: Show feasible slots for Science
          if (subject === "Science") {
            console.log(`Feasible slots for Science: ${feasibleSlots.length}`);
            if (feasibleSlots.length === 0) {
              console.log("No feasible slots found for Science!");
              // Show some debug info
              console.log("Teacher period counts:");
              for (const [day, count] of this.teacherPeriodCounts.get(
                teacher,
              ) || []) {
                console.log(`  ${day}: ${count}`);
              }
            }
          }

          if (feasibleSlots.length === 0) {
            console.warn(
              `No feasible slots available for ${teacher}'s ${subject}`,
            );
            break;
          }

          // Calculate weights for feasible slots
          const weights = this.calculateSlotWeights(
            feasibleSlots,
            teacher,
            subject,
          );

          // Select slot using weighted RNG
          const selectedSlot = this.weightedRNG(feasibleSlots, weights);

          this.allocateSlot(selectedSlot, subject, teacher);

          // Handle nextTo constraint based on whether subject is in batchwises
          const batchInfo = this.getBatchAssignment(subject);
          if (batchInfo.isInBatchwises) {
            // Debug: Log when using batchwises handler
            if (
              subject === "ATL1" ||
              subject === "ATL2" ||
              subject === "Art1" ||
              subject === "Art2"
            ) {
              console.log(
                `${subject} is in batchwises, using batchwises nextTo handler`,
              );
            }
            // Use batchwises-specific nextTo handler
            this.handleBatchwisesNextToConstraint(
              subject,
              teacher,
              selectedSlot,
            );
          } else {
            // Debug: Log when using regular handler
            if (
              subject === "ATL1" ||
              subject === "ATL2" ||
              subject === "Art1" ||
              subject === "Art2"
            ) {
              console.log(
                `${subject} is NOT in batchwises, using regular nextTo handler`,
              );
            }
            // Use regular nextTo handler
            this.handleNextToConstraint(subject, teacher, selectedSlot);
          }

          this.handleFarfarawayConstraint(subject, teacher, selectedSlot);
        }
      }
    }
  }

  validate() {
    const errors = [];

    // Check if all allocations are complete
    for (const teacher of this.teachers) {
      for (const subject in this.subjectAllocation[teacher]) {
        if (this.subjectAllocation[teacher][subject] !== 0) {
          errors.push(
            `${teacher}'s ${subject} still needs ${
              this.subjectAllocation[teacher][subject]
            } slots`,
          );
        }
      }
    }

    // Check maximum periods per day constraint
    for (const teacher of this.teachers) {
      for (const day of this.days) {
        let periodCount = 0;
        for (const period of this.periods) {
          const slot = `${day}-${period}`;
          const slotTeachers = this.timetable[slot].teacher;
          if (slotTeachers.includes(teacher)) {
            periodCount++;
          }
        }
        if (periodCount > this.MAX_PERIODS_PER_DAY) {
          errors.push(
            `${teacher} has ${periodCount} periods on ${day} (max: ${this.MAX_PERIODS_PER_DAY})`,
          );
        }
      }
    }

    // Check notSameDay constraints
    if (this.constraints.notSameDay) {
      for (const constraintGroup of this.constraints.notSameDay) {
        // Handle both pairs and groups of multiple subjects
        if (Array.isArray(constraintGroup)) {
          for (const day of this.days) {
            const subjectsOnDay = [];

            // Check which subjects from this group are on this day
            for (const subject of constraintGroup) {
              for (const period of this.periods) {
                const slot = `${day}-${period}`;
                const slotSubjects = this.timetable[slot].subject;
                if (this.subjectsMatch(slotSubjects, subject)) {
                  subjectsOnDay.push(subject);
                  break; // Found this subject on this day, move to next subject
                }
              }
            }

            // If more than one subject from this group is on the same day, it's a violation
            if (subjectsOnDay.length > 1) {
              errors.push(
                `${subjectsOnDay.join(", ")} both on same day (${day})`,
              );
            }
          }
        }
      }
    }

    // Check farfaraway constraints
    if (this.constraints.farfaraway) {
      for (const [subjects, dayPattern] of this.constraints.farfaraway) {
        const [subj1, subj2] = subjects;

        // Find all slots where these subjects are placed
        const subj1Slots = [];
        const subj2Slots = [];

        for (const [slot, slotData] of Object.entries(this.timetable)) {
          if (this.subjectsMatch(slotData.subject, subj1)) {
            subj1Slots.push(slot);
          }
          if (this.subjectsMatch(slotData.subject, subj2)) {
            subj2Slots.push(slot);
          }
        }

        // Check if any pair violates farfaraway (not on opposite day groups)
        for (const slot1 of subj1Slots) {
          for (const slot2 of subj2Slots) {
            const [day1] = slot1.split("-");
            const [day2] = slot2.split("-");

            if (!this.areDaysOpposite(day1, day2)) {
              errors.push(
                `${subj1} and ${subj2} not on opposite day groups (${day1} and ${day2})`,
              );
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Print timetable in formatted table
   */
  printTimetable() {
    const data = [
      ["Day", ...this.periods.map((p) => `Period ${p}`)],
      ...this.days.map((day) => [
        day,
        ...this.periods.map((period) => {
          const slot = this.timetable[`${day}-${period}`];
          let subject = "-";
          let teacher = "-";

          if (Array.isArray(slot.subject) && slot.subject.length > 0) {
            // Handle both [consolidated, batch] and regular array formats
            if (
              slot.subject.length === 2 &&
              typeof slot.subject[0] === "string" &&
              typeof slot.subject[1] === "string"
            ) {
              // This is likely [consolidatedName, batch] format
              subject = slot.subject.join(" - ");
            } else {
              subject = slot.subject.join(", ");
            }
          }

          if (Array.isArray(slot.teacher) && slot.teacher.length > 0) {
            teacher = slot.teacher.join(", ");
          }

          return `${subject}\n(${teacher})`;
        }),
      ]),
    ];

    console.log("\n========== TIMETABLE ==========\n");
    console.log(table(data));
  }

  /**
   * Get timetable as JSON
   */
  getTimetable() {
    return this.timetable;
  }

  /**
   * Get detailed report
   */
  getReport() {
    const validation = this.validate();
    return {
      timetable: this.timetable,
      validation,
      subjectAllocation: this.subjectAllocation,
    };
  }
}

export { SingleClassTimetableGenerator };

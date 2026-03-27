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
    this.generator = new TimetableGenerator(this.mergeConstraints(workloads, totalConstraints));
    
    this.timetable = this.initializeTimetable();
    this.subjectAllocation = this.initializeSubjectAllocation();
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
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const timetable = {};

    for (const day of days) {
      for (const period of periods) {
        timetable[`${day}-${period}`] = {
          subject: [],
          teacher: []
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
        allocation[teacher][subject] = this.workloads[teacher].subjects[subject];
      }
    }
    
    return allocation;
  }

  /**
   * Merge simplified constraints with totalConstraints
   */
  mergeConstraints(workload, totalConstraints) {
    const merged = JSON.parse(JSON.stringify(workload)); // Deep copy
    
    // Initialize constraints object if it doesn't exist
    if (!merged.constraints) {
      merged.constraints = {};
    }
    
    // Convert simplified notfirst array to subjectValues format
    if (merged.constraints.notfirst && Array.isArray(merged.constraints.notfirst)) {
      // Apply notfirst constraint to all teachers
      for (const teacher in merged) {
        if (teacher !== "constraints" && merged[teacher].subjects) {
          // Initialize subjectValues if it doesn't exist
          if (!merged[teacher].subjectValues) {
            merged[teacher].subjectValues = {};
          }
          
          // Apply notfirst to all subjects for this teacher
          for (const subject in merged[teacher].subjects) {
            if (merged.constraints.notfirst.includes(subject)) {
              merged[teacher].subjectValues[subject] = "Notfirst";
            }
          }
        }
      }
      
      // Remove the simplified notfirst array
      delete merged.constraints.notfirst;
    }
    
    // Merge totalConstraints (except putTogether which is handled separately)
    if (totalConstraints) {
      merged.constraints.notSameDay = totalConstraints.notSameDay || [];
      merged.constraints.nextTo = totalConstraints.nextTo || [];
      merged.constraints.batchwisies = totalConstraints.batchwisies || [];
      merged.constraints.farfaraway = totalConstraints.farfaraway || [];
      merged.constraints.sameDayInAllClasses = totalConstraints.sameDayInAllClasses || [];
    }
    
    return merged;
  }

  /**
   * Generate timetable for this class, considering existing timetables
   */
  generate(className) {
    console.log(`\n🎯 Generating timetable for class ${className} with workloads:`, Object.keys(this.workloads).filter(t => t !== 'constraints'));
    
    const existingTimetables = SingleClassTimetableGenerator.getExistingTimetables();
    if (Object.keys(existingTimetables).length > 0) {
      console.log(`📋 Considering existing timetables for classes:`, Object.keys(existingTimetables));
    }

    const batchSubjects = this.generator.getAllBatchSubjects();
    const teachers = this.generator.teachers;

    for (const teacher of teachers) {
      const subjects = Object.keys(this.workloads[teacher].subjects);

      for (const subject of subjects) {
        // Skip subjects that are only used as batch options
        if (batchSubjects.has(subject)) {
          continue;
        }

        while (this.subjectAllocation[teacher][subject] > 0) {
          // Get available slots considering existing timetables
          const validSlots = this.getAvailableValidSlots(subject, teacher);
          
          if (validSlots.length === 0) {
            console.warn(`No valid slots available for ${teacher}'s ${subject}`);
            break;
          }

          // Calculate weights for valid slots only
          const weights = this.generator.calculateSlotWeights(validSlots, teacher, subject);

          // Select slot using weighted RNG from pre-filtered valid slots
          const selectedSlot = this.generator.weightedRNG(validSlots, weights);

          this.allocateSlot(selectedSlot, subject, teacher);

          // Handle constraints
          const batchInfo = this.generator.getBatchAssignment(subject);
          if (batchInfo.isInBatchwises) {
            this.generator.handleBatchwisesNextToConstraint(subject, teacher, selectedSlot);
          } else {
            this.generator.handleNextToConstraint(subject, teacher, selectedSlot);
          }

          this.generator.handleFarfarawayConstraint(subject, teacher, selectedSlot);

          // Handle batchwises allocation
          if (batchInfo.isInBatchwises) {
            for (const group of this.generator.batchwisies) {
              const [subjects, batches] = group;
              if (subjects.includes(subject)) {
                for (const subj of subjects) {
                  if (
                    subj !== subject &&
                    this.subjectAllocation[teacher][subj] !== undefined
                  ) {
                    // Don't reduce allocation for nextTo partners
                    const isNextToPartner = this.generator.constraints.nextTo?.some(([s1, s2]) =>
                      (s1 === subject && s2 === subj) || (s2 === subject && s1 === subj)
                    );

                    if (!isNextToPartner) {
                      this.subjectAllocation[teacher][subj] = 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // Handle sameDayInAllClasses constraints if this is a subsequent class
    if (Object.keys(existingTimetables).length > 0) {
      this.handleSameDayInAllClassesConstraints();
    }

    // Store the generated timetable in the static storage
    this.storeTimetable(className);

    return this.timetable;
  }

  /**
   * Store the generated timetable in static storage
   */
  storeTimetable(className) {
    SingleClassTimetableGenerator.existingTimetables[className] = JSON.parse(JSON.stringify(this.timetable));
    console.log(`💾 Stored timetable for class ${className}`);
  }

  /**
   * Get available valid slots considering existing timetables
   */
  getAvailableValidSlots(subject, teacher) {
    const allValidSlots = this.generator.getValidSlots();
    const availableSlots = [];
    
    console.log(`\n🔍 Finding valid slots for ${teacher}'s ${subject}...`);
    console.log(`   Total valid slots: ${allValidSlots.length}`);
    
    for (const slot of allValidSlots) {
      // Check if slot is valid for this teacher/subject
      if (!this.generator.isValidSlot(slot, subject, teacher)) {
        continue;
      }
      
      // Check for teacher clashes with existing timetables
      const hasClash = this.hasTeacherClashWithExistingTimetables(slot, teacher);
      
      if (!hasClash) {
        availableSlots.push(slot);
      } else {
        // Try to resolve clash by moving the clashing teacher
        const resolved = this.tryResolveClash(slot, teacher);
        if (resolved) {
          availableSlots.push(slot);
        }
      }
    }
    
    console.log(`   Available slots after filtering: ${availableSlots.length}`);
    return availableSlots;
  }

  /**
   * Check if teacher has a clash with existing timetables
   */
  hasTeacherClashWithExistingTimetables(slot, teacher) {
    const existingTimetables = SingleClassTimetableGenerator.getExistingTimetables();
    
    for (const [className, existingTimetable] of Object.entries(existingTimetables)) {
      if (existingTimetable[slot] && existingTimetable[slot].teacher.includes(teacher)) {
        console.log(`   Clash detected: ${teacher} already scheduled in ${className} at ${slot}`);
        return true;
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
    this.timetable[slot].subject.push(subject);
    this.timetable[slot].teacher.push(teacher);
    this.subjectAllocation[teacher][subject]--;
    
    console.log(`✅ Allocated ${teacher}'s ${subject} to ${slot}`);
  }

  /**
   * Handle sameDayInAllClasses constraints
   */
  handleSameDayInAllClassesConstraints() {
    if (!this.generator.constraints.sameDayInAllClasses) return;

    console.log("🔄 Handling sameDayInAllClasses constraints...");
    
    const existingTimetables = SingleClassTimetableGenerator.getExistingTimetables();
    
    for (const [subjects, classes] of this.generator.constraints.sameDayInAllClasses) {
      console.log(`Processing sameDayInAllClasses for subjects: [${subjects.join(', ')}] in classes: [${classes.join(', ')}]`);
      
      for (const subject of subjects) {
        // Find slots for this subject in current timetable
        const currentSlots = this.findSubjectSlots(subject, this.timetable);
        
        // Find slots for this subject in existing timetables
        for (const [className, existingTimetable] of Object.entries(existingTimetables)) {
          const existingSlots = this.findSubjectSlots(subject, existingTimetable);
          
          if (currentSlots.length > 0 && existingSlots.length > 0) {
            // Get the day from the existing timetable
            const [dayExisting] = existingSlots[0].split('-');
            
            // Check if current timetable has this subject on the same day
            const sameDaySlots = currentSlots.filter(slot => slot.startsWith(dayExisting));
            
            if (sameDaySlots.length === 0) {
              console.log(`SameDayInAllClasses: ${subject} is on ${dayExisting} in ${className} but not aligned, attempting to align...`);
              
              // Try to move the subject to the same day
              this.alignSubjectToDay(subject, dayExisting, className);
            } else {
              console.log(`SameDayInAllClasses: ${subject} is already aligned on ${dayExisting}`);
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
   * Check if slotData.subject array contains the target subject
   */
  subjectsMatch(slotSubjects, targetSubject) {
    return slotSubjects.some(subject => {
      if (!subject) return false;
      // Handle consolidated subjects like "ATL1 - MA"
      const consolidatedSubjects = subject.split(' - ');
      return consolidatedSubjects.includes(targetSubject);
    });
  }

  /**
   * Align a subject to a specific day
   */
  alignSubjectToDay(subject, targetDay, referenceClass) {
    // Find all empty slots on the target day
    const targetDaySlots = [];
    for (let period = 1; period <= 9; period++) {
      const slot = `${targetDay}-${period}`;
      if (this.timetable[slot].subject.length === 0) {
        targetDaySlots.push(slot);
      }
    }
    
    if (targetDaySlots.length === 0) {
      console.log(`No empty slots available on ${targetDay} to align ${subject}`);
      return;
    }
    
    // Find current slots of the subject
    const currentSlots = this.findSubjectSlots(subject, this.timetable);
    
    for (const currentSlot of currentSlots) {
      if (targetDaySlots.length > 0) {
        const targetSlot = targetDaySlots.shift();
        
        // Check for teacher clashes with existing timetables
        const teacher = this.timetable[currentSlot].teacher[0];
        const hasClash = this.hasTeacherClashWithExistingTimetables(targetSlot, teacher);
        
        if (hasClash) {
          console.log(`Cannot move ${subject} to ${targetSlot} due to teacher clash`);
          continue;
        }
        
        // Move the subject
        console.log(`Moving ${subject} from ${currentSlot} to ${targetSlot} for sameDayInAllClasses constraint`);
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

    // Move the subject and teacher
    toData.subject = [...fromData.subject];
    toData.teacher = [...fromData.teacher];

    // Clear the original slot
    fromData.subject = [];
    fromData.teacher = [];
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
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
    
    console.log(`\n========== CLASS ${className.toUpperCase()} TIMETABLE ==========\n`);
    console.log(header + dayHeader + separator);
    
    // Print each day's schedule
    for (const day of days) {
      let row = `║ ${day.padEnd(9)} `;
      
      for (const period of periods) {
        const slot = `${day}-${period}`;
        const slotData = this.timetable[slot];
        
        if (slotData.subject.length > 0) {
          const subject = slotData.subject[0] || "Unknown";
          const teacher = slotData.teacher[0] || "Unknown";
          row += `│ ${subject.substring(0, 8).padEnd(8)} `;
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
import TimetableGenerator from './timetableGenerator.js';

export { SingleClassTimetableGenerator };

export type StudentID = number;
export type Student = { studentID: number; studentName: string };
export type Course = string;
export type Grade = number;
export type CourseGrade = { course: Course; grade: Grade };
export type Transcript = { student: Student; grades: CourseGrade[] };

export interface TranscriptManager {
  /**
   * Add a (new) student to system with an empty transcript.
   * There may be multiple students with the same name but different IDs.
   * @param name name of student
   */
  addStudent(name: string): StudentID;

  /** Return all student IDs for students name matching.
   * If the name is undefined, return all student IDs.
   * @param name to match
   */
  getStudentIDs(studentName?: string): StudentID[];

  /**
   * Return a fresh array of all transcripts being managed.
   */
  getAll(): Transcript[];

  /**
   * Return the transcript for the given student, if one exists.
   * @param studentID student ID
   */
  getTranscript(studentID: StudentID): Transcript | undefined;

  /**
   * Add a grade to the students transcript.
   * It is an error to change the student's grade with this method.
   * This method is idempotent:
   * if the same grade is already listed for this course,
   * this method has no effect.
   * @param studentID id of student whose transcript is added to.
   * This student must exist in the system.
   * @param course course to add to students transcript.
   * This student must not already have a (different) grade for this course.
   * @param grade Grade to place in the transcript.
   * @throws Error if student not in system or
   * if course already on transcript with a different grade.
   */
  addGrade(studentID: StudentID, course: Course, grade: Grade): void;

  /**
   * Get the grade for this student in this course.
   * Result is undefined if the student is not in the system or if
   * the course is not on the student's transcript.
   * @param studentID student ID of student
   * @param course course to request grade for
   */
  getGrade(studentID: StudentID, course: Course): number | undefined;
}

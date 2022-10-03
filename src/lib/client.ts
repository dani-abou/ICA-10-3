import { remoteDelete, remoteGet, remotePost } from './remoteService';
import { Course, Grade, StudentID, Transcript, TranscriptManager } from '../types/transcript';

import { Promisify } from '../types/promise-utils';
/*
 POST /transcripts
 -- adds a new student to the database, returns an ID for this student.
 -- Requires a post parameter 'name'.
 -- Multiple students may have the same name.
 */
export async function addStudent(studentName: string): Promise<StudentID> {
  const { studentID } = await remotePost<{ studentID: StudentID }>('/transcripts', {
    name: studentName,
  });
  return studentID;
}

/*
 GET  /transcripts/:ID           -
- returns name transcript for student with given ID.  Fails if no such student
*/
export async function getTranscript(studentID: number): Promise<Transcript> {
  return remoteGet(`/transcripts/${studentID}`);
}

/*
GET  /studentids?name=string     -- returns list of IDs for student with the given name
*/
export async function getStudentIDs(studentName: string): Promise<StudentID[]> {
  return remoteGet(`/studentids?name=${studentName}`);
}

export async function getAllStudentIDs(): Promise<StudentID[]> {
  return remoteGet('/studentids');
}

/*
DELETE /transcripts/:ID
-- deletes transcript for student with the given ID, fails if no such student
*/
export async function deleteStudent(studentID: StudentID): Promise<void> {
  return remoteDelete(`/transcripts/${studentID}`);
}

/* POST /transcripts/:studentID/:course   -- /transcripts
-- adds an entry in this student's transcript with given name and course.
-- Requires a post parameter 'grade'. Fails if there is already an entry for this course in the student's transcript
*/
export async function addGrade(studentID: StudentID, course: Course, grade: Grade): Promise<void> {
  await remotePost<void>(`/transcripts/${studentID}/${course}`, { grade });
}

// GET /transcripts/:studentID/:course
// returns the student's grade in the specified course as a
// TS object.
// Fails if student or course is missing.
export async function getGrade(studentID: StudentID, course: Course): Promise<Grade> {
  const { grade } = await remoteGet<{ grade: Grade }>(`/transcripts/${studentID}/${course}`);
  return grade;
}

// * GET /transcripts     -- returns list of all transcripts
export async function getAllTranscripts(): Promise<Transcript[]> {
  return remoteGet<Transcript[]>('/transcripts');
}

export async function uploadTranscript(tr: Transcript): Promise<unknown> {
  const { student, grades } = tr; // destructuring const
  if (student.studentID === 0) {
    const studentID = await addStudent(student.studentName); // won't fail
    student.studentID = studentID;
  }
  const ps = grades.map(cg => addGrade(student.studentID, cg.course, cg.grade));
  return Promise.all(ps);
}

async function getGradeOrNegative(studentID: number, courseName: string): Promise<number> {
  try {
    return await getGrade(studentID, courseName);
  } catch {
    return -1;
  }
}
export async function averageGrade(courseName: string): Promise<number> {
  const ids = await getAllStudentIDs();
  const rawGrades = await Promise.all(ids.map(id => getGradeOrNegative(id, courseName)));
  const nonZero = rawGrades.filter(n => n >= 0);
  return nonZero.reduce((g1, g2) => g1 + g2) / nonZero.length;
}

export const remoteTranscriptManager: Promisify<TranscriptManager> = {
  addStudent: addStudent,
  getAll: getAllTranscripts,
  getTranscript: getTranscript,
  getStudentIDs(name?: string): Promise<StudentID[]> {
    if (name) return getStudentIDs(name);
    return getAllStudentIDs();
  },
  addGrade: addGrade,
  getGrade: getGrade,
};

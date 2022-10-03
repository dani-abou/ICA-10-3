import { Transcript } from './transcript';

const POSSIBLE_NAMES = [
  'chris',
  'avery',
  'sandy',
  'robin',
  'drew',
  'taylor',
  'jordan',
  'alex',
  'ryan',
];
export const POSSIBLE_COURSES = [
  'CS 4350',
  'CS 5500',
  'CS 5006',
  'CS 5007',
  'CS 5008',
  'CS 5010',
  'CS 5100',
  'CS 5200',
  'CS 5310',
  'CS 5520',
];

const SELECT = 0.5; // chance that a random transcript has a particular course

export function randomName() {
  return POSSIBLE_NAMES[Math.floor(Math.random() * POSSIBLE_NAMES.length)];
}

export function randomTranscript(): Transcript {
  return {
    // use 0 as a placeholder: we will need to get an ID later
    student: { studentName: randomName(), studentID: 0 },
    grades: POSSIBLE_COURSES.filter(() => SELECT > Math.random()).map(cn => ({
      grade: Math.random() * 100,
      course: cn,
    })),
  };
}

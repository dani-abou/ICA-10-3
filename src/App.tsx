import {
  Box,
  ChakraProvider,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  HStack,
  Select,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Toast,
  ToastId,
  useToast,
  VStack,
  Wrap,
  WrapItem,
  Input,
  Button,
} from '@chakra-ui/react';
import { nanoid } from 'nanoid';
import React, { useEffect, useState } from 'react';
import './App.css';
import { addGrade, addStudent, getAllTranscripts } from './lib/client';
import { Course, CourseGrade, Transcript } from './types/transcript';

function GradeView({ grade }: { grade: CourseGrade }) {
  const toast = useToast();
  return (
    <Stat>
      <StatLabel>{grade.course}</StatLabel>
      <StatNumber>
        <Editable
          defaultValue={`${grade.grade}`}
          onSubmit={newValue => {
            console.log(`Want to update grade to ${newValue}`);
            toast({
              title: 'Grade updated!',
              description: "We've updated the grade for you.",
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
          }}
          submitOnBlur={false}>
          <EditablePreview />
          <EditableInput />
        </Editable>
      </StatNumber>
    </Stat>
  );
}
function TranscriptView({
  transcript,
  setFetchTranscript,
}: {
  transcript: Transcript;
  setFetchTranscript: (newVal: boolean) => void;
}) {
  const [courseName, setCourseName] = useState<string>('');
  const [newGrade, setNewGrade] = useState<string>('');

  return (
    <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='scroll' border='2px'>
      <Heading as='h4' paddingTop='1.5' paddingBottom='1.5'>
        {transcript.student.studentName} #{transcript.student.studentID}
        <HStack>
          <Input
            placeholder='New Course Name'
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
          />
          <Input
            placeholder='New Grade'
            value={newGrade}
            onChange={e => setNewGrade(e.target.value)}
          />
          <Button
            onClick={async () => {
              await addGrade(transcript.student.studentID, courseName, parseInt(newGrade));
              setCourseName('');
              setNewGrade('');
              setFetchTranscript(true);
            }}>
            Add grade
          </Button>
        </HStack>
        <VStack>
          {transcript.grades.map((eachGrade, eachGradeIndex) => (
            <GradeView key={eachGradeIndex} grade={eachGrade} />
          ))}
        </VStack>
      </Heading>
    </Box>
  );
}

const sortingFunctions: { [key: string]: (trans: Transcript) => number | string } = {
  id: (trans: Transcript) => trans.student.studentID,
  name: (trans: Transcript) => trans.student.studentName,
  average: (trans: Transcript) =>
    trans.grades.reduce(
      (previousValue: number, nextGrade: CourseGrade) => previousValue + nextGrade.grade,
      0,
    ) / trans.grades.length,
};

const sorter = (
  valueA: Transcript,
  valueB: Transcript,
  sortingFunctionID: string | undefined,
  isAscending: boolean,
) => {
  console.log('sorting...');
  if (sortingFunctionID === undefined || !sortingFunctions[sortingFunctionID]) return 0;
  const getSortByValue = sortingFunctions[sortingFunctionID];
  if (getSortByValue(valueA) == getSortByValue(valueB)) return 0;
  if (isAscending && getSortByValue(valueA) > getSortByValue(valueB)) return 1;
  if (!isAscending && getSortByValue(valueA) < getSortByValue(valueB)) return 1;
  return -1;
};

function App() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [sortBy, setSortBy] = useState<{
    sortingFunctionID: string | undefined;
    isAscending: boolean;
  }>({
    sortingFunctionID: undefined,
    isAscending: true,
  });

  const [newStudentInput, setNewStudentInput] = useState<string>('');
  const [fetchTranscriptsState, setFetchTranscript] = useState<boolean>(true);

  const addNewStudent = async () => {
    await addStudent(newStudentInput);
    setFetchTranscript(true);
    setNewStudentInput('');
  };

  useEffect(() => {
    async function fetchTranscripts() {
      setTranscripts(await getAllTranscripts());
      setFetchTranscript(false);
    }
    if (fetchTranscriptsState) {
      fetchTranscripts();
    }
    console.log('useEffect called');
  }, [fetchTranscriptsState]);

  return (
    <div className='App'>
      <ChakraProvider>
        <HStack spacing='24px' margin='24px' justifyContent='center'>
          <span>Sort by:</span>
          <Select
            placeholder='Select a sort order'
            onChange={option => {
              setSortBy(prev => ({
                ...prev,
                sortingFunctionID: option.target.value,
              }));
            }}>
            <option value='id'>Student ID</option>
            <option value='name'>Student name</option>
            <option value='average'>Average Grade</option>
          </Select>
          <Select
            onChange={option => {
              setSortBy(prev => ({
                ...prev,
                isAscending: option.target.value === 'asc',
              }));
            }}>
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </Select>
        </HStack>
        <HStack>
          <Input
            placeholder='New student name'
            value={newStudentInput}
            onChange={e => setNewStudentInput(e.target.value)}
          />
          <Button onClick={addNewStudent}>Add student</Button>
        </HStack>
        <Wrap>
          {transcripts
            .sort((a, b) => sorter(a, b, sortBy.sortingFunctionID, sortBy.isAscending))
            .map(eachTranscript => (
              <WrapItem key={eachTranscript.student.studentID}>
                <TranscriptView
                  transcript={eachTranscript}
                  setFetchTranscript={setFetchTranscript}
                />
              </WrapItem>
            ))}
        </Wrap>
      </ChakraProvider>
    </div>
  );
}

export default App;

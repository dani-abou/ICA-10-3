import {
  Box,
  ChakraProvider,
  Editable,
  EditableInput,
  EditablePreview,
  Heading,
  HStack,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  Toast,
  useToast,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import './App.css';
import { getAllTranscripts } from './lib/client';
import { Course, CourseGrade, Transcript } from './types/transcript';

function GradeView({
  grade,
  updateGrade,
}: {
  grade: CourseGrade;
  updateGrade: (newValue: number) => void;
}) {
  return (
    <Stat>
      <StatLabel>{grade.course}</StatLabel>
      <StatNumber>
        <Editable
          defaultValue={`${grade.grade}`}
          onSubmit={newValue => {
            console.log(`Want to update grade to ${newValue}`);
            updateGrade(parseInt(newValue));
          }}>
          <EditablePreview />
          <EditableInput />
        </Editable>
      </StatNumber>
    </Stat>
  );
}
function TranscriptView({
  transcript,
  updateTranscript,
}: {
  transcript: Transcript;
  updateTranscript: (course: Course, newValue: number) => void;
}) {
  const toast = useToast();

  useEffect(() => {
    console.log('printing toast');
    toast({
      title: 'Account created.',
      description: "We've created your account for you.",
      status: 'success',
      duration: 9000,
      isClosable: true,
    });
  }, [transcript, toast]);
  return (
    <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
      <Heading as='h4'>
        {transcript.student.studentName} #{transcript.student.studentID}
        <VStack>
          {transcript.grades.map((eachGrade, eachGradeIndex) => (
            <GradeView
              key={eachGradeIndex}
              grade={eachGrade}
              updateGrade={(newValue: number) => updateTranscript(eachGrade.course, newValue)}
            />
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
  useEffect(() => {
    async function fetchTranscripts() {
      setTranscripts(await getAllTranscripts());
    }
    fetchTranscripts();
    console.log('useEffect called');
  }, []);

  const updateTranscript = (studentID: number, course: Course, newValue: number) => {
    setTranscripts((prev: Transcript[]) => {
      const transcriptIndex: number = prev.findIndex(
        currentTrsncript => currentTrsncript.student.studentID === studentID,
      );
      const courseIndex = prev[transcriptIndex].grades.findIndex(
        eachGrade => eachGrade.course === course,
      );
      prev[transcriptIndex].grades[courseIndex].grade = newValue;
      return prev;
    });
  };

  return (
    <div className='App'>
      <ChakraProvider>
        <HStack spacing='24px'>
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
        <Wrap>
          {transcripts
            .sort((a, b) => sorter(a, b, sortBy.sortingFunctionID, sortBy.isAscending))
            .map(eachTranscript => (
              <WrapItem key={eachTranscript.student.studentID}>
                <TranscriptView
                  transcript={eachTranscript}
                  updateTranscript={(course: Course, newValue: number) =>
                    updateTranscript(eachTranscript.student.studentID, course, newValue)
                  }
                />
              </WrapItem>
            ))}
        </Wrap>
      </ChakraProvider>
    </div>
  );
}

export default App;

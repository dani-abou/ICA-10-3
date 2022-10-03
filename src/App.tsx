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
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import './App.css';
import { getAllTranscripts } from './lib/client';
import { CourseGrade, Transcript } from './types/transcript';

function GradeView({ grade }: { grade: CourseGrade }) {
  return (
    <Stat>
      <StatLabel>{grade.course}</StatLabel>
      <StatNumber>
        <Editable
          defaultValue={`${grade.grade}`}
          onSubmit={newValue => {
            console.log(`Want to update grade to ${newValue}`);
          }}>
          <EditablePreview />
          <EditableInput />
        </Editable>
      </StatNumber>
    </Stat>
  );
}
function TranscriptView({ transcript }: { transcript: Transcript }) {
  return (
    <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden'>
      <Heading as='h4'>
        {transcript.student.studentName} #{transcript.student.studentID}
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
  if (sortingFunctionID === undefined) return 0;
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
  }, []);

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
              console.log(`Selected sort order ${option.target.value}`);
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
                <TranscriptView transcript={eachTranscript} />
              </WrapItem>
            ))}
        </Wrap>
      </ChakraProvider>
    </div>
  );
}

export default App;

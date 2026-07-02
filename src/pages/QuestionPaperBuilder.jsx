import React from 'react';
import { BuilderProvider } from './builder/BuilderContext';
import BuilderLayout from './builder/components/BuilderLayout';
import './QuestionPaperBuilder.css';

function QuestionPaperBuilder() {
  return (
    <BuilderProvider>
      <BuilderLayout />
    </BuilderProvider>
  );
}

export default QuestionPaperBuilder;

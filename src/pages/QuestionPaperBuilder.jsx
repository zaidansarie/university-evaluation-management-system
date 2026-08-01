import React from 'react';
import { BuilderProvider } from './builder/BuilderContext';
import BuilderLayout from './builder/components/BuilderLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import './QuestionPaperBuilder.css';

function QuestionPaperBuilder() {
  console.log("QuestionPaperBuilder mounted");
  return (
    <ErrorBoundary>
      <BuilderProvider>
        <BuilderLayout />
      </BuilderProvider>
    </ErrorBoundary>
  );
}

export default QuestionPaperBuilder;

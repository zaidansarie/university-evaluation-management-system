import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Statistics from './components/Statistics'
import Features from './components/Features'
import Roles from './components/Roles'
import About from './components/About'
import Workflow from './components/Workflow'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './pages/Login'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import FacultyManagement from './pages/FacultyManagement'
import StudentManagement from './pages/StudentManagement'
import SubjectManagement from './pages/SubjectManagement'
import QuestionBank from './pages/QuestionBank'
import QuestionPaperManagement from './pages/QuestionPaperManagement'
import QuestionPaperBuilder from './pages/QuestionPaperBuilder'
import PreviewPage from './pages/preview/PreviewPage'
import ExaminationDirectory from './pages/answersheets/ExaminationDirectory'
import AnswerSheetDashboard from './pages/answersheets/AnswerSheetDashboard'
import EvaluationDashboard from './pages/evaluations/EvaluationDashboard'
import EvaluationWorkspace from './pages/evaluations/EvaluationWorkspace'
import ResultsDashboard from './pages/results/ResultsDashboard'
import ResultGeneration from './pages/results/ResultGeneration'
import RecheckingDashboard from './pages/rechecking/RecheckingDashboard'
import CreateRecheckingRequest from './pages/rechecking/CreateRecheckingRequest'
import RecheckingWorkspace from './pages/rechecking/RecheckingWorkspace'

function Home() {
  return (
    <main>
      <Hero />
      <Statistics />
      <Features />
      <Roles />
      <About />
      <Workflow />
      <Contact />
    </main>
  )
}

function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

import { BackendStatusProvider } from './contexts/BackendStatusContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <BackendStatusProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
            
            {/* Admin Routes with nested layout */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="faculty" element={<FacultyManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="question-bank" element={<QuestionBank />} />
              <Route path="question-papers" element={<QuestionPaperManagement />} />
              <Route path="question-papers/:id/build" element={<QuestionPaperBuilder />} />
              <Route path="question-papers/:id/preview" element={<PreviewPage />} />
              <Route path="examination-answer-sheets" element={<ExaminationDirectory />} />
              <Route path="examination-answer-sheets/:paperId" element={<AnswerSheetDashboard />} />
              <Route path="evaluation" element={<EvaluationDashboard />} />
              <Route path="evaluation/session/:sessionId" element={<EvaluationWorkspace />} />
              <Route path="results" element={<ResultsDashboard />} />
              <Route path="results/generate" element={<ResultGeneration />} />
              <Route path="rechecking" element={<RecheckingDashboard />} />
              <Route path="rechecking/create" element={<CreateRecheckingRequest />} />
              <Route path="rechecking/workspace/:requestId" element={<RecheckingWorkspace />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </BackendStatusProvider>
  )
}

export default App
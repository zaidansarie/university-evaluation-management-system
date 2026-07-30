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
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ResetPassword from './pages/ResetPassword'
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
import AdminEvaluationAssignment from './pages/AdminEvaluationAssignment'
import AdminEvaluationManagement from './pages/AdminEvaluationManagement'
import AdminFacultyEvaluationView from './pages/evaluations/AdminFacultyEvaluationView'
import EvaluationWorkspace from './pages/evaluations/EvaluationWorkspace'
import ResultsDashboard from './pages/results/ResultsDashboard'
import ResultGeneration from './pages/results/ResultGeneration'
import RecheckingDashboard from './pages/rechecking/RecheckingDashboard'
import CreateRecheckingRequest from './pages/rechecking/CreateRecheckingRequest'
import RecheckingWorkspace from './pages/rechecking/RecheckingWorkspace'
import AdminSettings from './pages/AdminSettings'
import AdminNotifications from './pages/AdminNotifications'

// Faculty Components
import FacultyLayout from './components/FacultyLayout'
import FacultyDashboard from './pages/faculty/FacultyDashboard'
import AssignedEvaluations from './pages/faculty/AssignedEvaluations'
import FacultyRecheckingDashboard from './pages/faculty/FacultyRecheckingDashboard'
import FacultySettings from './pages/faculty/FacultySettings'
import FacultyNotifications from './pages/faculty/FacultyNotifications'
import FacultyProfile from './pages/faculty/FacultyProfile'

// Student Components
import StudentLayout from './components/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentSubjects from './pages/student/StudentSubjects'
import StudentResults from './pages/student/StudentResults'
import StudentResultDetails from './pages/student/StudentResultDetails'
import StudentAnswerSheets from './pages/student/StudentAnswerSheets'
import StudentAnswerSheetViewer from './pages/student/StudentAnswerSheetViewer'
import StudentRechecking from './pages/student/StudentRechecking'
import StudentCreateRecheckingRequest from './pages/student/StudentCreateRecheckingRequest'
import StudentRecheckingDetails from './pages/student/StudentRecheckingDetails'
import StudentNotifications from './pages/student/StudentNotifications'
import StudentProfile from './pages/student/StudentProfile'
import StudentSettings from './pages/student/StudentSettings'

// Super Admin Components
import SuperAdminLayout from './components/SuperAdminLayout'
import PlaceholderPage from './pages/super-admin/PlaceholderPage'
import UniversityManagement from './pages/super-admin/UniversityManagement'
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard'
import SuperAdminNotifications from './pages/super-admin/SuperAdminNotifications'

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
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BackendStatusProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout><Home /></MainLayout>} />
              <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
              <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
              <Route path="/verify-otp" element={<MainLayout><VerifyOTP /></MainLayout>} />
              <Route path="/reset-password" element={<MainLayout><ResetPassword /></MainLayout>} />
              
              {/* Admin Routes with nested layout */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="faculty" element={<FacultyManagement />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="subjects" element={<SubjectManagement />} />
              <Route path="question-bank" element={<QuestionBank mode="admin" />} />
              <Route path="question-papers" element={<QuestionPaperManagement />} />
              <Route path="question-papers/:id/build" element={<QuestionPaperBuilder />} />
              <Route path="question-papers/:id/preview" element={<PreviewPage />} />
              <Route path="answer-sheet-uploads" element={<ExaminationDirectory />} />
              <Route path="answer-sheet-uploads/:paperId" element={<AnswerSheetDashboard />} />
              <Route path="evaluation-assignment" element={<AdminEvaluationAssignment />} />
              <Route path="evaluation" element={<AdminEvaluationManagement />} />
              <Route path="evaluation/faculty/:facultyId" element={<AdminFacultyEvaluationView />} />
              <Route path="results" element={<ResultsDashboard />} />
              <Route path="results/generate" element={<ResultGeneration />} />
              <Route path="rechecking" element={<RecheckingDashboard />} />
              <Route path="rechecking/create" element={<CreateRecheckingRequest />} />
              <Route path="rechecking/workspace/:requestId" element={<RecheckingWorkspace />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Faculty Routes */}
            <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']}><FacultyLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="rechecking" element={<FacultyRecheckingDashboard />} />
              <Route path="rechecking/workspace/:requestId" element={<RecheckingWorkspace />} />
              <Route path="evaluations" element={<AssignedEvaluations />} />
              <Route path="evaluation/session/:sessionId" element={<EvaluationWorkspace />} />
              <Route path="question-bank" element={<QuestionBank mode="faculty" />} />
              <Route path="notifications" element={<FacultyNotifications />} />
              <Route path="profile" element={<FacultyProfile />} />
              <Route path="settings" element={<FacultySettings />} />
            </Route>

            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="subjects" element={<StudentSubjects />} />
              <Route path="results" element={<StudentResults />} />
              <Route path="results/:resultId" element={<StudentResultDetails />} />
              <Route path="answer-sheets" element={<StudentAnswerSheets />} />
              <Route path="answer-sheets/:id" element={<StudentAnswerSheetViewer />} />
              <Route path="rechecking" element={<StudentRechecking />} />
              <Route path="rechecking/create" element={<StudentCreateRecheckingRequest />} />
              <Route path="rechecking/:id" element={<StudentRecheckingDetails />} />
              <Route path="notifications" element={<StudentNotifications />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>

            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['super-admin']}><SuperAdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="universities" element={<UniversityManagement />} />
              <Route path="notifications" element={<SuperAdminNotifications />} />
              <Route path="profile" element={<PlaceholderPage title="Profile" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
            </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </BackendStatusProvider>
  )
}

export default App
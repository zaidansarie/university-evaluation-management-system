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

function App() {
  return (
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
        </Route>
      </Routes>
    </Router>
  )
}

export default App
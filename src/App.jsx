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

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <Features />
        <Roles />
        <About />
        <Workflow />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
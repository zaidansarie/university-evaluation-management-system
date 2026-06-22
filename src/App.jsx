import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Statistics from './components/Statistics'
import Features from './components/Features'
import Roles from './components/Roles'

function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <Statistics />
        <Features />
        <Roles />
      </main>
    </div>
  )
}

export default App
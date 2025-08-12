import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Lesson from './pages/Lesson'
import Review from './pages/Review'
import Explore from './pages/Explore'
import RayosX from './pages/RayosX'
import Settings from './pages/Settings'
import History from './pages/History'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/lesson/:block/:prep" element={<Lesson />} />
          <Route path="/review" element={<Review />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/rayosx" element={<RayosX />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
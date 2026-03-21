import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import MapPage from './pages/MapPage'
import Status from './pages/Status'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage';

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in - look for both possible storage keys
    const userData = localStorage.getItem('userData')
    const oldUserData = localStorage.getItem('user') // For backward compatibility
    
    console.log('App.jsx - Checking localStorage:')
    console.log('userData:', userData)
    console.log('oldUserData:', oldUserData)
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        console.log('App.jsx - User set from userData:', parsedUser)
      } catch (err) {
        console.error('Error parsing userData:', err)
      }
    } else if (oldUserData) {
      // Fallback for old storage format
      try {
        const parsedUser = JSON.parse(oldUserData)
        setUser(parsedUser)
        console.log('App.jsx - User set from old user data:', parsedUser)
      } catch (err) {
        console.error('Error parsing old user data:', err)
      }
    }
  }, [])

  // Create a logout function that can be passed down
  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('user')
    setUser(null)
    console.log('App.jsx - User logged out')
  }

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/status" element={<Status user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
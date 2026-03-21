import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import MapPage from './pages/MapPage'
import Status from './pages/Status'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('userData')
    const oldUserData = localStorage.getItem('user')

    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (err) {
        console.error('Error parsing userData:', err)
      }
    } else if (oldUserData) {
      try {
        setUser(JSON.parse(oldUserData))
      } catch (err) {
        console.error('Error parsing old user data:', err)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('user')
    setUser(null)
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
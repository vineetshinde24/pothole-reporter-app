import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      console.log("Token found:", !!token);
    };

    checkAuth();
  }, [location]);

  const handleLogout = () => {
    console.log("Navbar - Logging out...");
    
    // Call the logout function from App.jsx
    if (onLogout) {
      onLogout();
    } else {
      // Fallback: clear localStorage directly
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
    }
    
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={user ? "/" : "/"} className="text-xl font-bold hover:text-blue-200">
          Pothole Grievance Reporter
        </Link>
        
        <div className="space-x-4 flex items-center">
          {user ? (
            <>
              {/* Show these links when user is logged in */}
              <Link to="/about" className="hover:text-blue-200 transition-colors">About</Link>
              <Link to="/map" className="hover:text-blue-200 transition-colors">Map</Link>
              <Link to="/status" className="hover:text-blue-200 transition-colors">Status</Link>
              
              {/* Show Admin Dashboard link only for admin users */}
              {(user.role === 'admin' || user.role === 'Admin') && (
                <Link to="/admin" className="hover:text-blue-200 bg-yellow-500 px-3 py-1 rounded transition-colors">
                  Admin Dashboard
                </Link>
              )}
              
              {/* User info and logout */}
              <div className="flex items-center space-x-3 ml-4 border-l border-blue-400 pl-4">
                <span className="text-sm">
                  {user.username || user.name || user.email || 'User'}
                  <span className="ml-1 text-xs bg-blue-500 px-2 py-1 rounded capitalize">
                    {user.role || 'user'}
                  </span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Show these links when user is not logged in */}
              <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
              <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
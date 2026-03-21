import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    setMenuOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("user");
    }
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo - now on one line */}
          <Link to="/" className="text-lg font-bold hover:text-blue-200 whitespace-nowrap">
            🕳️ Pothole Reporter
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/about" className="hover:text-blue-200 transition-colors">About</Link>
                <Link to="/map" className="hover:text-blue-200 transition-colors">Map</Link>
                <Link to="/status" className="hover:text-blue-200 transition-colors">Status</Link>
                {(user.role === 'admin' || user.role === 'Admin') && (
                  <Link to="/admin" className="hover:text-blue-200 bg-yellow-500 px-3 py-1 rounded transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-3 border-l border-blue-400 pl-4">
                  <span className="text-sm">
                    {user.username || user.name || user.email || 'User'}
                    <span className="ml-1 text-xs bg-blue-500 px-2 py-1 rounded capitalize">
                      {user.role || 'user'}
                    </span>
                  </span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm transition-colors">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
                <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 pb-4 space-y-2">
          {user ? (
            <>
              {/* User info */}
              <div className="py-2 border-b border-blue-500 text-sm">
                Logged in as <strong>{user.username || user.email}</strong>
                <span className="ml-2 text-xs bg-blue-500 px-2 py-0.5 rounded capitalize">{user.role || 'user'}</span>
              </div>
              <Link to="/about" className="block py-2 hover:text-blue-200 transition-colors">About</Link>
              <Link to="/map" className="block py-2 hover:text-blue-200 transition-colors">Map</Link>
              <Link to="/status" className="block py-2 hover:text-blue-200 transition-colors">Status</Link>
              {(user.role === 'admin' || user.role === 'Admin') && (
                <Link to="/admin" className="block py-2 text-yellow-300 hover:text-yellow-200 transition-colors">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full mt-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded text-sm transition-colors text-left"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-blue-200 transition-colors">Login</Link>
              <Link to="/register" className="block py-2 hover:text-blue-200 transition-colors">Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
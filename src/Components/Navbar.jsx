import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="px-4">
        <div className="flex justify-between items-center h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-base hover:text-blue-200 shrink-0">
            <img src="/pothole.png" alt="logo" className="h-8 w-8" />
            <span className="hidden sm:inline">Pothole Grievance Reporter</span>
            <span className="sm:hidden">Pothole Grievance Reportor</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link to="/about" className="hover:text-blue-200 transition-colors">About</Link>
                <Link to="/map" className="hover:text-blue-200 transition-colors">Map</Link>
                <Link to="/status" className="hover:text-blue-200 transition-colors">Status</Link>
                {(user.role === 'admin' || user.role === 'Admin') && (
                  <Link to="/admin" className="bg-yellow-500 hover:bg-yellow-400 px-3 py-1 rounded transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center gap-2 border-l border-blue-400 pl-4">
                  <span className="font-medium">{user.username || user.name || user.email || 'User'}</span>
                  <span className="text-xs bg-blue-800 px-2 py-1 rounded capitalize">{user.role || 'user'}</span>
                  <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors ml-1">
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

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-blue-700 px-4 pb-4 space-y-1">
          {user ? (
            <>
              <div className="py-3 border-b border-blue-500 flex items-center gap-2 text-sm">
                <span>👤</span>
                <strong>{user.username || user.email}</strong>
                <span className="text-xs bg-blue-500 px-2 py-0.5 rounded capitalize">{user.role || 'user'}</span>
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
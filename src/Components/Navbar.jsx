import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Pothole Detector</h1>
        <div className="space-x-4">
          <Link to="/">Login</Link>
          <Link to="/map">Map</Link>
          <Link to="/status">Status</Link>
          <Link to="/complaints">Complaints</Link>
        </div>
      </div>
    </nav>
  );
}

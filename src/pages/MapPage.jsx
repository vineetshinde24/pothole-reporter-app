import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import PhotoUpload from "../components/PhotoUpload";
import api from "../utils/api";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusIcons = {
  reported: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Njg1ZjQiIHN0cm9rZT0iIzM2NmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  under_review: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZmQ4M2QiIHN0cm9rZT0iI2ZmYWI0MCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  in_progress: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZjkwMDAiIHN0cm9rZT0iI2ZmNzMwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  resolved: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMGExNTAiIHN0cm9rZT0iIzA4N2MzMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  }),
  rejected: new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlMTExMTEiIHN0cm9rZT0iI2I5MWQxZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  })
};

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapPage() {
  const [potholes, setPotholes] = useState([]);
  const [center, setCenter] = useState([19.14, 72.89]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.user);
      } catch (err) { console.error("Error decoding token:", err); }
    }
  }, []);

  const fetchPotholes = async () => {
    try {
      const response = await api.get(`/potholes/nearby/${center[0]}/${center[1]}?radius=50000`);
      setPotholes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching potholes:", err);
      setError("Failed to load potholes");
    } finally {
      setLoading(false);
    }
  };

  const fetchPotholeImage = async (potholeId) => {
    setImageLoading(true);
    try {
      const response = await api.get(`/potholes/${potholeId}`);
      setSelectedPothole(response.data);
    } catch (err) {
      console.error("Error fetching pothole image:", err);
      setError("Failed to load image");
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => { fetchPotholes(); }, [center]);

  const handlePhotoLocation = (coords) => {
    if (coords && coords.length === 2) {
      setCenter([coords[0], coords[1]]);
      setTimeout(() => fetchPotholes(), 1000);
    }
  };

  const handleUploadSuccess = () => setTimeout(() => fetchPotholes(), 1000);

  const getStatusColor = (status) => {
    const colors = {
      reported: "bg-blue-100 text-blue-800 border-blue-200",
      under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-orange-100 text-orange-800 border-orange-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusText = (status) => {
    const texts = {
      reported: "📝 Reported", under_review: "🔍 Under Review",
      in_progress: "🚧 In Progress", resolved: "✅ Resolved", rejected: "❌ Rejected"
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => statusIcons[status] || statusIcons.reported;

  const getStatusStats = () => {
    if (!Array.isArray(potholes)) return { reported: 0, under_review: 0, in_progress: 0, resolved: 0, rejected: 0 };
    return {
      reported: potholes.filter(p => p.status === 'reported').length,
      under_review: potholes.filter(p => p.status === 'under_review').length,
      in_progress: potholes.filter(p => p.status === 'in_progress').length,
      resolved: potholes.filter(p => p.status === 'resolved').length,
      rejected: potholes.filter(p => p.status === 'rejected').length,
    };
  };

  const statusStats = getStatusStats();

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Pothole Grievance Reporter</h1>
        <p className="text-gray-600 mt-2">Showing all reported potholes that are reported</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <PhotoUpload onLocationFound={handlePhotoLocation} onUploadSuccess={handleUploadSuccess} />
      </div>

      {error && <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>}

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3 text-lg">Pothole Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
            <p className="text-xl font-bold text-blue-600">{statusStats.reported}</p>
            <p className="text-xs text-blue-800">Reported</p>
          </div>
          <div className="p-3 rounded-lg border-2 border-yellow-200 bg-yellow-50">
            <p className="text-xl font-bold text-yellow-600">{statusStats.under_review}</p>
            <p className="text-xs text-yellow-800">Under Review</p>
          </div>
          <div className="p-3 rounded-lg border-2 border-orange-200 bg-orange-50">
            <p className="text-xl font-bold text-orange-600">{statusStats.in_progress}</p>
            <p className="text-xs text-orange-800">In Progress</p>
          </div>
          <div className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
            <p className="text-xl font-bold text-green-600">{statusStats.resolved}</p>
            <p className="text-xs text-green-800">Resolved</p>
          </div>
          <div className="p-3 rounded-lg border-2 border-red-200 bg-red-50">
            <p className="text-xl font-bold text-red-600">{statusStats.rejected}</p>
            <p className="text-xs text-red-800">Rejected</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{potholes.length}</p>
        <p className="text-gray-600">Total Potholes Reported</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold mb-2">Pin Color Indicators</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          {[['blue', 'Reported'], ['yellow', 'Under Review'], ['orange', 'In Progress'], ['green', 'Resolved'], ['red', 'Rejected']].map(([color, label]) => (
            <div key={color} className="flex items-center space-x-2">
              <div className={`w-4 h-4 bg-${color}-500 rounded-full`}></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[90vh] rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
        {loading ? (
          <div className="h-full flex items-center justify-center"><p>Loading potholes...</p></div>
        ) : (
          <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <MapCenterUpdater center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {potholes.map((pothole) => (
              <Marker key={pothole._id} position={[pothole.latitude, pothole.longitude]} icon={getStatusIcon(pothole.status)}>
                <Popup closeOnClick={false}>
                  <div className="text-center min-w-[220px]">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-bold text-gray-800">Pothole Report</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pothole.status)}`}>
                        {getStatusText(pothole.status)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-left">
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <div className="font-mono text-xs">{pothole.latitude.toFixed(6)}, {pothole.longitude.toFixed(6)}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">AI Confidence:</span>
                        <span className="font-medium">{pothole.ai_confidence ? `${(pothole.ai_confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reported by:</span>
                        <span className="font-medium">{pothole.reportedBy?.username || 'Unknown'}</span>
                      </div>
                      {pothole.resolvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Resolved:</span>
                          <span className="font-medium text-green-600 text-xs">{new Date(pothole.resolvedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      {pothole.resolutionNotes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border">
                          <span className="text-gray-600 text-xs block mb-1">Admin Notes:</span>
                          <span className="text-gray-800 text-xs">{pothole.resolutionNotes}</span>
                        </div>
                      )}
                    </div>
                    {currentUser && (
                      <button
                        onClick={(e) => { e.stopPropagation(); fetchPotholeImage(pothole._id); }}
                        className="mt-3 w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm"
                      >
                        Show Image
                      </button>
                    )}
                    {selectedPothole && selectedPothole._id === pothole._id && (
                      <div className="mt-3">
                        {imageLoading ? (
                          <p className="text-sm">Loading image...</p>
                        ) : selectedPothole.image ? (
                          <div className="space-y-2">
                            <img src={selectedPothole.image} alt="Pothole" className="w-full h-32 object-cover rounded border" />
                            <p className="text-xs text-gray-500 text-center">Click outside to close</p>
                          </div>
                        ) : (
                          <p className="text-sm text-red-500">No image available</p>
                        )}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState, useEffect, useCallback } from "react";
import PhotoUpload from "../components/PhotoUpload";
import api from "../utils/api";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusIcons = {
  reported:     new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiM0Njg1ZjQiIHN0cm9rZT0iIzM2NmZmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
  under_review: new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZmQ4M2QiIHN0cm9rZT0iI2ZmYWI0MCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
  in_progress:  new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNmZjkwMDAiIHN0cm9rZT0iI2ZmNzMwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
  resolved:     new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMxMGExNTAiIHN0cm9rZT0iIzA4N2MzMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
  rejected:     new L.Icon({ iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNlMTExMTEiIHN0cm9rZT0iI2I5MWQxZCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+', iconSize: [25,41], iconAnchor: [12,41], popupAnchor: [1,-34] }),
};

function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.[0] && center?.[1]) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const toImageSrc = (image, contentType = 'image/jpeg') => {
  if (!image) return null;
  if (typeof image === 'string') {
    if (image.startsWith('data:') || image.startsWith('http')) return image;
    return `data:${contentType};base64,${image}`;
  }
  if (image?.type === 'Buffer' && Array.isArray(image.data)) {
    const bytes = new Uint8Array(image.data);
    let binary = '';
    bytes.forEach(b => { binary += String.fromCharCode(b); });
    return `data:${contentType};base64,${btoa(binary)}`;
  }
  return null;
};

export default function MapPage() {
  const [potholes, setPotholes]       = useState([]);
  const [center, setCenter]           = useState([19.14, 72.89]);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [potholeImages, setPotholeImages] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(payload.user);
      } catch (e) { console.error("Token decode error:", e); }
    }
  }, []);

  // FIX: fetch ALL potholes, not just nearby ones.
  // Uses the new /potholes/all endpoint — no center point needed,
  // returns up to 500 records, safe for MongoDB Atlas M0.
  const fetchAllPotholes = useCallback(async () => {
    try {
      const response = await api.get('/potholes/all');
      setPotholes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching potholes:", err);
      setError("Failed to load potholes");
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount — load everything
  useEffect(() => { fetchAllPotholes(); }, [fetchAllPotholes]);

  const fetchPotholeImage = async (potholeId, contentType) => {
    if (potholeImages[potholeId]?.src) return;
    setPotholeImages(prev => ({ ...prev, [potholeId]: { loading: true, src: null } }));
    try {
      const response = await api.get(`/potholes/${potholeId}`);
      const src = toImageSrc(response.data.image, contentType || response.data.contentType || 'image/jpeg');
      setPotholeImages(prev => ({ ...prev, [potholeId]: { loading: false, src } }));
    } catch (err) {
      console.error("Error fetching pothole image:", err);
      setPotholeImages(prev => ({ ...prev, [potholeId]: { loading: false, src: null, error: true } }));
    }
  };

  // After upload: move map to the new pothole's location, then refresh all potholes
  const handlePhotoLocation = (coords) => {
    if (coords?.length === 2) {
      setCenter([coords[0], coords[1]]);
    }
  };

  const handleUploadSuccess = () => {
    // Small delay to let the backend finish writing before re-fetching
    setTimeout(() => fetchAllPotholes(), 1500);
  };

  const getStatusColor = (status) => ({
    reported:     "bg-blue-100 text-blue-800 border-blue-200",
    under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress:  "bg-orange-100 text-orange-800 border-orange-200",
    resolved:     "bg-green-100 text-green-800 border-green-200",
    rejected:     "bg-red-100 text-red-800 border-red-200",
  }[status] || "bg-gray-100 text-gray-800 border-gray-200");

  const getStatusText = (status) => ({
    reported:     "📝 Reported",
    under_review: "🔍 Under Review",
    in_progress:  "🚧 In Progress",
    resolved:     "✅ Resolved",
    rejected:     "❌ Rejected",
  }[status] || status);

  const getStatusIcon = (status) => statusIcons[status] || statusIcons.reported;

  const statusStats = {
    reported:     potholes.filter(p => p.status === 'reported').length,
    under_review: potholes.filter(p => p.status === 'under_review').length,
    in_progress:  potholes.filter(p => p.status === 'in_progress').length,
    resolved:     potholes.filter(p => p.status === 'resolved').length,
    rejected:     potholes.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">Pothole Grievance Reporter</h1>
        <p className="text-gray-600 mt-2">Showing all reported potholes across all locations</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <PhotoUpload onLocationFound={handlePhotoLocation} onUploadSuccess={handleUploadSuccess} />
      </div>

      {error && <div className="bg-red-50 p-4 rounded text-red-700">{error}</div>}

      {/* Status stats — same layout as Status page */}
      <div className="flex flex-wrap justify-center gap-3 text-center">
        {[
          ['blue',   'reported',     'Reported'],
          ['yellow', 'under_review', 'Under Review'],
          ['orange', 'in_progress',  'In Progress'],
          ['green',  'resolved',     'Resolved'],
          ['red',    'rejected',     'Rejected'],
        ].map(([color, key, label]) => (
          <div key={key} className={`p-3 rounded-lg border-2 border-${color}-200 bg-${color}-50 flex-1 min-w-[120px] max-w-[200px]`}>
            <p className={`text-xl font-bold text-${color}-600`}>{statusStats[key]}</p>
            <p className={`text-xs text-${color}-800`}>{label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-2xl font-bold text-blue-600">{potholes.length}</p>
        <p className="text-gray-600">Total Potholes Reported</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold mb-2">Pin Color Indicators</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          {[['blue','Reported'],['yellow','Under Review'],['orange','In Progress'],['green','Resolved'],['red','Rejected']].map(([color, label]) => (
            <div key={color} className="flex items-center space-x-2">
              <div className={`w-4 h-4 bg-${color}-500 rounded-full`}></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[90vh] rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 mx-5 mb-4">
        {loading ? (
          <div className="h-full flex items-center justify-center"><p>Loading potholes...</p></div>
        ) : (
          <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <MapCenterUpdater center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {potholes.map((pothole) => {
              const imgState = potholeImages[pothole._id];
              return (
                <Marker
                  key={pothole._id}
                  position={[pothole.latitude, pothole.longitude]}
                  icon={getStatusIcon(pothole.status)}
                >
                  <Popup closeOnClick={false} minWidth={240}>
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
                        <div className="mt-3">
                          {!imgState && (
                            <button
                              onClick={(e) => { e.stopPropagation(); fetchPotholeImage(pothole._id, pothole.contentType); }}
                              className="w-full bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm"
                            >
                              📸 Show Image
                            </button>
                          )}
                          {imgState?.loading && (
                            <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                              Loading image...
                            </div>
                          )}
                          {imgState && !imgState.loading && imgState.src && (
                            <div className="space-y-1 mt-1">
                              <img
                                src={imgState.src}
                                alt="Pothole"
                                className="w-full h-32 object-cover rounded border"
                                style={{ imageOrientation: 'from-image' }}
                              />
                              <p className="text-xs text-gray-400 text-center">Click outside to close</p>
                            </div>
                          )}
                          {imgState && !imgState.loading && !imgState.src && (
                            <p className="text-sm text-red-500 mt-1">
                              {imgState.error ? 'Failed to load image' : 'No image available'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
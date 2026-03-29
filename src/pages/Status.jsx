import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import api from "../utils/api";

// Convert binary to base64 for image display (browser-safe)
const toImageSrc = (image, contentType = 'image/jpeg') => {
  if (!image) return null;
  if (typeof image === 'string') {
    if (image.startsWith('data:') || image.startsWith('http')) return image;
    return `data:${contentType};base64,${image}`;
  }
  if (image?.type === 'Buffer' && Array.isArray(image.data)) {
    const bytes = new Uint8Array(image.data);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return `data:${contentType};base64,${btoa(binary)}`;
  }
  return null;
};

// Status config
const STATUS_CONFIG = {
  reported:     { label: 'Reported', color: 'blue', icon: '📝' },
  under_review: { label: 'Under Review', color: 'yellow', icon: '🔍' },
  in_progress:  { label: 'In Progress', color: 'orange', icon: '🚧' },
  resolved:     { label: 'Resolved', color: 'green', icon: '✅' },
  rejected:     { label: 'Rejected', color: 'red', icon: '❌' },
};

// Severity colors
const SEVERITY_COLOR = {
  'severe':     { label: 'SEVERE',     bg: 'bg-red-500',    border: 'border-red-600',    text: 'text-white' },
  'non_severe': { label: 'NON SEVERE', bg: 'bg-orange-500', border: 'border-orange-600', text: 'text-white' },
  'unknown':    { label: 'UNKNOWN',    bg: 'bg-gray-300',   border: 'border-gray-400',   text: 'text-gray-800' }
};

const getAIConfidenceColor = (confidence) => {
  if (confidence > 0.8) return "bg-green-100 text-green-800";
  if (confidence > 0.6) return "bg-yellow-100 text-yellow-800";
  return "bg-orange-100 text-orange-800";
};

const getAIConfidenceText = (confidence) => {
  if (confidence > 0.8) return "High Confidence";
  if (confidence > 0.6) return "Medium Confidence";
  return "Low Confidence";
};

export default function Status() {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  // Same pattern as MapPage: keyed by pothole._id → { loading, src, error }
  const [potholeImages, setPotholeImages] = useState({});

  useEffect(() => { fetchUserPotholes(); }, []);

  const fetchUserPotholes = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setError("Please log in to view your reports"); setLoading(false); return; }
      const response = await api.get("/potholes");
      const data = Array.isArray(response.data) ? response.data : [];
      setPotholes(data);
      // Pre-fetch images for all potholes immediately after loading list
      data.forEach(p => fetchPotholeImage(p._id, p.contentType));
    } catch (err) {
      console.error("Error fetching potholes:", err);
      setError("Failed to load your pothole reports");
    } finally {
      setLoading(false);
    }
  };

  // Exactly the same fetch logic as MapPage
  const fetchPotholeImage = async (potholeId, contentType) => {
    setPotholeImages(prev => {
      if (prev[potholeId]?.src || prev[potholeId]?.loading) return prev; // already done / in-flight
      return { ...prev, [potholeId]: { loading: true, src: null } };
    });
    try {
      const response = await api.get(`/potholes/${potholeId}`);
      const src = toImageSrc(
        response.data.image,
        contentType || response.data.contentType || 'image/jpeg'
      );
      setPotholeImages(prev => ({ ...prev, [potholeId]: { loading: false, src } }));
    } catch (err) {
      console.error("Error fetching pothole image:", err);
      setPotholeImages(prev => ({ ...prev, [potholeId]: { loading: false, src: null, error: true } }));
    }
  };

  const getStatusStats = () => ({
    reported:     potholes.filter(p => p.status === 'reported').length,
    under_review: potholes.filter(p => p.status === 'under_review').length,
    in_progress:  potholes.filter(p => p.status === 'in_progress').length,
    resolved:     potholes.filter(p => p.status === 'resolved').length,
    rejected:     potholes.filter(p => p.status === 'rejected').length,
  });

  const openImageModal = (pothole) => {
    const imgState = potholeImages[pothole._id];
    if (!imgState?.src) return;
    setSelectedImage({
      src: imgState.src,
      location: `${pothole.latitude.toFixed(6)}, ${pothole.longitude.toFixed(6)}`,
      reportedDate: pothole.reportedAt || pothole.createdAt,
      resolvedDate: pothole.resolvedAt || null,
      confidence: pothole.ai_confidence ?? null,
      severity: pothole.severity || 'unknown'
    });
  };

  if (loading) return (
    <motion.div className="p-6" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
      <div className="flex justify-center items-center h-32"><p>Loading your reports...</p></div>
    </motion.div>
  );

  const statusStats = getStatusStats();

  return (
    <motion.div className="p-6" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
      <h2 className="text-2xl text-center font-bold mb-6">My Pothole Reports</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Image modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-full overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pothole Image</h3>
              <button onClick={() => setSelectedImage(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            <div className="p-4">
              <img src={selectedImage.src} alt="Pothole" className="w-full h-auto rounded-lg" style={{ imageOrientation: 'from-image' }} />
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Location:</strong> {selectedImage.location}</p>
                <p><strong>Reported:</strong> {new Date(selectedImage.reportedDate).toLocaleString()}</p>
                {selectedImage.resolvedDate && <p><strong>Resolved:</strong> {new Date(selectedImage.resolvedDate).toLocaleString()}</p>}
                <p><strong>Severity:</strong> {selectedImage.severity.toUpperCase()}</p>
                <p><strong>AI Confidence:</strong> {selectedImage.confidence !== null ? `${(selectedImage.confidence * 100).toFixed(1)}%` : 'N/A'}</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setSelectedImage(null)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Close</button>
            </div>
          </div>
        </div>
      )}

      {potholes.length === 0 && !error ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-700">You haven't reported any potholes yet.</p>
          <p className="text-blue-600 mt-2">Go to the Map page to report your first pothole!</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Status overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="font-semibold text-center mb-3 text-lg">Report Status Overview</h3>
            <div className="flex flex-wrap justify-center gap-3 text-center">
              {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
                <div key={key} className={`p-3 rounded-lg border-2 border-${color}-200 bg-${color}-50 flex-1 min-w-[120px] max-w-[200px]`}>
                  <p className={`text-xl font-bold text-${color}-600`}>{statusStats[key]}</p>
                  <p className={`text-xs text-${color}-800`}>{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Total count */}
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{potholes.length}</p>
            <p className="text-gray-600">Total Reports</p>
          </div>

          {/* Pothole cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {potholes.map((pothole) => {
              const imgState = potholeImages[pothole._id];
              const severityKey = pothole.severity || 'unknown';
              const severity = SEVERITY_COLOR[severityKey];

              return (
                <motion.div
                  key={pothole._id}
                  className="bg-white rounded-lg shadow-md p-4 border flex flex-col justify-between h-full"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Image area */}
                  <div className="mb-3">
                    {/* Loading spinner */}
                    {imgState?.loading && (
                      <div className="w-full h-32 flex items-center justify-center gap-2 bg-gray-50 rounded-lg border text-sm text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                        Loading image...
                      </div>
                    )}

                    {/* Loaded image */}
                    {imgState?.src && !imgState.loading && (
                      <div className="cursor-pointer" onClick={() => openImageModal(pothole)}>
                        <img
                          src={imgState.src}
                          alt="Pothole"
                          className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                          style={{ imageOrientation: 'from-image' }}
                        />
                        <p className="text-xs text-gray-500 text-center mt-1">Click to view full image</p>
                      </div>
                    )}

                    {/* Error / no image */}
                    {imgState && !imgState.loading && !imgState.src && (
                      <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg border text-sm text-gray-400">
                        {imgState.error ? '⚠️ Failed to load image' : 'No image available'}
                      </div>
                    )}
                  </div>

                  <div className="text-center mb-3">
                    <h3 className="font-bold text-gray-800 pb-3">Pothole Report</h3>
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[pothole.status]?.color ? `bg-${STATUS_CONFIG[pothole.status].color}-100 text-${STATUS_CONFIG[pothole.status].color}-800 border-${STATUS_CONFIG[pothole.status].color}-200` : 'bg-gray-100 text-gray-800'}`}>
                        {STATUS_CONFIG[pothole.status]?.icon} {STATUS_CONFIG[pothole.status]?.label}
                      </span>
                      <span className={`${severity.bg} ${severity.text} ${severity.border} px-2 py-1 rounded-full text-xs font-medium border`}>{severity.label}</span>
                      {pothole.ai_confidence !== undefined && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAIConfidenceColor(pothole.ai_confidence)}`}>
                          {getAIConfidenceText(pothole.ai_confidence)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-right">{pothole.latitude.toFixed(6)}, {pothole.longitude.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported:</span>
                      <span className="font-medium">{new Date(pothole.reportedAt || pothole.createdAt).toLocaleString()}</span>
                    </div>
                    {pothole.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolved:</span>
                        <span className="font-medium text-green-600">{new Date(pothole.resolvedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex space-x-2">
                    <button onClick={() => { navigator.clipboard.writeText(`${pothole.latitude}, ${pothole.longitude}`); alert('Coordinates copied!'); }} className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm">
                      Copy Coordinates
                    </button>
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${pothole.latitude},${pothole.longitude}`, '_blank')} className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm">
                      View on Google Maps
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Status() {
  const [potholes, setPotholes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchUserPotholes();
  }, []);

  const fetchUserPotholes = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in to view your reports");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3000/potholes", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPotholes(response.data);
    } catch (err) {
      console.error("Error fetching potholes:", err);
      setError("Failed to load your pothole reports");
    } finally {
      setLoading(false);
    }
  };

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
      reported: "📝 Reported",
      under_review: "🔍 Under Review",
      in_progress: "🚧 In Progress",
      resolved: "✅ Resolved",
      rejected: "❌ Rejected"
    };
    return texts[status] || status;
  };

  const getAIConfidenceColor = (confidence) => {
    if (confidence > 0.8) return "bg-green-100 text-green-800";
    if (confidence > 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getAIConfidenceText = (confidence) => {
    if (confidence > 0.8) return "High Confidence";
    if (confidence > 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  const getStatusStats = () => {
    const stats = {
      reported: potholes.filter(p => p.status === 'reported').length,
      under_review: potholes.filter(p => p.status === 'under_review').length,
      in_progress: potholes.filter(p => p.status === 'in_progress').length,
      resolved: potholes.filter(p => p.status === 'resolved').length,
      rejected: potholes.filter(p => p.status === 'rejected').length
    };
    return stats;
  };

  // ✅ Function to get image URL
  const getImageUrl = (pothole) => {
    if (pothole.imageUrl) {
      return pothole.imageUrl;
    }
    if (pothole.imageId) {
      return `http://localhost:3000/potholes/${pothole._id}/image`;
    }
    return null;
  };

  // ✅ Function to view image in modal
  const viewImage = (pothole) => {
    const imageUrl = getImageUrl(pothole);
    if (imageUrl) {
      setSelectedImage({
        url: imageUrl,
        location: `${pothole.latitude.toFixed(6)}, ${pothole.longitude.toFixed(6)}`,
        date: new Date(pothole.createdAt).toLocaleDateString(),
        confidence: pothole.ai_confidence ? `${(pothole.ai_confidence * 100).toFixed(1)}%` : 'N/A'
      });
    }
  };

  if (loading) {
    return (
      <motion.div
        className="p-6"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex justify-center items-center h-32">
          <p>Loading your reports...</p>
        </div>
      </motion.div>
    );
  }

  const statusStats = getStatusStats();

  return (
    <motion.div
      className="p-6"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <h2 className="text-2xl font-bold mb-6">My Pothole Reports</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* ✅ Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl max-h-full overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pothole Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage.url}
                alt="Pothole"
                className="w-full h-auto rounded-lg"
              />
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><strong>Location:</strong> {selectedImage.location}</p>
                <p><strong>Reported:</strong> {selectedImage.date}</p>
                <p><strong>AI Confidence:</strong> {selectedImage.confidence}</p>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Close
              </button>
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
          {/* Status Summary */}
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-semibold mb-4 text-lg">Report Status Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className={`p-4 rounded-lg border-2 ${getStatusColor('reported')}`}>
                <p className="text-2xl font-bold">{statusStats.reported}</p>
                <p className="text-sm">Reported</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor('under_review')}`}>
                <p className="text-2xl font-bold">{statusStats.under_review}</p>
                <p className="text-sm">Under Review</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor('in_progress')}`}>
                <p className="text-2xl font-bold">{statusStats.in_progress}</p>
                <p className="text-sm">In Progress</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor('resolved')}`}>
                <p className="text-2xl font-bold">{statusStats.resolved}</p>
                <p className="text-sm">Resolved</p>
              </div>
              <div className={`p-4 rounded-lg border-2 ${getStatusColor('rejected')}`}>
                <p className="text-2xl font-bold">{statusStats.rejected}</p>
                <p className="text-sm">Rejected</p>
              </div>
            </div>
          </motion.div>

          {/* Pothole Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {potholes.map((pothole) => {
              const imageUrl = getImageUrl(pothole);
              
              return (
                <motion.div
                  key={pothole._id}
                  className="bg-white rounded-lg shadow-md p-4 border"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* ✅ Image Preview */}
                  {imageUrl && (
                    <div className="mb-3 cursor-pointer" onClick={() => viewImage(pothole)}>
                      <img
                        src={imageUrl}
                        alt="Pothole"
                        className="w-full h-32 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                      />
                      <p className="text-xs text-gray-500 text-center mt-1">Click to view full image</p>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-800">Pothole Report</h3>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pothole.status)}`}>
                        {getStatusText(pothole.status)}
                      </span>
                      {pothole.ai_confidence && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAIConfidenceColor(pothole.ai_confidence)}`}>
                          {getAIConfidenceText(pothole.ai_confidence)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium text-right">
                        {pothole.latitude.toFixed(6)}<br/>
                        {pothole.longitude.toFixed(6)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Confidence:</span>
                      <span className="font-medium">
                        {pothole.ai_confidence ? `${(pothole.ai_confidence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reported:</span>
                      <span className="font-medium">
                        {new Date(pothole.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {pothole.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Resolved:</span>
                        <span className="font-medium text-green-600">
                          {new Date(pothole.resolvedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {pothole.resolutionNotes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border">
                        <span className="text-gray-600 text-xs block mb-1">Admin Notes:</span>
                        <span className="text-gray-800 text-sm">{pothole.resolutionNotes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${pothole.latitude}, ${pothole.longitude}`);
                        alert('Coordinates copied to clipboard!');
                      }}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition text-sm"
                    >
                      Copy Coordinates
                    </button>
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps?q=${pothole.latitude},${pothole.longitude}`;
                        window.open(url, '_blank');
                      }}
                      className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition text-sm"
                    >
                      View on Google Maps
                    </button>
                  </div>

                  {/* ✅ View Image Button (alternative to image preview) */}
                  {imageUrl && (
                    <button
                      onClick={() => viewImage(pothole)}
                      className="w-full mt-2 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition text-sm"
                    >
                      📸 View Full Image
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <motion.div 
            className="bg-gray-50 rounded-lg p-4 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-semibold mb-2">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{potholes.length}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {potholes.filter(p => p.ai_verified).length}
                </p>
                <p className="text-sm text-gray-600">AI Verified</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {potholes.filter(p => p.ai_confidence > 0.8).length}
                </p>
                <p className="text-sm text-gray-600">High Confidence</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {statusStats.resolved}
                </p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
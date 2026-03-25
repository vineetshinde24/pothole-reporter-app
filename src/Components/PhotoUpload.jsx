import { useState, useRef } from "react";
import api from "../utils/api";
import * as exifr from "exifr";

export default function PhotoUpload({ onLocationFound, onUploadSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [gpsSource, setGpsSource] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); };

  const getBrowserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setGpsSource(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setError("Please log in first"); return; }

      let gps = null;
      try {
        gps = await exifr.gps(file);
      } catch (e) {
        console.log("EXIF read failed, trying browser GPS");
      }

      if (!gps?.latitude || !gps?.longitude) {
        try {
          gps = await getBrowserLocation();
          setGpsSource('browser');
        } catch (locationErr) {
          setError("No GPS data found. Please enable location services in your browser/device settings.");
          return;
        }
      } else {
        setGpsSource('exif');
      }

      if (onLocationFound) onLocationFound([gps.latitude, gps.longitude]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("latitude", gps.latitude);
    formData.append("longitude", gps.longitude);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message) {
        if (response.data.confidence) {
          setSuccess(`✅ AI Verified! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
        } else {
          setSuccess("Upload successful!");
        }
        if (onUploadSuccess) onUploadSuccess();
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }

    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.verified === false) {
        setError(`❌ ${err.response.data.message} (Confidence: ${(err.response.data.confidence * 100).toFixed(1)}%)`);
      } else {
        setError(err.response?.data?.message || "Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <label className="block text-sm font-medium">Upload Pothole Photo</label>

      {/* Mobile Camera Button */}
      <button
        onClick={() => cameraInputRef.current?.click()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 md:hidden"
      >
        📷 Take Photo with Camera
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInputChange}
        disabled={loading}
        className="hidden"
      />

      {/* Drag and Drop / File picker */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-2">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex text-sm text-gray-600 justify-center">
            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 10MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          disabled={loading}
          className="hidden"
        />
      </div>

      {gpsSource === 'browser' && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          📍 Location from your device GPS
        </div>
      )}
      {gpsSource === 'exif' && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          📍 Location from photo metadata
        </div>
      )}

      {loading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <p className="text-sm">AI verifying image...</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
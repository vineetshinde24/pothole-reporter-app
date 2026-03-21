import { useState, useRef } from "react";
import api from "../utils/api";
import * as exifr from "exifr";

export default function PhotoUpload({ onLocationFound, onUploadSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
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

    try {
      const gps = await exifr.gps(file);
      if (!gps?.latitude || !gps?.longitude) {
        setError("No GPS data found. Enable location services.");
        return;
      }

      if (onLocationFound) {
        onLocationFound([gps.latitude, gps.longitude]);
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Please log in first");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      // api instance handles baseURL and Authorization header automatically
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message) {
        if (response.data.confidence) {
          setSuccess(`✅ AI Verified! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`);
        } else {
          setSuccess("Upload successful!");
        }
        
        if (onUploadSuccess) {
          onUploadSuccess();
        }
        
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <label className="block text-sm font-medium">Upload Pothole Photo</label>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="space-y-2">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          
          <div className="flex text-sm text-gray-600 justify-center">
            <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
              Click to upload
            </span>
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
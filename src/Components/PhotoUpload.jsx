import { useState, useRef, useEffect } from "react";
import api from "../utils/api";
import * as exifr from "exifr";

const LOC_IDLE    = 'idle';
const LOC_ASKING  = 'asking';
const LOC_GRANTED = 'granted';
const LOC_DENIED  = 'denied';
const LOC_ERROR   = 'error';

export default function PhotoUpload({ onLocationFound, onUploadSuccess }) {
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [gpsSource, setGpsSource] = useState(null);

  // Location gate
  const [locStatus, setLocStatus] = useState(LOC_IDLE);
  const [cachedCoords, setCachedCoords] = useState(null); // reuse if already granted

  const fileInputRef   = useRef(null);
  const cameraInputRef = useRef(null);

  // On mount, ask for location immediately so browser dialog appears
  // before the user thinks about uploading a file.
  useEffect(() => {
    promptLocation();
  }, []);

  const promptLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus(LOC_ERROR);
      return;
    }
    setLocStatus(LOC_ASKING);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setCachedCoords(coords);
        setLocStatus(LOC_GRANTED);
        if (onLocationFound) onLocationFound([coords.latitude, coords.longitude]);
      },
      (err) => {
        setLocStatus(err.code === err.PERMISSION_DENIED ? LOC_DENIED : LOC_ERROR);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
    e.target.value = "";
  };

  const getBrowserLocation = () => {
    // If we already have coords from the upfront prompt, reuse them instantly
    if (cachedCoords) return Promise.resolve(cachedCoords);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error("Geolocation not supported")); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const convertToJpeg = (file) => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
              resolve(new File([blob], newName, { type: "image/jpeg" }));
            } else {
              reject(new Error("Canvas conversion failed"));
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
      img.src = url;
    });
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.name.match(/\.(heic|heif)$/i)) {
      setError("Please upload an image file");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    setGpsSource(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) { setError("Please log in first"); setLoading(false); return; }

      // 1. Try EXIF GPS from the original file first
      let gps = null;
      try {
        const result = await exifr.gps(file);
        if (result?.latitude && result?.longitude) gps = result;
      } catch (exifErr) {
        console.warn("EXIF extraction error:", exifErr);
      }

      // 2. Fall back to browser GPS (uses cached coords if already granted)
      if (!gps) {
        try {
          gps = await getBrowserLocation();
          setGpsSource("browser");
        } catch (locationErr) {
          setError(
            locStatus === LOC_DENIED
              ? "Location access was denied. Please enable it in your browser settings and try again."
              : "No GPS data found in photo and device location is unavailable. Please enable location permissions and try again."
          );
          setLoading(false);
          return;
        }
      } else {
        setGpsSource("exif");
      }

      if (onLocationFound) onLocationFound([gps.latitude, gps.longitude]);

      // 3. Convert HEIC to JPEG after EXIF extraction
      let uploadFile = file;
      if (file.type === "image/heic" || file.type === "image/heif" || file.name.match(/\.(heic|heif)$/i)) {
        try { uploadFile = await convertToJpeg(file); }
        catch (convErr) { console.warn("HEIC conversion failed, uploading original:", convErr); }
      }

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("latitude", gps.latitude);
      formData.append("longitude", gps.longitude);

      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message) {
        setSuccess(
          response.data.confidence
            ? `✅ AI Verified! Confidence: ${(response.data.confidence * 100).toFixed(1)}%`
            : "Upload successful!"
        );
        if (onUploadSuccess) onUploadSuccess();
      }
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.verified === false) {
        setError(`❌ ${err.response.data.message} (Confidence: ${(err.response.data.confidence * 100).toFixed(1)}%)`);
      } else {
        setError(err.response?.data?.message || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Location status banner shown above the upload UI
  const renderLocBanner = () => {
    if (locStatus === LOC_ASKING) return (
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 shrink-0" />
        Waiting for location permission…
      </div>
    );
    if (locStatus === LOC_GRANTED) return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
        <span>📍</span>
        <span>Location access granted — your reports will be pinned accurately.</span>
      </div>
    );
    if (locStatus === LOC_DENIED) return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p className="font-medium mb-1">⚠️ Location access denied</p>
        <p className="text-xs text-yellow-700">
          Photos with GPS metadata will still work. For photos without it, enable location in your browser settings then{" "}
          <button onClick={promptLocation} className="underline font-medium hover:text-yellow-900">try again</button>.
        </p>
      </div>
    );
    if (locStatus === LOC_ERROR) return (
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p className="font-medium mb-1">⚠️ Location unavailable</p>
        <p className="text-xs text-yellow-700">
          Your browser doesn't support location access. Photos with GPS metadata will still work.
        </p>
      </div>
    );
    return null;
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <label className="block text-sm font-medium">Upload Pothole Photo</label>

      {/* Location permission banner */}
      {renderLocBanner()}

      <button
        onClick={() => cameraInputRef.current?.click()}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
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

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <div className="space-y-2">
          <div className="text-gray-400">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex text-sm text-gray-600 justify-center">
            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, JPEG, HEIC up to 10MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.heic,.heif"
          onChange={handleFileInputChange}
          disabled={loading}
          className="hidden"
        />
      </div>

      <style>{`img { image-orientation: from-image; }`}</style>

      {gpsSource === "browser" && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          📍 Location from your device GPS
        </div>
      )}
      {gpsSource === "exif" && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          📍 Location from photo metadata
        </div>
      )}

      {loading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
          <p className="text-sm">AI verifying image…</p>
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
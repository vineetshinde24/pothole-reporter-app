import { useState } from "react";
import EXIF from "exif-js";

export default function PhotoUpload({ onLocationFound }) {
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Read file as binary
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = reader.result;
        EXIF.getData({ src: data }, function () {
          const lat = EXIF.getTag(this, "GPSLatitude");
          const lon = EXIF.getTag(this, "GPSLongitude");
          const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
          const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "E";

          if (lat && lon) {
            const latitude =
              (lat[0] + lat[1] / 60 + lat[2] / 3600) *
              (latRef === "N" ? 1 : -1);
            const longitude =
              (lon[0] + lon[1] / 60 + lon[2] / 3600) *
              (lonRef === "E" ? 1 : -1);

            onLocationFound([latitude, longitude]);
          } else {
            setError("No GPS data found in this image. Make sure location is ON when taking the photo.");
          }
        });
      } catch (err) {
        setError("Failed to read image EXIF data.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Upload Pothole Photo</label>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

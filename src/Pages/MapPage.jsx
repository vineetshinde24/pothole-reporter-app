import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../utils/leafletIcon";
import { useState } from "react";
import PhotoUpload from "../Components/PhotoUpload";

export default function MapPage() {
  const [potholes, setPotholes] = useState([
    { id: 1, lat: 28.6139, lng: 77.2090, severity: "High" },
  ]);

  const handlePhotoLocation = (coords) => {
    const newPothole = {
      id: Date.now(),
      lat: coords[0],
      lng: coords[1],
      severity: "Medium",
    };
    setPotholes((prev) => [...prev, newPothole]);
  };

  return (
    <div className="space-y-4">
      <PhotoUpload onLocationFound={handlePhotoLocation} />

      <div className="h-[70vh] rounded-lg overflow-hidden shadow">
        <MapContainer center={[28.6139, 77.2090]} zoom={12} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {potholes.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <strong>Severity:</strong> {p.severity}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

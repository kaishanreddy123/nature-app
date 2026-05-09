import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

export default function MapView({ location, places }) {
  if (!location) return null;

  return (
    <MapContainer
      center={[
        location.latitude,
        location.longitude,
      ]}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* USER */}
      <Marker
        position={[
          location.latitude,
          location.longitude,
        ]}
      >
        <Popup>
          You are here 📍
        </Popup>
      </Marker>

      {/* PLACES */}
      {places?.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
        >
          <Popup>
            <div>
              <h3>{place.name}</h3>

              <p>{place.category}</p>

              <p>👍 {place.upvotes}</p>

              <p>👎 {place.downvotes}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
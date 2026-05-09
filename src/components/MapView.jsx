import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

export default function MapView({ location, places }) {
  if (!location) return null;

  return (
    <MapContainer
      center={[location.latitude, location.longitude]}
      zoom={13}
      style={{
        height: "500px",
        width: "100%",
        marginTop: "20px",
        borderRadius: "12px",
      }}
    >
      {/* FREE OpenStreetMap tiles */}
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 📍 User marker */}
      <Marker position={[location.latitude, location.longitude]}>
        <Popup>You are here 📍</Popup>
      </Marker>

      {/* 🌿 Nature places */}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
        >
          <Popup>
            <strong>{place.name}</strong>
            <br />
            {place.category}
            <br />
            👍 {place.upvotes}
            <br />
            👎 {place.downvotes}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
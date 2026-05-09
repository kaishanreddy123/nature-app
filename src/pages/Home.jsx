import { useEffect, useState } from "react";

export default function Home({ user }) {
  const [location, setLocation] = useState(null);

  const [places, setPlaces] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [placeName, setPlaceName] = useState("");

  const [category, setCategory] = useState("Lake");

  // GET LOCATION
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);

        alert("Unable to fetch location");
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  // ADD PLACE
  const handleAddPlace = () => {
    if (!placeName) {
      alert("Enter place name");
      return;
    }

    // DUPLICATE CHECK
    const alreadyExists = places.some(
      (place) =>
        place.name.toLowerCase().trim() ===
        placeName.toLowerCase().trim()
    );

    if (alreadyExists) {
      alert("Location already exists");
      return;
    }

    const newPlace = {
      id: Date.now(),
      name: placeName,
      category,
      shoutouts: 0,
      slashIts: 0,
      votedUsers: [],
    };

    setPlaces([newPlace, ...places]);

    setPlaceName("");

    setShowForm(false);
  };

  // SHOUTOUT
  const handleShoutout = (id) => {
    const updatedPlaces = places.map((place) => {
      if (place.id === id) {

        // PREVENT MULTIPLE VOTES
        if (place.votedUsers.includes(user.uid)) {
          alert("You already reacted");
          return place;
        }

        return {
          ...place,
          shoutouts: place.shoutouts + 1,
          votedUsers: [...place.votedUsers, user.uid],
        };
      }

      return place;
    });

    setPlaces(updatedPlaces);
  };

  // SLASH IT
  const handleSlashIt = (id) => {
    const updatedPlaces = places.map((place) => {
      if (place.id === id) {

        // PREVENT MULTIPLE VOTES
        if (place.votedUsers.includes(user.uid)) {
          alert("You already reacted");
          return place;
        }

        return {
          ...place,
          slashIts: place.slashIts + 1,
          votedUsers: [...place.votedUsers, user.uid],
        };
      }

      return place;
    });

    setPlaces(updatedPlaces);
  };

  return (
    <div className="min-h-screen bg-[#eef6ee] p-3">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

          <h1 className="text-2xl md:text-3xl font-bold text-green-700">
            🌿 Nature App
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Welcome, {user?.displayName}
          </p>

        </div>

        {/* TOP BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <button
            onClick={getLocation}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-medium transition"
          >
            📍 Location
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium transition"
          >
            ➕ Add Spot
          </button>

        </div>

        {/* ADD FORM */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

            <h2 className="font-bold text-lg mb-4 text-gray-700">
              Add Nature Spot
            </h2>

            <input
              type="text"
              placeholder="Place Name"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl p-3 mb-3 focus:outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl p-3 mb-4 focus:outline-none"
            >
              <option>Lake</option>
              <option>Park</option>
              <option>Walking Track</option>
              <option>Trekking Area</option>
            </select>

            <button
              onClick={handleAddPlace}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl transition"
            >
              Save Spot 🌿
            </button>

          </div>
        )}

        {/* LOCATION LIST */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-bold text-lg text-gray-700">
              Nearby Locations
            </h2>

            <span className="text-sm text-gray-400">
              {places.length} spots
            </span>

          </div>

          {places.length === 0 ? (
            <div className="text-gray-500 text-sm">
              No nearby places found
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto">

              {places.map((place) => (
                <div
                  key={place.id}
                  className="border border-gray-100 rounded-3xl p-4 bg-white"
                >

                  <div className="flex justify-between items-start">

                    <div>
                      <h3 className="font-bold text-green-700 text-lg">
                        {place.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {place.category}
                      </p>
                    </div>

                    <div className="text-sm text-right">

                      <div className="text-yellow-600 font-semibold">
                        🌟 {place.shoutouts}
                      </div>

                      <div className="text-red-500 font-semibold">
                        🚫 {place.slashIts}
                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      onClick={() => handleShoutout(place.id)}
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 rounded-2xl transition font-medium"
                    >
                      🌟 Shoutout
                    </button>

                    <button
                      onClick={() => handleSlashIt(place.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-2xl transition font-medium"
                    >
                      🚫 Slash It
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* MAP VIEW */}
        <div className="bg-white rounded-3xl shadow-sm p-2">

          <div className="h-[400px] md:h-[600px] rounded-2xl overflow-hidden">

            {location ? (
              <iframe
                title="map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  location.longitude - 0.02
                }%2C${
                  location.latitude - 0.02
                }%2C${
                  location.longitude + 0.02
                }%2C${
                  location.latitude + 0.02
                }&layer=mapnik&marker=${
                  location.latitude
                }%2C${location.longitude}`}
                className="rounded-2xl"
              ></iframe>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Fetching your location...
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
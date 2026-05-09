// src/pages/Home.jsx

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

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

  // FETCH PLACES
  const fetchPlaces = async () => {
    try {
      const snapshot = await getDocs(collection(db, "places"));

      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setPlaces(data);

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getLocation();
    fetchPlaces();
  }, []);

  // ADD PLACE
  const handleAddPlace = async () => {
    if (!placeName) {
      alert("Enter place name");
      return;
    }

    try {
      // DUPLICATE CHECK
      const q = query(
        collection(db, "places"),
        where("name", "==", placeName)
      );

      const existing = await getDocs(q);

      if (!existing.empty) {
        alert("Location already exists");
        return;
      }

      await addDoc(collection(db, "places"), {
        name: placeName,
        category,
        shoutouts: 0,
        slashIts: 0,
        votedUsers: {},
        createdBy: user.uid,
        lat: location?.latitude || 0,
        lng: location?.longitude || 0,
      });

      alert("Location added 🌿");

      setPlaceName("");

      setShowForm(false);

      fetchPlaces();

    } catch (error) {
      console.log(error);
    }
  };

  // SHOUTOUT
  const handleShoutout = async (place) => {
    try {
      const currentVote =
        place.votedUsers?.[user.uid];

      const ref = doc(db, "places", place.id);

      // ALREADY SHOUTOUT
      if (currentVote === "shoutout") {
        alert("Already shouted out");
        return;
      }

      // SWITCH FROM SLASH TO SHOUTOUT
      if (currentVote === "slash") {
        await updateDoc(ref, {
          shoutouts: (place.shoutouts || 0) + 1,

          slashIts: Math.max(
            (place.slashIts || 0) - 1,
            0
          ),

          votedUsers: {
            ...place.votedUsers,
            [user.uid]: "shoutout",
          },
        });

        fetchPlaces();
        return;
      }

      // FIRST TIME
      await updateDoc(ref, {
        shoutouts: (place.shoutouts || 0) + 1,

        votedUsers: {
          ...(place.votedUsers || {}),
          [user.uid]: "shoutout",
        },
      });

      fetchPlaces();

    } catch (error) {
      console.log(error);
    }
  };

  // SLASH IT
  const handleSlashIt = async (place) => {
    try {
      const currentVote =
        place.votedUsers?.[user.uid];

      const ref = doc(db, "places", place.id);

      // ALREADY SLASHED
      if (currentVote === "slash") {
        alert("Already slashed");
        return;
      }

      // SWITCH FROM SHOUTOUT TO SLASH
      if (currentVote === "shoutout") {
        await updateDoc(ref, {
          slashIts: (place.slashIts || 0) + 1,

          shoutouts: Math.max(
            (place.shoutouts || 0) - 1,
            0
          ),

          votedUsers: {
            ...place.votedUsers,
            [user.uid]: "slash",
          },
        });

        fetchPlaces();
        return;
      }

      // FIRST TIME
      await updateDoc(ref, {
        slashIts: (place.slashIts || 0) + 1,

        votedUsers: {
          ...(place.votedUsers || {}),
          [user.uid]: "slash",
        },
      });

      fetchPlaces();

    } catch (error) {
      console.log(error);
    }
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

        {/* BUTTONS */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <button
            onClick={getLocation}
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl transition"
          >
            📍 Location
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl transition"
          >
            ➕ Add Spot
          </button>

        </div>

        {/* ADD FORM */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

            <input
              type="text"
              placeholder="Place Name"
              value={placeName}
              onChange={(e) =>
                setPlaceName(e.target.value)
              }
              className="w-full border border-gray-200 rounded-2xl p-3 mb-3"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="w-full border border-gray-200 rounded-2xl p-3 mb-3"
            >
              <option>Lake</option>
              <option>Park</option>
              <option>Walking Track</option>
              <option>Trekking Area</option>
            </select>

            <button
              onClick={handleAddPlace}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl"
            >
              Save Spot 🌿
            </button>

          </div>
        )}

        {/* LOCATIONS */}
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
            <div className="text-gray-500">
              No locations added yet
            </div>
          ) : (
            <div className="space-y-3 max-h-[350px] overflow-y-auto">

              {places.map((place) => (
                <div
                  key={place.id}
                  className="border border-gray-100 rounded-3xl p-4 bg-white"
                >

                  <div className="flex justify-between">

                    <div>
                      <h3 className="font-bold text-green-700 text-lg">
                        {place.name}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {place.category}
                      </p>
                    </div>

                    <div className="text-right text-sm">

                      <div className="text-yellow-600 font-semibold">
                        🌟 {place.shoutouts || 0}
                      </div>

                      <div className="text-red-500 font-semibold">
                        🚫 {place.slashIts || 0}
                      </div>

                    </div>

                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      onClick={() =>
                        handleShoutout(place)
                      }
                      className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 rounded-2xl font-medium"
                    >
                      🌟 Shoutout
                    </button>

                    <button
                      onClick={() =>
                        handleSlashIt(place)
                      }
                      className="bg-red-100 hover:bg-red-200 text-red-700 py-3 rounded-2xl font-medium"
                    >
                      🚫 Slash It
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        {/* MAP */}
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
                Fetching location...
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
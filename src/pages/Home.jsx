// src/pages/Home.jsx

import { useState, useEffect } from "react";

import { db, auth } from "../firebase";

import MapView from "../components/MapView";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  increment,
  query,
  where,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

export default function Home({ user }) {
  const [location, setLocation] = useState(null);

  const [places, setPlaces] = useState([]);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  // 🚪 Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  // 📍 Get User Location
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocation(position.coords);
        await fetchPlaces();
      },
      (error) => {
        console.error(error);
        alert("Location permission denied");
      }
    );
  };

  // 📏 Distance Calculator
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;

    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // 🔥 Fetch Places
  const fetchPlaces = async () => {
    const snapshot = await getDocs(collection(db, "places"));

    const data = snapshot.docs.map((docItem) => {
      const d = docItem.data();

      return {
        id: docItem.id,
        name: d.name || "Unknown",
        category: d.category || "Unknown",
        lat: d.lat || 0,
        lng: d.lng || 0,
        upvotes: d.upvotes || 0,
        downvotes: d.downvotes || 0,
      };
    });

    setPlaces(data);
  };

  // 📍 Filter Nearby Places
  useEffect(() => {
    if (!location) return;

    const filtered = places.filter((place) => {
      if (!place.lat || !place.lng) return false;

      const dist = getDistance(
        location.latitude,
        location.longitude,
        place.lat,
        place.lng
      );

      return dist <= 5;
    });

    setNearbyPlaces(filtered);
  }, [location, places]);

  // ➕ Add Place
  const handleAddPlace = async () => {
    if (!location) {
      alert("Please get location first");
      return;
    }

    if (!name || !category) {
      alert("Please fill all fields");
      return;
    }

    // 🔍 Duplicate Check
    const snapshot = await getDocs(collection(db, "places"));

    const existingPlaces = snapshot.docs.map((docItem) =>
      docItem.data()
    );

    const isDuplicate = existingPlaces.some((place) => {
      if (!place.lat || !place.lng) return false;

      const dist = getDistance(
        location.latitude,
        location.longitude,
        place.lat,
        place.lng
      );

      return dist < 0.1;
    });

    if (isDuplicate) {
      alert("⚠️ Place already exists nearby");
      return;
    }

    // ✅ Save Place
    await addDoc(collection(db, "places"), {
      name,
      category,

      lat: Number(location.latitude.toFixed(4)),
      lng: Number(location.longitude.toFixed(4)),

      createdBy: user.uid,
      createdAt: new Date(),

      upvotes: 0,
      downvotes: 0,
    });

    alert("🌿 Place Added");

    setName("");
    setCategory("");

    setShowForm(false);

    fetchPlaces();
  };

  // 👍 Upvote
  const handleUpvote = async (placeId) => {
    const votesRef = collection(db, "votes");

    const q = query(
      votesRef,
      where("userId", "==", user.uid),
      where("placeId", "==", placeId)
    );

    const snapshot = await getDocs(q);

    const placeRef = doc(db, "places", placeId);

    if (!snapshot.empty) {
      const voteDoc = snapshot.docs[0];

      const voteData = voteDoc.data();

      // ❌ Already upvoted
      if (voteData.type === "upvote") {
        alert("Already upvoted");
        return;
      }

      // 🔁 Switch Downvote → Upvote
      await updateDoc(placeRef, {
        upvotes: increment(1),
        downvotes: increment(-1),
      });

      await updateDoc(doc(db, "votes", voteDoc.id), {
        type: "upvote",
      });
    } else {
      // ✅ First Vote
      await addDoc(votesRef, {
        userId: user.uid,
        placeId,
        type: "upvote",
      });

      await updateDoc(placeRef, {
        upvotes: increment(1),
      });
    }

    fetchPlaces();
  };

  // 👎 Downvote
  const handleDownvote = async (placeId) => {
    const votesRef = collection(db, "votes");

    const q = query(
      votesRef,
      where("userId", "==", user.uid),
      where("placeId", "==", placeId)
    );

    const snapshot = await getDocs(q);

    const placeRef = doc(db, "places", placeId);

    if (!snapshot.empty) {
      const voteDoc = snapshot.docs[0];

      const voteData = voteDoc.data();

      // ❌ Already downvoted
      if (voteData.type === "downvote") {
        alert("Already downvoted");
        return;
      }

      // 🔁 Switch Upvote → Downvote
      await updateDoc(placeRef, {
        downvotes: increment(1),
        upvotes: increment(-1),
      });

      await updateDoc(doc(db, "votes", voteDoc.id), {
        type: "downvote",
      });
    } else {
      // ✅ First Vote
      await addDoc(votesRef, {
        userId: user.uid,
        placeId,
        type: "downvote",
      });

      await updateDoc(placeRef, {
        downvotes: increment(1),
      });
    }

    fetchPlaces();
  };

  // 🚀 Initial Fetch
  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <div className="min-h-screen bg-[#eef6ee] p-4">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-green-700">
              🌿 Nature App
            </h1>

            <p className="text-gray-500 mt-1">
              Welcome, {user.displayName}
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">

            <button
              onClick={getLocation}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition"
            >
              📍 Get Location
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition"
            >
              ➕ Add Spot
            </button>

            <button
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-xl transition"
            >
              🚪 Logout
            </button>

          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LEFT - MAP */}
        <div className="lg:col-span-2">

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden h-[75vh]">

            {!location ? (
              <div className="h-full flex items-center justify-center text-gray-500">
                Click "Get Location" to explore nearby spots 🌿
              </div>
            ) : (
              <MapView
                location={location}
                places={nearbyPlaces}
              />
            )}

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4">

          {/* ADD FORM */}
          {showForm && (
            <div className="bg-white rounded-3xl shadow-sm p-5">

              <h2 className="text-xl font-bold mb-4 text-gray-700">
                Add Nature Spot
              </h2>

              <input
                className="w-full border border-gray-200 rounded-xl p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Place Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select Category</option>
                <option value="Lake">Lake</option>
                <option value="Park">Park</option>
                <option value="Walking">Walking</option>
                <option value="Trekking">Trekking</option>
              </select>

              <button
                onClick={handleAddPlace}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl transition"
              >
                Save Spot 🌿
              </button>

            </div>
          )}

          {/* NEARBY PLACES */}
          <div className="bg-white rounded-3xl shadow-sm p-5 max-h-[60vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-700">
                Nearby Places
              </h2>

              <span className="text-sm text-gray-400">
                {nearbyPlaces.length} spots
              </span>
            </div>

            {nearbyPlaces.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No nearby places found
              </div>
            ) : (
              <div className="space-y-3">

                {nearbyPlaces.map((p) => (
                  <div
                    key={p.id}
                    className="border border-gray-100 rounded-2xl p-4 hover:shadow-md transition"
                  >

                    <div className="flex justify-between items-start">

                      <div>
                        <h3 className="font-bold text-green-700 text-lg">
                          {p.name}
                        </h3>

                        <p className="text-sm text-gray-500">
                          {p.category}
                        </p>
                      </div>

                      <div className="text-right text-sm">
                        <div>👍 {p.upvotes}</div>
                        <div>👎 {p.downvotes}</div>
                      </div>

                    </div>

                    <div className="flex gap-2 mt-4">

                      <button
                        onClick={() => handleUpvote(p.id)}
                        className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-xl transition"
                      >
                        👍 Upvote
                      </button>

                      <button
                        onClick={() => handleDownvote(p.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-xl transition"
                      >
                        👎 Downvote
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
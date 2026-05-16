// src/pages/Home.jsx

import { useEffect, useState } from "react";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

// FIX LEAFLET ICONS
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Home({ user }) {
  // STATES
  const [location, setLocation] =
    useState(null);

  const [places, setPlaces] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [placeName, setPlaceName] =
    useState("");

  const [category, setCategory] =
    useState("Lake");

  const [comments, setComments] =
    useState({});

  const [commentInputs, setCommentInputs] =
    useState({});

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState("All");

  // GET LOCATION
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        });
      },
      (error) => {
        console.log(error);

        alert(
          "Unable to fetch location"
        );
      }
    );
  };

  // DISTANCE
  const getDistanceMeters = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371e3;

    const φ1 =
      (lat1 * Math.PI) / 180;

    const φ2 =
      (lat2 * Math.PI) / 180;

    const Δφ =
      ((lat2 - lat1) * Math.PI) /
      180;

    const Δλ =
      ((lon2 - lon1) * Math.PI) /
      180;

    const a =
      Math.sin(Δφ / 2) *
        Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  // SMART SUMMARY
  const generateSummary = (
    commentsList
  ) => {
    if (!commentsList.length) {
      return "No community insights yet.";
    }

    const text = commentsList
      .map((c) =>
        c.text.toLowerCase()
      )
      .join(" ");

    const insights = [];

    if (
      text.includes("peaceful") ||
      text.includes("calm") ||
      text.includes("relax")
    ) {
      insights.push(
        "Peaceful environment"
      );
    }

    if (
      text.includes("morning") ||
      text.includes("sunrise")
    ) {
      insights.push(
        "Best visited during mornings"
      );
    }

    if (
      text.includes("cycle") ||
      text.includes("cycling")
    ) {
      insights.push(
        "Popular for cycling"
      );
    }

    if (
      text.includes("trek") ||
      text.includes("hike")
    ) {
      insights.push(
        "Good trekking spot"
      );
    }

    if (
      text.includes("family") ||
      text.includes("kids")
    ) {
      insights.push(
        "Suitable for families"
      );
    }

    if (
      text.includes("crowded")
    ) {
      insights.push(
        "Can get crowded sometimes"
      );
    }

    if (
      text.includes("clean")
    ) {
      insights.push(
        "Clean surroundings"
      );
    }

    if (text.includes("safe")) {
      insights.push(
        "Considered safe by visitors"
      );
    }

    if (insights.length === 0) {
      return "Visitors are actively exploring this location.";
    }

    return insights.join(" • ");
  };

  // TAGS
  const detectTags = (
    commentsList
  ) => {
    const text = commentsList
      .map((c) =>
        c.text.toLowerCase()
      )
      .join(" ");

    const tags = [];

    if (
      text.includes("peaceful")
    ) {
      tags.push("Peaceful");
    }

    if (
      text.includes("cycle") ||
      text.includes("cycling")
    ) {
      tags.push("Cycling");
    }

    if (
      text.includes("family") ||
      text.includes("kids")
    ) {
      tags.push("Family");
    }

    if (
      text.includes("trek") ||
      text.includes("hike")
    ) {
      tags.push("Trekking");
    }

    if (
      text.includes("sunrise") ||
      text.includes("morning")
    ) {
      tags.push("Sunrise");
    }

    if (
      text.includes("crowded")
    ) {
      tags.push("Crowded");
    }

    return tags;
  };

  // SCORE
  const calculateScore = (
    place
  ) => {
    const shoutouts =
      place.shoutouts || 0;

    const slashIts =
      place.slashIts || 0;

    const commentsCount =
      comments[place.id]?.length ||
      0;

    let freshness = 0;

    if (
      place.createdAt?.seconds
    ) {
      const createdTime =
        place.createdAt.seconds *
        1000;

      const daysOld =
        (Date.now() -
          createdTime) /
        (1000 *
          60 *
          60 *
          24);

      freshness =
        Math.max(
          20 - daysOld,
          0
        );
    }

    const score =
      shoutouts * 5 +
      commentsCount * 3 -
      slashIts * 4 +
      freshness;

    return Math.round(score);
  };

  // FETCH COMMENTS
  const fetchComments = async (
    placeId
  ) => {
    try {
      const q = query(
        collection(
          db,
          "comments"
        ),
        where(
          "placeId",
          "==",
          placeId
        )
      );

      const snapshot =
        await getDocs(q);

      const data =
        snapshot.docs.map(
          (docItem) =>
            docItem.data()
        );

      setComments((prev) => ({
        ...prev,
        [placeId]: data,
      }));

    } catch (error) {
      console.log(error);
    }
  };

  // FETCH PLACES
  const fetchPlaces = async () => {
    try {
      const snapshot =
        await getDocs(
          collection(db, "places")
        );

      const allPlaces =
        snapshot.docs.map(
          (docItem) => ({
            id: docItem.id,
            ...docItem.data(),
          })
        );

      if (!location) {
        setPlaces(allPlaces);
        return;
      }

      const nearbyPlaces =
        allPlaces.filter(
          (place) => {
            const distance =
              getDistanceMeters(
                location.latitude,
                location.longitude,
                place.lat,
                place.lng
              );

            return (
              distance <= 3000
            );
          }
        );

      setPlaces(nearbyPlaces);

      nearbyPlaces.forEach(
        (place) => {
          fetchComments(
            place.id
          );
        }
      );

    } catch (error) {
      console.log(error);
    }
  };

  // INITIAL LOAD
  useEffect(() => {
    getLocation();
  }, []);

  // AFTER LOCATION
  useEffect(() => {
    if (location) {
      fetchPlaces();
    }
  }, [location]);

  // ADD PLACE
  const handleAddPlace =
    async () => {
      if (!placeName) {
        alert(
          "Enter place name"
        );
        return;
      }

      if (!location) {
        alert(
          "Location unavailable"
        );
        return;
      }

      try {
        const snapshot =
          await getDocs(
            collection(
              db,
              "places"
            )
          );

        const existingPlaces =
          snapshot.docs.map(
            (docItem) => ({
              id: docItem.id,
              ...docItem.data(),
            })
          );

        // DUPLICATE NAME
        const sameName =
          existingPlaces.some(
            (place) =>
              place.name
                .toLowerCase()
                .trim() ===
              placeName
                .toLowerCase()
                .trim()
          );

        if (sameName) {
          alert(
            "Location already exists"
          );

          return;
        }

        // 100M CHECK
        const nearbySpotExists =
          existingPlaces.some(
            (place) => {
              const distance =
                getDistanceMeters(
                  location.latitude,
                  location.longitude,
                  place.lat,
                  place.lng
                );

              return (
                distance <=
                100
              );
            }
          );

        if (
          nearbySpotExists
        ) {
          alert(
            "Spot already exists nearby (within 100m)"
          );

          return;
        }

        // SAVE
        await addDoc(
          collection(
            db,
            "places"
          ),
          {
            name: placeName,
            category,
            lat: location.latitude,
            lng: location.longitude,
            shoutouts: 0,
            slashIts: 0,
            votedUsers: {},
            createdBy:
              user.uid,
            createdAt:
              new Date(),
          }
        );

        alert(
          "Spot added 🌿"
        );

        setPlaceName("");

        setShowForm(false);

        fetchPlaces();

      } catch (error) {
        console.log(error);
      }
    };

  // ADD COMMENT
  const handleAddComment =
    async (placeId) => {
      const text =
        commentInputs[placeId];

      if (!text) {
        alert(
          "Enter comment"
        );
        return;
      }

      try {
        await addDoc(
          collection(
            db,
            "comments"
          ),
          {
            placeId,
            text,
            userName:
              user.displayName ||
              "Anonymous",
            createdAt:
              new Date(),
          }
        );

        setCommentInputs(
          (prev) => ({
            ...prev,
            [placeId]: "",
          })
        );

        fetchComments(
          placeId
        );

      } catch (error) {
        console.log(error);
      }
    };

  // SHOUTOUT
  const handleShoutout =
    async (place) => {
      try {
        const currentVote =
          place.votedUsers?.[
            user.uid
          ];

        const ref = doc(
          db,
          "places",
          place.id
        );

        if (
          currentVote ===
          "shoutout"
        ) {
          alert(
            "Already shouted out"
          );

          return;
        }

        // SWITCH
        if (
          currentVote ===
          "slash"
        ) {
          await updateDoc(
            ref,
            {
              shoutouts:
                (place.shoutouts ||
                  0) + 1,

              slashIts:
                Math.max(
                  (place.slashIts ||
                    0) -
                    1,
                  0
                ),

              votedUsers: {
                ...place.votedUsers,
                [user.uid]:
                  "shoutout",
              },
            }
          );

          fetchPlaces();
          return;
        }

        // FIRST TIME
        await updateDoc(
          ref,
          {
            shoutouts:
              (place.shoutouts ||
                0) + 1,

            votedUsers: {
              ...(place.votedUsers ||
                {}),
              [user.uid]:
                "shoutout",
            },
          }
        );

        fetchPlaces();

      } catch (error) {
        console.log(error);
      }
    };

  // SLASH IT
  const handleSlashIt =
    async (place) => {
      try {
        const currentVote =
          place.votedUsers?.[
            user.uid
          ];

        const ref = doc(
          db,
          "places",
          place.id
        );

        if (
          currentVote ===
          "slash"
        ) {
          alert(
            "Already slashed"
          );

          return;
        }

        // SWITCH
        if (
          currentVote ===
          "shoutout"
        ) {
          await updateDoc(
            ref,
            {
              slashIts:
                (place.slashIts ||
                  0) + 1,

              shoutouts:
                Math.max(
                  (place.shoutouts ||
                    0) -
                    1,
                  0
                ),

              votedUsers: {
                ...place.votedUsers,
                [user.uid]:
                  "slash",
              },
            }
          );

          fetchPlaces();
          return;
        }

        // FIRST TIME
        await updateDoc(
          ref,
          {
            slashIts:
              (place.slashIts ||
                0) + 1,

            votedUsers: {
              ...(place.votedUsers ||
                {}),
              [user.uid]:
                "slash",
            },
          }
        );

        fetchPlaces();

      } catch (error) {
        console.log(error);
      }
    };

  // FILTER + SORT
  const filteredPlaces =
    places

      .filter((place) => {

        const commentsText = (
          comments[
            place.id
          ] || []
        )
          .map((c) =>
            c.text.toLowerCase()
          )
          .join(" ");

        const tagsText =
          detectTags(
            comments[
              place.id
            ] || []
          )
            .join(" ")
            .toLowerCase();

        const matchesSearch =
          place.name
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          place.category
            .toLowerCase()
            .includes(
              searchTerm.toLowerCase()
            ) ||

          commentsText.includes(
            searchTerm.toLowerCase()
          ) ||

          tagsText.includes(
            searchTerm.toLowerCase()
          );

        const matchesCategory =
          selectedCategory ===
            "All" ||
          place.category ===
            selectedCategory;

        return (
          matchesSearch &&
          matchesCategory
        );
      })

      .sort(
        (a, b) =>
          calculateScore(b) -
          calculateScore(a)
      );

  return (
    <div className="min-h-screen bg-[#eef6ee] p-3">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

          <h1 className="text-3xl font-bold text-green-700">
            🌿 Nature App
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome,{" "}
            {user?.displayName}
          </p>

        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <button
            onClick={
              getLocation
            }
            className="bg-green-600 text-white py-3 rounded-2xl"
          >
            📍 Location
          </button>

          <button
            onClick={() =>
              setShowForm(
                !showForm
              )
            }
            className="bg-blue-600 text-white py-3 rounded-2xl"
          >
            ➕ Add Spot
          </button>

        </div>

        {/* FORM */}
        {showForm && (
          <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

            <input
              type="text"
              placeholder="Place Name"
              value={placeName}
              onChange={(e) =>
                setPlaceName(
                  e.target.value
                )
              }
              className="w-full border border-gray-200 rounded-2xl p-3 mb-3"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="w-full border border-gray-200 rounded-2xl p-3 mb-3"
            >
              <option>
                Lake
              </option>

              <option>
                Park
              </option>

              <option>
                Walking Track
              </option>

              <option>
                Trekking Area
              </option>

            </select>

            <button
              onClick={
                handleAddPlace
              }
              className="w-full bg-green-600 text-white py-3 rounded-2xl"
            >
              Save Spot 🌿
            </button>

          </div>
        )}

        {/* SEARCH */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

          <div className="grid md:grid-cols-2 gap-3">

            <input
              type="text"
              placeholder="Search trekking, cycling, peaceful..."
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="border border-gray-200 rounded-2xl p-3"
            />

            <select
              value={
                selectedCategory
              }
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              className="border border-gray-200 rounded-2xl p-3"
            >
              <option>
                All
              </option>

              <option>
                Lake
              </option>

              <option>
                Park
              </option>

              <option>
                Walking Track
              </option>

              <option>
                Trekking Area
              </option>

            </select>

          </div>

        </div>

        {/* PLACES */}
        <div className="bg-white rounded-3xl shadow-sm p-4 mb-4">

          <div className="flex justify-between items-center mb-4">

            <h2 className="font-bold text-lg">
              Nearby Locations
            </h2>

            <span className="text-sm text-gray-400">
              {
                filteredPlaces.length
              }{" "}
              spots
            </span>

          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto">

            {filteredPlaces.map(
              (place) => (
                <div
                  key={place.id}
                  className="border border-gray-100 rounded-3xl p-4"
                >

                  <div className="flex justify-between">

                    <div>
                      <h3 className="font-bold text-green-700 text-lg">
                        {
                          place.name
                        }
                      </h3>

                      <p className="text-sm text-gray-500">
                        {
                          place.category
                        }
                      </p>
                    </div>

                    <div className="text-right text-sm">

                      <div className="text-green-700 font-bold">
                        🔥{" "}
                        {calculateScore(
                          place
                        )}
                      </div>

                      <div className="text-yellow-600">
                        🌟{" "}
                        {place.shoutouts ||
                          0}
                      </div>

                      <div className="text-red-500">
                        🚫{" "}
                        {place.slashIts ||
                          0}
                      </div>

                    </div>

                  </div>

                  {/* VOTES */}
                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <button
                      onClick={() =>
                        handleShoutout(
                          place
                        )
                      }
                      className="bg-yellow-100 text-yellow-700 py-3 rounded-2xl"
                    >
                      🌟 Shoutout
                    </button>

                    <button
                      onClick={() =>
                        handleSlashIt(
                          place
                        )
                      }
                      className="bg-red-100 text-red-700 py-3 rounded-2xl"
                    >
                      🚫 Slash It
                    </button>

                  </div>

                  {/* INSIGHT */}
                  <div className="mt-4 bg-green-50 rounded-2xl p-3">

                    <div className="font-semibold text-green-700 text-sm mb-1">
                      🌿 Community
                      Insight
                    </div>

                    <div className="text-sm text-gray-700">
                      {generateSummary(
                        comments[
                          place.id
                        ] || []
                      )}
                    </div>

                  </div>

                  {/* TAGS */}
                  <div className="flex flex-wrap gap-2 mt-3">

                    {detectTags(
                      comments[
                        place.id
                      ] || []
                    ).map(
                      (
                        tag,
                        index
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full"
                        >
                          🏷️{" "}
                          {tag}
                        </div>
                      )
                    )}

                  </div>

                  {/* COMMENT */}
                  <div className="mt-4">

                    <div className="flex gap-2">

                      <input
                        type="text"
                        placeholder="Add comment..."
                        value={
                          commentInputs[
                            place.id
                          ] || ""
                        }
                        onChange={(
                          e
                        ) =>
                          setCommentInputs(
                            (
                              prev
                            ) => ({
                              ...prev,
                              [place.id]:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                        className="flex-1 border border-gray-200 rounded-2xl px-3 py-2"
                      />

                      <button
                        onClick={() =>
                          handleAddComment(
                            place.id
                          )
                        }
                        className="bg-green-600 text-white px-4 rounded-2xl"
                      >
                        Post
                      </button>

                    </div>

                    <div className="mt-3 space-y-2">

                      {(comments[
                        place.id
                      ] || []).map(
                        (
                          comment,
                          index
                        ) => (
                          <div
                            key={
                              index
                            }
                            className="bg-gray-50 rounded-2xl p-2 text-sm"
                          >

                            <div className="font-semibold text-green-700">
                              {
                                comment.userName
                              }
                            </div>

                            <div className="text-gray-600">
                              {
                                comment.text
                              }
                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>

        {/* MAP */}
        <div className="bg-white rounded-3xl shadow-sm p-2">

          <div className="h-[500px] rounded-2xl overflow-hidden">

            {location && (
              <MapContainer
                center={[
                  location.latitude,
                  location.longitude,
                ]}
                zoom={13}
                className="h-full w-full"
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                  position={[
                    location.latitude,
                    location.longitude,
                  ]}
                >
                  <Popup>
                    📍 You are
                    here
                  </Popup>
                </Marker>

                {filteredPlaces.map(
                  (place) => (
                    <Marker
                      key={
                        place.id
                      }
                      position={[
                        place.lat,
                        place.lng,
                      ]}
                    >
                      <Popup>

                        <div>

                          <h3 className="font-bold text-green-700">
                            {
                              place.name
                            }
                          </h3>

                          <p className="text-sm text-gray-500">
                            {
                              place.category
                            }
                          </p>

                          <div className="mt-2 text-sm">

                            🔥{" "}
                            {calculateScore(
                              place
                            )}

                          </div>

                        </div>

                      </Popup>
                    </Marker>
                  )
                )}

              </MapContainer>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
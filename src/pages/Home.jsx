import { useState } from "react";

export default function Home({ user }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-green-50 p-4">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl p-5 shadow mb-4">

          <h1 className="text-3xl font-bold text-green-700">
            🌿 Nature App
          </h1>

          <p className="text-gray-500 mt-1">
            Welcome, {user?.displayName}
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">

            <button className="bg-green-600 text-white px-4 py-2 rounded-xl">
              📍 Get Location
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl"
            >
              ➕ Add Spot
            </button>

          </div>

        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* MAP */}
          <div className="bg-white rounded-3xl shadow p-4">

            <div className="h-[400px] bg-gray-100 rounded-2xl flex items-center justify-center">
              Map Coming Here
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            {showForm && (
              <div className="bg-white rounded-3xl p-4 shadow">

                <h2 className="font-bold text-lg mb-3">
                  Add Spot
                </h2>

                <input
                  type="text"
                  placeholder="Place Name"
                  className="w-full border p-3 rounded-xl mb-3"
                />

                <select className="w-full border p-3 rounded-xl mb-3">
                  <option>Lake</option>
                  <option>Park</option>
                  <option>Walking</option>
                  <option>Trekking</option>
                </select>

                <button className="w-full bg-green-600 text-white py-3 rounded-xl">
                  Save Spot
                </button>

              </div>
            )}

            <div className="bg-white rounded-3xl p-4 shadow">

              <h2 className="font-bold text-lg mb-3">
                Nearby Places
              </h2>

              <div className="border rounded-2xl p-3">

                <h3 className="font-bold text-green-700">
                  Sample Lake
                </h3>

                <p className="text-gray-500 text-sm">
                  Lake
                </p>

                <div className="flex gap-4 mt-2 text-sm">
                  <span>👍 10</span>
                  <span>👎 2</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
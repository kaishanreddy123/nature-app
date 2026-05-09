import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return <Login setUser={setUser} />;
  }

  return <Home user={user} />;
}

export default App;
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";

export default function Login({ setUser }) {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      // ✅ This is your logged-in user
      const user = result.user;

      console.log("User:", user);

      // Save user in state
      setUser(user);

    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>🌿 Nature App</h2>
      <button onClick={handleLogin}>
        Login with Google
      </button>
    </div>
  );
}
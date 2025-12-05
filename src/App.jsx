import "./App.css";
import { useEffect, useState } from "react";
import Login from "@/pages/Login";
import Admin from "@/pages/Admin";
import User from "@/pages/User";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role !== "admin" && user.role !== "user") {
    handleLogout();
    return <Login onLogin={handleLogin} />;
  }
  if (user.role === "admin")
    return <Admin user={user} sessionUser={user} onLogout={handleLogout} />;
  return <User user={user} sessionUser={user} onLogout={handleLogout} />;
}

export default App;

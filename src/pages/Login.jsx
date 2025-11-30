import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    setLoading(true);
    const payload = { username, password };
    try {
      const res = await fetch("/user", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const contentType = res.headers.get("content-type") || "";
        let body;
        try {
          body = contentType.includes("application/json")
            ? await res.json()
            : await res.text();
        } catch {
          body = "(unreadable response body)";
        }
        const message = typeof body === "string" ? body : JSON.stringify(body);
        throw new Error(message || `Status ${res.status}`);
      }
      const data = await res.json();
      const roleCandidate =
        data.role ??
        data?.user?.role ??
        data?.isAdmin ??
        data?.roleId ??
        data?.is_admin ??
        "";
      const bebanCandidate =
        data?.beban ??
        data?.Beban ??
        data?.user?.beban ??
        data?.user?.Beban ??
        data?.bebanId ??
        data?.BebanId ??
        "";
      const roleRaw = String(roleCandidate).toLowerCase().trim();
      const isAdminByCandidate =
        roleRaw === "admin" ||
        roleRaw === "1" ||
        roleRaw === "true" ||
        roleRaw === "yes" ||
        roleRaw === "on" ||
        roleCandidate === true ||
        roleCandidate === 1;
      const roleFromServer = isAdminByCandidate ? "admin" : "user";
      // debug logs removed for production
      const tokenCandidate =
        data.token ?? data.access_token ?? data?.accessToken;
      onLogin({
        id: data.id ?? Date.now().toString(),
        username: data.username ?? username,
        role: roleFromServer,
        // include token if backend provided one
        ...(tokenCandidate ? { token: tokenCandidate } : {}),
        ...(bebanCandidate ? { beban: String(bebanCandidate) } : {}),
      });
      // If server did not return beban, try to fetch /user for full session info
      if (!bebanCandidate) {
        try {
          const res2 = await fetch("/user", {
            method: "GET",
            credentials: "include",
          });
          if (res2.ok) {
            const info = await res2.json();
            const bebanFromServer =
              info?.beban ??
              info?.Beban ??
              info?.user?.beban ??
              info?.user?.Beban;
            if (bebanFromServer) {
              onLogin({
                id: data.id ?? Date.now().toString(),
                username: data.username ?? username,
                role: roleFromServer,
                ...(tokenCandidate ? { token: tokenCandidate } : {}),
                beban: String(bebanFromServer),
              });
            }
          }
        } catch (e) {
          // ignore this, fallback to UI-only session
          // debug logs removed for production
        }
      }
    } catch (err) {
      // Login fetch failed - falling back to local mode (logged via UI alert)
      setError(
        `Backend unavailable or returned an error: ${err?.message ?? err}`
      );
      if (password === "dev") {
        // developer fallback: allow creating a UI-only session without a backend.
        // If username is "admin" we create an admin session; otherwise regular user.
        const roleFallback =
          username?.toLowerCase?.() === "admin" ? "admin" : "user";
        const bebanFallback = username?.toLowerCase?.() === "admin" ? "" : "HO";
        onLogin({
          id: Date.now().toString(),
          username,
          role: roleFallback,
          beban: bebanFallback,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="bg-white ring-1 ring-gray-100 rounded-2xl p-8 w-full max-w-md shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-lg font-medium">Sign in</h1>
        </div>
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

        <label className="block text-sm mb-2">
          <span className="text-gray-700">Username</span>
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 block w-full rounded-md border border-gray-200 p-2 text-sm focus:ring-1 focus:ring-indigo-300"
            placeholder="your username"
          />
        </label>

        <label className="block text-sm mb-2">
          <span className="text-gray-700">Password</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="mt-2 block w-full rounded-md border border-gray-200 p-2 text-sm focus:ring-1 focus:ring-indigo-300"
            placeholder="password"
          />
        </label>

        <div className="flex items-center justify-between mt-4">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-60 text-sm font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
}

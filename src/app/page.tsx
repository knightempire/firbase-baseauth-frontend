"use client";
import { useEffect, useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { apiRequest as originalApiRequest } from "../utils/api";

// Wrapper to log API calls and responses
async function apiRequest(endpoint: string, options?: any) {
  console.log(`[API CALL] ${endpoint}`, options || "");
  const res = await originalApiRequest(endpoint, options);
  try {
    // Try to parse the response (assuming apiRequest returns a Response-like object)
    const data = await res.json();
    console.log(`[API RESPONSE] ${endpoint}:`, data);
    // Re-create a Response-like object for downstream code
    return {
      ...res,
      json: async () => data
    };
  } catch (e) {
    console.log(`[API RESPONSE] ${endpoint}: (non-JSON or error)`, e);
    return res;
  }
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to validate JWT (exp check only, not signature)
  function isTokenValid(token: string | null) {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  useEffect(() => {
    const tryAutoLogin = async () => {
      setLoading(true);
      const accessToken = localStorage.getItem("accessToken");
      console.log("[DEBUG] Attempting to call /bio on mount");
      const res = await apiRequest("/bio");
      if (res.ok) {
        const data = await res.json();
        console.log("[DEBUG] /bio response:", data);
        setUser({ name: data.name || "", email: data.email || "" });
        setBio(data.bio || "");
      } else if (res.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("accessToken");
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    tryAutoLogin();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      // Send idToken to backend to get app tokens
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        credentials: "include"
      });
      const data = await res.json();
      console.log("[DEBUG] /login response:", data);
      if (res.ok) {
        console.log("[DEBUG] User data:", data);
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
          console.log("[DEBUG] accessToken stored in localStorage:", data.accessToken);
        }
        setUser({ name: data.name || "", email: data.email });
        // Fetch bio after login
        try {
          const bioRes = await apiRequest("/bio");
          if (bioRes.ok) {
            const bioData = await bioRes.json();
            setBio(bioData.bio || "");
          }
        } catch (e) {
          console.error("Failed to fetch bio after login", e);
        }
      } else {
        console.error("[DEBUG] Login failed:", data);
        setUser(null);
        alert("Login failed");
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert("Google sign-in failed");
    }
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  const handleBioSave = async () => {
    setSaving(true);
    const res = await apiRequest("/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    const data = await res.json();
    setBio(data.bio || "");
    setSaving(false);
    alert("Bio updated");
  };

  // Fetch bio on load
  // Remove duplicate fetchBio effect, as apiRequest handles refresh logic

  if (!user) {
    return (
      <main className="flex flex-col items-center mt-24">
        <h1 className="text-2xl font-bold mb-6">Welcome to Bio Auth App</h1>
        <button
          onClick={handleGoogleSignIn}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center mt-24 gap-6">
      <h1 className="text-2xl font-bold">Welcome{user.name ? ` ${user.name}` : ""}!</h1>
      <label className="w-full max-w-lg">
        <div className="mb-2 font-medium">Your Bio:</div>
        <textarea
          value={bio}
          onChange={handleBioChange}
          rows={5}
          className="w-full text-base p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </label>
      <button
        onClick={handleBioSave}
        className="mt-3 px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        {saving ? "Saving..." : "Save Bio"}
      </button>
    </main>
  );
}

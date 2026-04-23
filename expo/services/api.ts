import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://vybz-backend.onrender.com";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ── Token storage ─────────────────────────────────────────────────────────────

export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
  // On web, mark this as an active browser session so we can detect
  // when the user closes the tab and comes back (vs. just refreshing).
  if (typeof window !== "undefined" && window.sessionStorage) {
    window.sessionStorage.setItem("session_active", "true");
  }
}

export async function getAccessToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }

  return response.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(username: string, email: string, password: string) {
  const data = await request<{ access_token: string; refresh_token: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    },
    false
  );
  await saveTokens(data.access_token, data.refresh_token);
  return data;
}

export async function login(email: string, password: string) {
  const data = await request<{ access_token: string; refresh_token: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
    false
  );
  await saveTokens(data.access_token, data.refresh_token);
  return data;
}

export async function logout() {
  await request("/auth/logout", { method: "POST" });
  await clearTokens();
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile() {
  return request<UserProfile>("/profile");
}

export async function getCollection() {
  return request<{ collected_songs: CollectedSong[]; total_songs: number }>("/collection");
}

// ── Drops ─────────────────────────────────────────────────────────────────────

export async function getNearbyDrops(lat: number, lng: number) {
  const data = await request<{ drops: Drop[] }>(`/v1/drops/nearby?lat=${lat}&lng=${lng}`);
  return data.drops;
}

export async function collectDrop(dropId: number, lat: number, lng: number) {
  return request<CollectResult>(`/v1/drops/${dropId}/collect`, {
    method: "POST",
    body: JSON.stringify({ latitude: lat, longitude: lng }),
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  avatar: string | null;
  bio: string | null;
  mbti: string | null;
  zodiac: string | null;
  xp: number;
  coins: number;
  level: number;
  next_level_xp: number | null;
  level_progress_percentage: number | null;
}

export interface CollectedSong {
  id: number;
  song_id: number;
  title: string;
  artist: string;
  album: string | null;
  genre: string;
  display_genre: string;
  rarity: string;
  rarity_name: string;
  image_url: string | null;
  preview_url: string | null;
  spotify_id: string | null;
  apple_music_id: string | null;
  collected_at: string;
}

export interface Drop {
  id: number;
  song_id: number;
  latitude: number;
  longitude: number;
  title: string;
  artist: string;
  genre: string;
  rarity: string;
  rarity_name: string;
  image_url: string | null;
  preview_url: string | null;
  spotify_url: string | null;
  collected: boolean;
  distance_meters: number;
}

export interface CollectResult {
  success: boolean;
  song_id: number;
  rarity: string;
  xp_earned: number;
  drops_earned: number;
  new_xp: number;
  new_level: number;
  coins_earned: number;
}

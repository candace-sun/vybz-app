# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Vibe Check App** — a music-social mobile app built with Expo/React Native. Users collect geo-located "music drops" on a map, grow genre-themed plants in a virtual garden, explore friends, and climb a leaderboard. The app runs on iOS, Android, and web.

All app code lives in the `expo/` subdirectory. Run every command from inside `expo/`.

## Commands

```bash
cd expo

# Install dependencies
bun i

# Start dev server with tunnel (recommended — works on device/simulator)
bun run start          # then press "i" for iOS Simulator or "a" for Android

# Web preview
bun run start-web

# Lint
bun run lint

# Clear cache when things break
bunx expo start --clear
```

There is no test suite configured at this time.

## Architecture

### Routing (Expo Router file-based)

```
app/
  _layout.tsx          # Root: QueryClientProvider + GestureHandlerRootView
  auth.tsx             # Landing/auth gate
  login.tsx / signup.tsx
  messages.tsx
  friend-requests.tsx
  leaderboard.tsx
  events.tsx
  (tabs)/
    _layout.tsx        # Tab bar (Home, Map, Garden, Explore, Profile)
    (home)/index.tsx   # Activity feed, goals, leaderboard widget
    map/index.tsx      # Live music drop map (expo-location + react-native-maps)
    garden/index.tsx   # Plant shelf + greenhouse + shop tabs
    explore/index.tsx  # Friends grid + events list
    profile/index.tsx  # User stats + settings rows
```

Modal/overlay screens (`messages`, `friend-requests`, `leaderboard`, `events`) are pushed as stack screens from the tab navigator.

### State & data

- **All data is currently mocked** in `mocks/data.ts` — no backend or API calls. The file exports typed arrays (`plants`, `musicDrops`, `friends`, `events`, etc.) consumed directly by screens.
- **React Query** (`@tanstack/react-query`) is set up in the root layout but not yet used for any real queries.
- **Zustand** is installed but not yet used.
- Many home screen sections (goals, activity feed, leaderboard widget, events cards) are commented out behind a "Stay tuned for updates…" placeholder.

### Theme

A single dark theme is defined in `constants/colors.ts` and imported as `Colors.dark` in every screen. All screens use `const theme = Colors.dark` — never import colors inline.

Key palette values: `background` `#0A0A1A`, `pink` `#FF2D78`, `neonGreen` `#00FF88`, `purple` `#6C2BD9`.

### Map screen specifics

`app/(tabs)/map/index.tsx` requests foreground location permission at mount, generates music drops near the user via `generateDropsNearLocation()`, and renders them as custom markers on a `MapView`. The map uses a custom dark style on Android; on iOS it uses `userInterfaceStyle="dark"`. Drop collection is simulated (no persistence).

### Garden screen specifics

Plant images are statically `require()`d from `assets/images/` keyed by genre string (`plantImages["EDM"]`, `plantImages["R&B"]`, `plantImages["Rap"]`). Adding a new genre requires adding both an asset file and an entry in `plantImages`.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { getAccessToken } from "@/services/api";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const token = await getAccessToken();
      const inAuthScreen =
        segments[0] === "auth" ||
        segments[0] === "login" ||
        segments[0] === "signup";

      if (!token && !inAuthScreen) {
        router.replace("/auth");
      } else if (token && inAuthScreen) {
        router.replace("/(tabs)/(home)");
      }

      if (!authChecked) {
        setAuthChecked(true);
        SplashScreen.hideAsync();
      }
    }

    checkAuth();
  }, [segments]);

  if (!authChecked) return null;

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="messages" options={{ headerShown: true }} />
      <Stack.Screen name="friend-requests" options={{ headerShown: true }} />
      <Stack.Screen name="leaderboard" options={{ headerShown: true }} />
      <Stack.Screen name="events" options={{ headerShown: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <StatusBar style="light" />
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

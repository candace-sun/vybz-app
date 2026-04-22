import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const theme = Colors.dark;
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/login");
  };

  const handleSignup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/signup");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FF2D78", "#FF6B35", "#080818"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>vybz</Text>
          <Text style={styles.tagline}>Discover Your Music Vibe</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.signupButton]}
            onPress={handleSignup}
          >
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  gradientBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 52,
    fontWeight: "800" as const,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600" as const,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    gap: 14,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: theme.pink,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  signupButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});

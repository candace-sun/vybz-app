import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import { login } from "@/services/api";

const theme = Colors.dark;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/(home)");
    } catch (e: any) {
      setError(e.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={theme.text} />
        </Pressable>

        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          Access your account and continue your vibe.
        </Text>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <Pressable
                style={styles.passwordToggle}
                onPress={() => setShowPassword((value) => !value)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </Pressable>
            </View>
            <Text style={styles.fieldHint}>
              Password must be 8+ characters and include a number and special
              character.
            </Text>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Log in</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: "flex-start",
    padding: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    gap: 18,
  },
  field: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: theme.text,
  },
  input: {
    height: 50,
    borderRadius: 16,
    backgroundColor: theme.background,
    color: theme.text,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  passwordRow: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 48,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  errorText: {
    color: theme.danger,
    fontSize: 13,
    marginTop: -8,
  },
  submitButton: {
    backgroundColor: theme.pink,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
});

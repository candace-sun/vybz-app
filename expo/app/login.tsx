import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Eye, EyeOff } from "lucide-react-native";
import Colors from "@/constants/colors";

const theme = Colors.dark;

function validatePassword(password: string) {
  return (
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    if (!validatePassword(password)) {
      setError(
        "Password must be 8+ chars and include a number and special character.",
      );
      return;
    }

    setError("");
    // Add authentication logic here.
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
        <Text style={styles.title}>Log in</Text>
        <Text style={styles.subtitle}>
          Access your account and continue your vibe.
        </Text>

        <View style={styles.formCard}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={theme.textSecondary}
              style={styles.input}
              autoCapitalize="none"
              autoComplete="username"
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

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Log in</Text>
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

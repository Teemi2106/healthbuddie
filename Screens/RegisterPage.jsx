import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Ensure AsyncStorage is imported

const RegisterPage = ({ navigation, onRegister = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match. Please try again."
      );
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: user.email,
        createdAt: new Date(),
        id: user.uid,
      });

      Alert.alert("Registration Successful", `Welcome ${name}!`);
      onRegister(user);
    } catch (error) {
      console.error("Error registering user:", error);
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleView}>
        <Text style={styles.title}>Register</Text>
      </View>
      <View style={styles.view1}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Register" onPress={handleRegister} color="#00CFC1" />
        )}

        <Text onPress={() => navigation.navigate("Login")} style={styles.link}>
          Already have an account? Login here.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-around",
    paddingTop: 16,
    backgroundColor: "#F4DAFF",
  },
  view1: {
    flex: 1,
    paddingTop: 100,
    padding: 16,
    borderTopLeftRadius: 100,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
  },
  titleView: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
  },
  title: {
    fontSize: 30,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: "#5B3F8C",
  },
  input: {
    height: 50,
    borderColor: "transparent",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 30,
    backgroundColor: "#F4DAFF",
    shadowColor: "#ddd",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  link: {
    marginTop: 12,
    color: "blue",
    textAlign: "center",
  },
});

export default RegisterPage;

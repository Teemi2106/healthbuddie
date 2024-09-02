import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const LoginPage = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true); // Start loading

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ImageBackground
        source={require("../assets/icon.png")}
        style={styles.background}
      >
        <View style={styles.view1}>
          <View style={styles.titleView}>
            <Text
              style={
                (styles.title,
                {
                  fontSize: 24,
                  marginBottom: 24,
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "#5B3F8C",
                })
              }
            >
              Welcome To Health Buddie
            </Text>
            <Text style={styles.title}>Login</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />

          {loading ? (
            <ActivityIndicator size="large" color="#00CFC1" />
          ) : (
            <Button title="Login" onPress={handleLogin} color={"#00CFC1"} />
          )}
          <Text
            onPress={() => navigation.navigate("Register")}
            style={styles.link}
          >
            Don't have an account? Register here.
          </Text>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#F4DAFF",
    paddingTop: 20,
  },
  titleView: {
    alignItems: "center",
    justifyContent: "center",
    flex: 0.5,
  },
  background: {
    flex: 1,
    resizeMode: "stretch",
  },
  title: {
    fontSize: 30,
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
    color: "#5B3F8C",
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
    position: "absolute",
    width: "100%",
    height: "60%",
    bottom: 0,
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

export default LoginPage;

import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust import as necessary
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfileScreen = ({ route, navigation }) => {
  const { user } = route.params;

  console.log("User data:", user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100;
      const weightInKg = parseFloat(weight);
      const calculatedBmi = (
        weightInKg /
        (heightInMeters * heightInMeters)
      ).toFixed(2);
      setBmi(calculatedBmi);
    }
  }, [height, weight]);

  const handleUpdateProfile = async () => {
    setLoading(true); // Start loading

    try {
      if (user && user.id) {
        const updatedFields = {};
        if (name) updatedFields.name = name;
        if (email) updatedFields.email = email;
        if (height) updatedFields.height = height;
        if (weight) updatedFields.weight = weight;
        if (age) updatedFields.age = age;
        if (bmi) updatedFields.bmi = bmi;

        await updateDoc(doc(db, "users", user.id), updatedFields);

        Alert.alert("Profile updated successfully");
        navigation.goBack();
      } else {
        Alert.alert("User not found");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error updating profile", error.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1, width: "100%" }}>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Height (cm)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Weight (kg)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Age"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
          <Text style={styles.bmiText}>BMI: {bmi}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdateProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" /> // Show loading indicator
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    width: "100%",
    height: 50,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  bmiText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#8063D9",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditProfileScreen;

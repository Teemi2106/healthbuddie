import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Use Expo Image Picker
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig"; // Adjust imports as necessary

const ProfilePage = ({ user, navigation, onLogout }) => {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    height: "",
    weight: "",
    age: "",
    bio: "",
    profilePicture: "https://example.com/default-avatar.png",
  });
  const [loading, setLoading] = useState(false); // Add loading state

  useEffect(() => {
    if (user && user.id) {
      const userDoc = doc(db, "users", user.id);
      const unsubscribe = onSnapshot(
        userDoc,
        (doc) => {
          if (doc.exists()) {
            setProfileData(doc.data());
          } else {
            console.log("No such document!");
          }
        },
        (error) => {
          console.error("Error fetching profile data: ", error);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  const handleImagePicker = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "You need to grant permission to access the image library."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    // Check the result
    if (result.canceled) {
      console.log("User cancelled image picker");
    } else {
      const { uri } = result.assets[0]; // Ensure you're accessing the correct object
      console.log("Image URI:", uri);
      setLoading(true); // Start loading
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri) => {
    try {
      // Fetch image data
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error("Failed to fetch image");
      }
      const blob = await response.blob();

      // Create a storage reference
      const storageRef = ref(storage, `profilePictures/${user.id}`);
      await uploadBytes(storageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Save download URL to Firestore
      const userDoc = doc(db, "users", user.id);
      await setDoc(userDoc, { profilePicture: downloadURL }, { merge: true });

      // Update local state
      setProfileData((prevData) => ({
        ...prevData,
        profilePicture: downloadURL,
      }));

      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image: ", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile", { user });
  };

  const { profilePicture, name, email, height, weight, age, bio } = profileData;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleImagePicker}>
        <Image source={{ uri: profilePicture }} style={styles.profileImage} />
      </TouchableOpacity>
      <Text style={styles.name}>{name || "Username"}</Text>
      <Text style={styles.email}>{email || "user@example.com"}</Text>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Height: {height || "N/A"}</Text>
        <Text style={styles.infoText}>Weight: {weight || "N/A"}</Text>
        <Text style={styles.infoText}>Age: {age || "N/A"}</Text>
      </View>

      <Text style={styles.bio}>
        {bio || "This is a short bio about the user."}
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleEditProfile}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B3F8C" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderColor: "#5B3F8C",
    borderWidth: 3,
    backgroundColor: "#FFF",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B3F8C",
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
  },
  infoContainer: {
    width: "100%",
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 20,
    color: "#666",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#5B3F8C",
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
    fontStyle: "italic",
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#5B3F8C",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF6F61",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#5B3F8C",
  },
});

export default ProfilePage;

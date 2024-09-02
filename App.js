import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import StackNavigator from "./StackNavigator.jsx";

export default function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async (uid) => {
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          return userDoc.data();
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
      return null;
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDetails = await fetchUserDetails(user.uid);
        setLoggedInUser(userDetails);
      } else {
        setLoggedInUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        setLoggedInUser(null);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  if (loading) {
    return null; // Optionally, add a loading spinner or screen here
  }

  return (
    <NavigationContainer>
      <StackNavigator user={loggedInUser} onLogout={handleLogout} />
    </NavigationContainer>
  );
}

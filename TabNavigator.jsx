import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import HomePage from "./Screens/HomePage";
import ProfilePage from "./Screens/ProfilePage";
import Recommendations from "./Screens/Recommendations";

const Tab = createBottomTabNavigator();

const TabNavigator = ({ user, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Recommendations") {
            iconName = "restaurant";
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#5B3F8C",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="home">
        {(props) => <HomePage {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Recommendations">
        {(props) => (
          <Recommendations {...props} user={user} onLogout={onLogout} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfilePage {...props} user={user} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default TabNavigator;

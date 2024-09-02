import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePage from "./Screens/HomePage";
import ProfilePage from "./Screens/ProfilePage";
import EditProfileScreen from "./Screens/EditProfileScreen";
import LoginPage from "./Screens/LoginPage";
import RegisterPage from "./Screens/RegisterPage";
import { MaterialIcons } from "@expo/vector-icons";
import Recommendations from "./Screens/Recommendations";

const Stack = createStackNavigator();
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

const StackNavigator = ({ user, onLogout }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginPage} />
          <Stack.Screen name="Register" component={RegisterPage} />
        </>
      ) : (
        <>
          <Stack.Screen name="Tabs">
            {(props) => (
              <TabNavigator {...props} user={user} onLogout={onLogout} />
            )}
          </Stack.Screen>
          <Stack.Screen name="EditProfile">
            {(props) => <EditProfileScreen {...props} user={user} />}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
};
export default StackNavigator;

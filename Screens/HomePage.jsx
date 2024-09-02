import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ScrollView,
  Dimensions,
  Button,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { ProgressChart, LineChart } from "react-native-chart-kit";
import { doc, onSnapshot, setDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Adjust import as necessary
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icons from "react-native-vector-icons/Ionicons";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Pedometer from "expo-sensors/build/Pedometer";

const HomePage = ({ user, onLogout }) => {
  const [profileData, setProfileData] = useState({
    name: "User",
    height: "N/A",
    weight: "N/A",
    age: "N/A",
  });
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("Checking");
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch profile data from Firebase
  useEffect(() => {
    if (user?.id) {
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
        (error) => console.error("Error fetching profile data: ", error)
      );

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const loadStepsAndDistance = async () => {
      const today = new Date().toISOString().split("T")[0];
      try {
        const savedSteps = await AsyncStorage.getItem(`steps_${today}`);
        const savedDistance = await AsyncStorage.getItem(`distance_${today}`);
        setSteps(parseInt(savedSteps, 10) || 0);
        setDistance(parseFloat(savedDistance) || 0);

        // Fetch steps and distance from Firebase
        const userDoc = doc(db, "users", user.id);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          if (data?.steps && data?.distance) {
            setSteps(data.steps);
            setDistance(data.distance);
          }
        }
      } catch (error) {
        console.error("Error loading steps and distance", error);
      }
    };

    loadStepsAndDistance();

    const resetDailyData = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        resetData();
      }
    };

    const interval = setInterval(resetDailyData, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Pedometer handling
  useEffect(() => {
    let accumulatedSteps = 0;

    const subscription = Pedometer.watchStepCount(async (result) => {
      const newSteps = result.steps - accumulatedSteps;
      accumulatedSteps = result.steps;
      const updatedSteps = steps + newSteps;

      setSteps(updatedSteps);

      const newDistance = calculateDistance(newSteps, profileData.height);
      const updatedDistance = (distance + parseFloat(newDistance)).toFixed(2);

      setDistance(updatedDistance);

      // Save updated steps and distance to AsyncStorage
      const today = new Date().toISOString().split("T")[0];
      await AsyncStorage.setItem(`steps_${today}`, updatedSteps.toString());
      await AsyncStorage.setItem(
        `distance_${today}`,
        updatedDistance.toString()
      );

      // Save updated steps and distance to Firebase
      const userDoc = doc(db, "users", user.id);
      await updateDoc(userDoc, {
        steps: updatedSteps,
        distance: updatedDistance,
      });
    });

    Pedometer.isAvailableAsync().then(
      (result) => {
        setIsPedometerAvailable(result ? "Available" : "Not Available");
      },
      (error) => {
        setIsPedometerAvailable("Error");
      }
    );

    return () => subscription.remove();
  }, [distance, steps]);

  // Function to calculate distance based on steps and user height
  const calculateDistance = (steps, height) => {
    if (!height || height === "N/A") {
      return 0; // Default if height isn't available
    }
    const strideLength = height * 0.415; // Adjust this multiplier for accuracy (0.415 for men, 0.413 for women)
    const distanceInMeters = steps * strideLength;
    const distanceInKilometers = distanceInMeters / 1000; // Convert to kilometers
    return parseFloat(distanceInKilometers.toFixed(2)); // Keep two decimal places
  };

  const resetData = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      await AsyncStorage.removeItem(`steps_${today}`);
      await AsyncStorage.removeItem(`distance_${today}`);

      // Reset steps and distance in Firebase
      const userDoc = doc(db, "users", user.id);
      await updateDoc(userDoc, {
        steps: 0,
        distance: 0,
      });

      setSteps(0);
      setDistance(0);
    } catch (error) {
      console.error("Error resetting data", error);
    }
  };
  // Calculate BMI
  const calculateBMI = () => {
    if (!profileData.height || !profileData.weight) return 0;
    const heightInMeters = parseFloat(profileData.height) / 100;
    const weightInKg = parseFloat(profileData.weight);
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const bmi = calculateBMI();

  // Determine BMI color
  const getBMIColor = () => {
    if (bmi < 18.5) return "#FFD700"; // Yellow for underweight
    if (bmi >= 18.5 && bmi <= 24.9) return "#32CD32"; // Green for normal
    if (bmi >= 25 && bmi <= 29.9) return "#FFA500"; // Orange for overweight
    if (bmi >= 30) return "#FF0000"; // Red for obesity
    return "#ccc"; // Default color
  };

  const data = {
    labels: ["Swim", "Bike", "Run"],
    data: [0.4, 0.6, 0.8],
  };

  const screenWidth = Dimensions.get("window").width;

  const bardata = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [90, 85, 100, 95, 110, 105],
        strokeWidth: 2, // optional
      },
    ],
  };
  const chartConfig = {
    backgroundGradientFrom: "#FFF",
    backgroundGradientTo: "#FFF",
    decimalPlaces: 0,
    color: (opacity = 1, index) => {
      const colors = [
        `rgba(86, 123, 247, ${opacity})`,
        `rgba(255, 99, 132, ${opacity})`,
        `rgba(75, 192, 192, ${opacity})`,
        `rgba(255, 206, 86, ${opacity})`,
        `rgba(153, 102, 255, ${opacity})`,
        `rgba(255, 159, 64, ${opacity})`,
      ];
      return colors[index % colors.length];
    },
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  const { name, height, weight, age } = profileData;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              gap: 20,
              marginVertical: 30,
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              paddingHorizontal: 20,
            }}
          >
            <Icon name="user" size={40} color="#5C5C5C" />
            <Text style={{ fontSize: 25, fontWeight: "bold" }}>
              Hello, {name.split(" ")[0]}
            </Text>
          </View>
        </View>
        <View style={{ height: 70, justifyContent: "space-between" }}>
          <Text style={{ fontSize: 30 }}>Health Overview</Text>
          <Text style={{ fontSize: 16, color: "#606060" }}>
            Your Daily Health Statistics
          </Text>
        </View>
        <View>
          <View style={styles.chartContainer}>
            <ProgressChart
              data={data}
              width={Dimensions.get("window").width * 0.85}
              height={220}
              strokeWidth={16}
              radius={32}
              chartConfig={chartConfig}
              hideLegend={false}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#A37EFF",
              width: "45%",
              height: 170,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: "#fff" }}>
              <Icons name="footsteps" size={"30"} color={"white"} />
              Steps
            </Text>
            <Text style={{ fontSize: 35, fontWeight: "bold", color: "#fff" }}>
              {steps}
            </Text>
            <Text style={{ fontSize: 14, color: "#fff" }}>Steps Today</Text>
          </View>
          <View
            style={{
              backgroundColor: "#C6D2FF",
              width: "45%",
              height: 170,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, color: "#7D4C92" }}>
              {" "}
              <Icons name="walk" size={"30"} color={"white"} />
              Distance
            </Text>
            <Text
              style={{ fontSize: 35, fontWeight: "bold", color: "#7D4C92" }}
            >
              {distance}{" "}
              <Text
                style={{ fontSize: 15, fontWeight: "bold", color: "#7D4C92" }}
              >
                km
              </Text>
            </Text>
            <Text style={{ fontSize: 14, color: "#7D4C92" }}>
              Distance Today
            </Text>
          </View>
        </View>
        <View
          style={{
            height: 150,
            backgroundColor: "#fff",
            borderRadius: 30,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 30,
          }}
        >
          <View style={{ justifyContent: "space-around", height: "100%" }}>
            <Text style={{ fontSize: 20 }}>
              <Icon name="heart" size={20} color={"red"} /> Heart Rate
            </Text>
            <Text style={{ fontSize: 40, fontWeight: "bold" }}>
              74<Text style={{ fontSize: 20, color: "#ddd" }}>BPM</Text>
            </Text>
          </View>
          <View
            style={{
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("../assets/heart.png")}
              style={{ height: 200, width: 200 }}
              resizeMode="contain"
            />
          </View>
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "white",
              marginTop: 30,
              padding: 20,
              borderRadius: 30,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 25,
                  color: "#525252",
                }}
              >
                Weight
              </Text>
              <Icon name="tachometer" size={30} color="#A37EFF" />
              <Text
                style={{ fontSize: 20, color: "#525252", fontWeight: "bold" }}
              >
                {weight} <Text>KG</Text>
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 25, color: "#525252" }}>Height</Text>
              <Icon name="tachometer" size={30} color="#A37EFF" />
              <Text
                style={{ fontSize: 20, color: "#525252", fontWeight: "bold" }}
              >
                {height}
                <Text>cm</Text>
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 25, color: "#525252" }}>Age</Text>
              <Icon name="tachometer" size={30} color="#A37EFF" />
              <Text
                style={{ fontSize: 20, color: "#525252", fontWeight: "bold" }}
              >
                {age}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            marginVertical: 30,
            paddingHorizontal: 20,
            borderRadius: 20,
            backgroundColor: "#F7F7F8",
            padding: 20,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Your BMI</Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 10,
            }}
          >
            <AnimatedCircularProgress
              size={120}
              width={15}
              fill={(bmi / 40) * 100}
              tintColor={getBMIColor()}
              backgroundColor={getBMIColor()}
            >
              {(fill) => <Text style={styles.bmiText}>{bmi}</Text>}
            </AnimatedCircularProgress>
          </View>
          <Text style={styles.bmiCategory}>
            {bmi < 18.5
              ? "Underweight"
              : bmi >= 18.5 && bmi <= 24.9
              ? "Normal"
              : bmi >= 25 && bmi <= 29.9
              ? "Overweight"
              : "Obesity"}
          </Text>
        </View>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Weekly Activity
          </Text>
          <LineChart
            data={bardata}
            width={screenWidth}
            height={220}
            yAxisLabel="$"
            chartConfig={chartConfig}
            bezier
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
  },
  bmiContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  bmiText: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
  },
  bmiValue: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#525252",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default HomePage;

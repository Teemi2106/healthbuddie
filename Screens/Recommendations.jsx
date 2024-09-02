import React, { useState, useCallback } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const Recommendations = ({ user }) => {
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchRecommendations = async () => {
        try {
          const response = await fetch("http://:5000/recommendations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Age: user.age,
              "Weight (kg)": user.weight,
              "Height (cm)": user.height,
              Gender: user.gender,
              BMI: user.bmi,
            }),
          });
          if (response.ok) {
            const data = await response.json();
            setMeals(data.meal_plan);
            setExercises(data.exercise_routine);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        }
      };
      fetchRecommendations();
    }, [user])
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FEF4FF" }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Recommendations</Text>
          <Image
            source={require("../assets/ai.png")}
            style={{ height: 200, width: "100%" }}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Our Algorithm will figure out the best plans for your body type
          </Text>
        </View>

        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Today's Meal Plan</Text>
          <ScrollView horizontal style={styles.scrollContainer}>
            {meals.length > 0 ? (
              meals.map((meal, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{meal.name}</Text>
                  <Text style={styles.cardText}>
                    Calories: {meal.calories} kcal
                  </Text>
                  <Text style={styles.cardText}>Fat: {meal.fat} g</Text>
                  <Text style={styles.cardText}>Protein: {meal.protein} g</Text>
                  <Text style={styles.cardText}>Carbs: {meal.carbs} g</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Meals not Available at the moment
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.recommendationSection}>
          <Text style={styles.sectionTitle}>Today's Exercise Plan</Text>
          <ScrollView horizontal style={styles.scrollContainer}>
            {exercises.length > 0 ? (
              exercises.map((exercise, index) => (
                <View key={index} style={styles.card}>
                  <Text style={styles.cardTitle}>{exercise.name}</Text>
                  <Text style={styles.cardText}>
                    Duration: {exercise.duration}
                  </Text>
                  <Text style={styles.cardText}>
                    Calories Burned: {exercise.caloriesBurned} kcal
                  </Text>
                  <Text style={styles.cardText}>{exercise.details}</Text>
                </View>
              ))
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  Exercises Are not Available at the moment
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>
            Enjoy Today's Recommendations {user.name.split(" ")[0]}, See you
            tomorrow!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEF4FF",
    padding: 15,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5B3F8C",
    textAlign: "center",
    width: "100%",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#353136",
    marginTop: 5,
  },
  recommendationSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5B3F8C",
    marginBottom: 10,
  },
  scrollContainer: {
    height: 170,
  },
  card: {
    width: Dimensions.get("window").width * 0.75,
    height: 150,
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5B3F8C",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5B3F8C",
  },
  greetingContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#5B3F8C",
    textAlign: "center",
  },
});

export default Recommendations;

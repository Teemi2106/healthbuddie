from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Load models
meal_plan_model = joblib.load('meal_plan_model.pkl')
exercise_routine_model = joblib.load('exercise_routine_model.pkl')

@app.route('/recommendations', methods=['POST'])
def predict():
    try:
      
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
       
        df = pd.DataFrame([data])
        
        
        meal_plan_prediction = meal_plan_model.predict(df)
        exercise_routine_prediction = exercise_routine_model.predict(df)
        
      
        return jsonify({
            "meal_plan": meal_plan_prediction[0].tolist(), 
            "exercise_routine": exercise_routine_prediction[0].tolist()  
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


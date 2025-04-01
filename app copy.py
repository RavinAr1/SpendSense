from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import random

import os
import json
import requests
from dotenv import load_dotenv
import time




load_dotenv("gemini.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")



app = Flask(__name__)
CORS(app, supports_credentials=True)

#Load Data & Models
df = pd.read_csv("data/expense_data_2.csv")
unified_model = joblib.load("unified_expense_predictor.pkl")
income_fallback_model = joblib.load("income_predictor.pkl")
fallback_income = float(df["Income"].median())

expense_columns = [
    "Rent", "Insurance", "Groceries", "Transport",
    "Eating_Out", "Entertainment", "Utilities", "Healthcare", "Miscellaneous"
]

manageable_expenses = ["Groceries", "Transport", "Eating_Out", "Entertainment"]
fixed_expenses = ["Healthcare", "Insurance", "Miscellaneous", "Rent", "Utilities", "Loan_Repayment"]

savings_targets = {
    "Eating_Out": 0.30,
    "Entertainment": 0.25,
    "Groceries": 0.20,
    "Transport": 0.15,
    "Miscellaneous": 0.20
}

#Predict Expenses API
@app.route('/predict_expenses', methods=['POST'])
def predict_expenses():
    try:
        user_input = request.json or {}
        all_columns = ["Income", "Income_Log", "Income_Squared"] + expense_columns

        input_data = {col: [np.nan] for col in all_columns}
        for key, value in user_input.items():
            if key in input_data:
                input_data[key] = [value]

        if pd.isna(input_data["Income"][0]):
            known_expenses = [col for col in expense_columns if not pd.isna(input_data[col][0])]
            if known_expenses:
                income_input_df = pd.DataFrame({col: [input_data[col][0] if col in known_expenses else 0] for col in expense_columns})
                predicted_income = income_fallback_model.predict(income_input_df)[0]
                input_data["Income"] = [float(predicted_income)]
            else:
                input_data["Income"] = [fallback_income]

        income = float(input_data["Income"][0])
        input_data["Income_Log"] = [np.log1p(income)]
        input_data["Income_Squared"] = [income ** 2]

        df_input = pd.DataFrame(input_data)
        X_input = df_input[unified_model.feature_names_in_].fillna(0)
        y_pred = unified_model.predict(X_input)[0]

        result = {col: float(round(val, 2)) for col, val in zip(expense_columns, y_pred)}

        return jsonify({
            "predicted_income": float(round(income, 2)),
            "predicted_expenses": result
        })

    except Exception as e:
        return jsonify({"error": str(e)})

#Budget Planning API
@app.route('/user_budget_plan', methods=['POST'])
def user_budget_plan():
    try:
        data = request.json or {}

        user_income = data.get("user_income")
        past_savings = float(data.get("past_savings", 0))
        user_budget = data.get("user_budget", {})

        #Smart: Predict income if user_income is None and expenses provided
        if user_income is None:
            known_expenses = {k: v for k, v in user_budget.items() if v not in [None, "", 0]}

            if known_expenses:
                #Prepare expense features for prediction
                income_input_df = pd.DataFrame({
                    col: [float(known_expenses.get(col, 0))] for col in expense_columns
                })

                #Predict income
                predicted_income = income_fallback_model.predict(income_input_df)[0]
                user_income = float(predicted_income)
                income_source = "Predicted from Expenses"
            else:
                user_income = float(round(df["Income"].mean(), 2))
                income_source = "AI Estimated"
        else:
            user_income = float(user_income)
            income_source = "User Entered"


        # Prepare input for model
        df_input = pd.DataFrame([{
            "Income": user_income,
            "Income_Log": np.log1p(user_income),
            "Income_Squared": user_income ** 2,
            **{col: np.nan for col in expense_columns}
        }])
        df_input = df_input[unified_model.feature_names_in_].fillna(0)

        predicted_expenses = unified_model.predict(df_input)[0]
        estimated_budget = {cat: float(round(predicted_expenses[i], 2)) for i, cat in enumerate(expense_columns)}

        for category in expense_columns:
            if category not in user_budget or user_budget[category] in [None, ""]:
                user_budget[category] = estimated_budget.get(category, 0)
            else:
                user_budget[category] = float(user_budget[category])

        total_budget = float(sum(user_budget.values()))
        free_budget = float(user_income - total_budget)

        transactions = []
        spending_tracker = {cat: 0 for cat in expense_columns}
        sampled_categories = random.sample(expense_columns, k=min(5, len(expense_columns)))

        for category in sampled_categories:
            budget_limit = user_budget.get(category, 500)
            max_expense = min(budget_limit * 1.2, 1000) 
            new_expense = round(random.uniform(0.4, 1.2) * budget_limit, 2)
            
            spending_tracker[category] += new_expense
            remaining_budget = round(user_budget.get(category, 0) - spending_tracker[category], 2)
            
            transactions.append({
                "category": category,
                "amount": new_expense,
                "remaining_budget": remaining_budget
            })




        savings_recommendations = {
            cat: f"Reduce {cat} by ${float(user_budget[cat] * savings_targets[cat]):.2f} to optimize savings."
            for cat in savings_targets if cat in user_budget
        }

        financial_advice = {}
        for category, budget in user_budget.items():
            budget = float(budget)
            if budget > 5000:
                msg = f"⚠️ You are spending ${budget:.2f} on {category}. Consider reducing costs."
            elif 2000 <= budget <= 5000:
                msg = f"🟡 Your {category} expenses are moderate at ${budget:.2f}. Try saving more."
            else:
                msg = f"✅ Good job! Your {category} spending is under control at ${budget:.2f}."
            financial_advice[category] = msg

        return jsonify({
            "income_prediction": float(user_income),
            "income_source": income_source,
            "past_savings": float(past_savings),
            "budget_allocations": {k: float(v) for k, v in user_budget.items()},
            "free_budget": float(free_budget),
            "transactions": [
                {
                    "category": t["category"],
                    "amount": float(t["amount"]),
                    "remaining_budget": float(t["remaining_budget"])
                } for t in transactions
            ],
            "savings_recommendations": savings_recommendations,
            "financial_advice": financial_advice
        })

    except Exception as e:
        return jsonify({"error": str(e)})







@app.route("/parse_sms_messages_gemini", methods=["GET"])
def parse_sms_messages_gemini():
    try:
        with open("data/sms_messages.json", "r") as f:
            raw_messages = json.load(f)

        parsed_data = []

        for entry in raw_messages[:5]:  # ✅ Process 5 messages at a time
            text = entry["text"]

            prompt = f"""
Extract the following fields from this banking SMS:
Message: "{text}"

Return JSON with:
- amount
- type (debit or credit)
- date (format: YYYY-MM-DD HH:MM)
- vendor
- category (one of the following exactly as written: Rent, Insurance, Groceries, Transport, Eating_Out, Entertainment, Utilities, Healthcare, Miscellaneous)

"""

            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {
                "contents": [
                    {"parts": [{"text": prompt}]}
                ]
            }

            response = requests.post(url, headers=headers, data=json.dumps(payload))

            try:
                output = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                cleaned_output = output.strip().strip("```json").strip("```").strip()
                parsed_json = json.loads(cleaned_output)

                if all(k in parsed_json for k in ["amount", "type", "date", "vendor", "category"]):
                    parsed_data.append(parsed_json)
                else:
                    print("⚠️ Missing keys in parsed result:", parsed_json)

            except Exception as e:
                print("❌ Gemini API Error:", response.text)
                print("❌ Could not parse this response")

            time.sleep(30)  # Wait to stay under quota


            existing_data = []
            if os.path.exists("data/parsed_transactions.json"):
                with open("data/parsed_transactions.json", "r") as f:
                    existing_data = json.load(f)

            # Avoid duplicates if needed
            all_data = existing_data + parsed_data
            unique_data = [dict(t) for t in {tuple(d.items()) for d in all_data}]  # remove duplicates

            with open("data/parsed_transactions.json", "w") as f:
                json.dump(unique_data, f, indent=2)




        return jsonify({"parsed": parsed_data})

    except Exception as e:
        return jsonify({"error": str(e)})
    


    
    
    
@app.route("/total_expenses_from_sms", methods=["GET"])
def total_expenses_from_sms():
    try:
        with open("data/parsed_transactions.json", "r") as f:
            transactions = json.load(f)

        totals = {cat: 0.0 for cat in expense_columns}

        for txn in transactions:
            category = txn.get("category")
            amount = float(txn.get("amount", 0))
            if category in totals:
                totals[category] += amount

        totals = {k: round(v, 2) for k, v in totals.items()}
        return jsonify({"totals_by_category": totals})

    except Exception as e:
        return jsonify({"error": str(e)})






# === Run the App ===
if __name__ == '__main__':
    app.run(debug=True)

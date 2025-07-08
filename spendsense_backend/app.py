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
import traceback

load_dotenv("gemini.env")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app, supports_credentials=True)






VALID_USERS = {
    "admin": "admin123",
    "guest": "guest123"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "Missing credentials"}), 400

    if VALID_USERS.get(username) == password:
        return jsonify({"success": True, "username": username})
    else:
        return jsonify({"success": False, "message": "Invalid username or password"}), 401











# Load Data & Models
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








@app.route('/user_budget_plan', methods=['POST'])
def user_budget_plan():
    try:
        data = request.json or {}
        user_income = data.get("user_income")
        past_savings = float(data.get("past_savings", 0))
        user_budget = data.get("user_budget", {})

        if user_income is None:
            known_expenses = {k: v for k, v in user_budget.items() if v not in [None, "", 0]}
            if known_expenses:
                income_input_df = pd.DataFrame({col: [float(known_expenses.get(col, 0))] for col in expense_columns})
                predicted_income = income_fallback_model.predict(income_input_df)[0]
                user_income = float(predicted_income)
                income_source = "Predicted from Expenses"
            else:
                user_income = float(round(df["Income"].mean(), 2))
                income_source = "AI Estimated"
        else:
            user_income = float(user_income)
            income_source = "User Entered"

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
            new_expense = round(random.uniform(0.4, 1.2) * budget_limit, 2)
            spending_tracker[category] += new_expense
            remaining_budget = round(user_budget.get(category, 0) - spending_tracker[category], 2)
            transactions.append({"category": category, "amount": new_expense, "remaining_budget": remaining_budget})

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
            "transactions": transactions,
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

        random.shuffle(raw_messages)
        selected_messages = raw_messages[:5]

        parsed_data = []

        for entry in selected_messages:
            text = entry["text"]

            prompt = f"""
You are an AI assistant that extracts structured data from banking SMS.
Given this message: \"{text}\", return ONLY valid JSON with:
- amount (number)
- type (\"debit\" or \"credit\")
- date (format: YYYY-MM-DD HH:MM)
- vendor (string)
- category (choose ONLY from: Rent, Insurance, Groceries, Transport, Eating_Out, Entertainment, Utilities, Healthcare, Miscellaneous)

Example:
{{
  "amount": 120.50,
  "type": "debit",
  "date": "2025-03-30 14:22",
  "vendor": "Domino's",
  "category": "Eating_Out"
}}
"""

            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {"contents": [{"parts": [{"text": prompt}]}]}

            response = requests.post(url, headers=headers, data=json.dumps(payload))
            print("🔁 Gemini raw response:", response.text)

            try:
                output = response.json()["candidates"][0]["content"]["parts"][0]["text"]
                json_start = output.find("{")
                json_end = output.rfind("}") + 1
                cleaned_json = output[json_start:json_end]
                parsed_json = json.loads(cleaned_json)

                if all(k in parsed_json for k in ["amount", "type", "date", "vendor", "category"]):
                    parsed_data.append(parsed_json)
            except Exception as e:
                print("❌ Could not parse Gemini response:", e)
                continue

            time.sleep(5)

        # Load existing data safely (create empty list if file doesn't exist or is invalid)
        existing_data = []
        if os.path.exists("data/parsed_transactions.json"):
            try:
                with open("data/parsed_transactions.json", "r") as f:
                    content = f.read().strip()
                    if content:
                        existing_data = json.loads(content)
            except Exception as e:
                print("⚠️ Failed to load parsed_transactions.json:", e)

        all_data = existing_data + parsed_data
        with open("data/parsed_transactions.json", "w") as f:
            json.dump(all_data, f, indent=2)

            return jsonify({"new_transactions": parsed_data})
        
    except Exception as e:
        return jsonify({"error": str(e)})
    




@app.route("/recent_sms_transactions", methods=["GET"])
def recent_sms_transactions():
    try:
        with open("data/parsed_transactions.json", "r") as f:
            transactions = json.load(f)

        transactions_sorted = sorted(transactions, key=lambda x: x["date"], reverse=True)
        return jsonify({"recent_transactions": transactions_sorted[:5]})
    except Exception as e:
        print("❌ Error in /recent_sms_transactions:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500










@app.route("/enrich_anomaly_sms", methods=["POST"])
def enrich_anomaly_sms():
    try:
        file_path = "data/anomaly_detection/flagged_sms_transactions.json"

        with open(file_path, "r") as f:
            sms_list = json.load(f)

        enriched = []
        newly_enriched = []

        count = 0
        max_to_enrich = 5  # 💡 Only enrich 5 messages at a time

        for sms in sms_list:
            # Already enriched? Keep it as is
            if all(k in sms for k in ["amount", "type", "date", "vendor", "category"]):
                enriched.append(sms)
                continue

            if count >= max_to_enrich:
                enriched.append(sms)
                continue

            text = sms.get("text", "")

            prompt = f"""
You are an AI assistant that extracts structured data from banking SMS.
Given this message: \"{text}\", return ONLY valid JSON with:
- amount (number)
- type (\"debit\" or \"credit\")
- date (format: YYYY-MM-DD HH:MM)
- vendor (string)
- category (choose ONLY from: Rent, Insurance, Groceries, Transport, Eating_Out, Entertainment, Utilities, Healthcare, Miscellaneous)

Example:
{{
  "amount": 120.50,
  "type": "debit",
  "date": "2025-03-30 14:22",
  "vendor": "Domino's",
  "category": "Eating_Out"
}}
"""

            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {"contents": [{"parts": [{"text": prompt}]}]}

            response = requests.post(url, headers=headers, json=payload)
            response_json = response.json()
            print("🔁 Gemini response JSON:", response_json)

            if "candidates" not in response_json:
                raise Exception("Gemini API response missing 'candidates' key. Full response: " + str(response_json))

            output = response_json["candidates"][0]["content"]["parts"][0]["text"]
            json_start = output.find("{")
            json_end = output.rfind("}") + 1
            parsed = json.loads(output[json_start:json_end])

            enriched.append({**sms, **parsed})
            newly_enriched.append({**sms, **parsed})
            count += 1
            time.sleep(5)

        # Add remaining unprocessed ones
        if count < max_to_enrich:
            enriched += sms_list[len(enriched):]

        with open(file_path, "w") as f:
            json.dump(enriched, f, indent=2)

        return jsonify({
            "message": f"{count} new messages enriched and saved.",
            "new_enriched": newly_enriched
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




























@app.route("/all_sms_transactions", methods=["GET"])
def all_sms_transactions():
    try:
        with open("data/anomaly_detection/flagged_sms_transactions.json", "r") as f:
            transactions = json.load(f)
        return jsonify({"all_transactions": transactions})
    except Exception as e:
        print("❌ Error in /all_sms_transactions:", str(e))
        return jsonify({"error": str(e)}), 500








@app.route("/stock_forecast", methods=["GET"])
def stock_forecast():
    symbol = request.args.get("symbol", "AAPL").upper()
    model_type = request.args.get("model", "prophet").lower()

    # Choose file based on model
    if model_type == "lstm":
        file_path = f"data/{symbol}_forecast_lstm.csv"
    else:
        file_path = f"data/stock/prophet/{symbol}_forecast.csv"  # Prophet is default

    try:
        df = pd.read_csv(file_path)
        return jsonify({"forecast": df.to_dict(orient="records")})
    except Exception as e:
        return jsonify({"error": str(e)}), 500








@app.route("/stock_advice", methods=["GET"])
def stock_advice():
    symbol = request.args.get("symbol", "AAPL").upper()
    model_type = request.args.get("model", "prophet").lower()

    file_path = f"data/{symbol}_forecast_lstm.csv" if model_type == "lstm" else f"data/stock/prophet/{symbol}_forecast.csv"
    
    try:
        df = pd.read_csv(file_path)
        latest = df.tail(30)
        trend = latest["Predicted_Close"].values
        delta = trend[-1] - trend[0]

        if delta > 5:
            insight = f"{symbol} stock shows a strong upward trend. 📈 You might consider watching for potential resistance levels."
        elif delta < -5:
            insight = f"{symbol} stock appears to be declining. 📉 Be cautious of downward momentum."
        else:
            insight = f"{symbol} stock remains relatively stable. 📊 Consider holding or monitoring for breakout signals."

        return jsonify({"advice": insight})
    except Exception as e:
        return jsonify({"error": str(e)}), 500











@app.route("/compare_stocks", methods=["GET"])
def compare_stocks():
    try:
        symbols_param = request.args.get("symbols")
        model_type = request.args.get("model", "prophet").lower()
        if not symbols_param:
            return jsonify({"error": "No stock symbols provided."}), 400

        symbols = [s.strip().upper() for s in symbols_param.split(",")]
        comparison_data = {}

        for symbol in symbols:
            file_path = f"data/{symbol}_forecast_lstm.csv" if model_type == "lstm" else f"data/stock/prophet/{symbol}_forecast.csv"
            if not os.path.exists(file_path):
                return jsonify({"error": f"Forecast file not found for {symbol}"}), 404

            df = pd.read_csv(file_path)
            if df.empty or "Predicted_Close" not in df.columns:
                return jsonify({"error": f"Invalid forecast data for {symbol}"}), 500

            start_price = df["Predicted_Close"].iloc[0]
            end_price = df["Predicted_Close"].iloc[-1]
            pct_growth = ((end_price - start_price) / start_price) * 100
            volatility = df["Predicted_Close"].std()

            comparison_data[symbol] = {
                "start_price": round(start_price, 2),
                "end_price": round(end_price, 2),
                "growth_percent": round(pct_growth, 2),
                "volatility": round(volatility, 2)
            }

        best_symbol = max(comparison_data, key=lambda s: comparison_data[s]["growth_percent"])
        insight_lines = [
            f"{symbol} ➜ Growth: {data['growth_percent']}%, Volatility: {data['volatility']}"
            for symbol, data in comparison_data.items()
        ]

        summary = f"📊 Forecast Comparison:\n" + "\n".join(insight_lines)
        summary += f"\n\n💡 Recommendation: {best_symbol} shows the highest predicted growth."

        return jsonify({"comparison": comparison_data, "insight": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500










@app.route("/chatbot_qa", methods=["POST"])
def chatbot_qa():
    try:
        user_msg = request.json.get("message", "").strip()
        if not user_msg:
            return jsonify({"error": "No message provided"}), 400

        # ✅ Step 1: Load pre-calculated forecast summary from JSON
        summary_path = "data/stock/prophet/forecast_summary.json"
        if not os.path.exists(summary_path):
            return jsonify({"error": "forecast_summary.json not found"}), 500

        with open(summary_path, "r") as f:
            stock_data = json.load(f)

        # ✅ Step 2: Format the stats for the prompt
        formatted_data = "\n".join(
            [
                f"{symbol} ➜ Predicted Growth: {info['growth']}%, Volatility: {info['volatility']}%"
                for symbol, info in stock_data.items()
            ]
        )

        # ✅ Step 3: Construct Gemini prompt
        prompt = f"""
You are a stock advisor AI.

Here is real forecast data from our AI model (do not invent numbers):

{formatted_data}

The user asked: "{user_msg}"

✅ Please ONLY analyze and explain the above stats.
✅ Do NOT generate your own growth or volatility.
✅ Just compare the numbers and give a friendly summary.
✅ Use emojis like 📈, ⚠️, ✅ where helpful.

Also explain what high/low growth and volatility means, and which stocks are most balanced or risky.
"""

        # ✅ Step 4: Send to Gemini API
        url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        payload = {"contents": [{"parts": [{"text": prompt}]}]}

        res = requests.post(url, headers=headers, json=payload)
        output = res.json()["candidates"][0]["content"]["parts"][0]["text"]

        # ✅ Optional: Append explanation
        explanation = """
📊 Here's how we calculate these metrics:
• Growth = ((End Price - Start Price) / Start Price) × 100
• Volatility = Standard Deviation of all predicted closing prices

📈 Higher growth = higher return potential  
⚠️ Higher volatility = more risk due to price swings
"""

        full_response = output.strip() + "\n\n" + explanation.strip()
        return jsonify({"response": full_response})

    except Exception as e:
        print("❌ Gemini chatbot error:", e)
        return jsonify({"error": str(e)}), 500












@app.route("/detect_sms_anomalies", methods=["GET"])
def detect_sms_anomalies():
    file_path = "data/anomaly_detection/flagged_sms_transactions.json"

    if not os.path.exists(file_path):
        return jsonify({"error": "Anomaly results file not found"}), 404

    with open(file_path, "r") as f:
        sms_anomalies = json.load(f)

    # Optional: Return only the anomalies
    anomalies_only = [sms for sms in sms_anomalies if sms.get("is_anomaly")]

    return jsonify({"anomalies": anomalies_only})












@app.route("/validate_sms_anomaly", methods=["POST"])
def validate_sms_anomaly():
    data = request.get_json()
    sms_text = data.get("text")

    if not sms_text:
        return jsonify({"error": "Missing SMS text"}), 400

    file_path = "data/anomaly_detection/flagged_sms_transactions.json"

    if not os.path.exists(file_path):
        return jsonify({"error": "Data file not found"}), 404

    with open(file_path, "r") as f:
        sms_data = json.load(f)

    updated = False
    for sms in sms_data:
        if sms.get("text") == sms_text and sms.get("is_anomaly") == True:
            sms["is_anomaly"] = False
            updated = True
            break

    if not updated:
        return jsonify({"error": "SMS not found or already validated"}), 404

    # Save updated data
    with open(file_path, "w") as f:
        json.dump(sms_data, f, indent=2)

    return jsonify({"message": "SMS validated successfully", "text": sms_text})









@app.route("/enrich_anomaly_sms_batch", methods=["POST"])
def enrich_anomaly_sms_batch():
    try:
        file_path = "data/anomaly_detection/flagged_sms_transactions.json"

        with open(file_path, "r") as f:
            sms_list = json.load(f)

        enriched = []
        enriched_count = 0

        for sms in sms_list:
            if enriched_count >= 5:
                break
            if all(k in sms for k in ["amount", "type", "date", "vendor", "category"]):
                enriched.append(sms)
                continue

            text = sms.get("text", "")
            prompt = f"""
You are an AI assistant that extracts structured data from banking SMS.
Given this message: \"{text}\", return ONLY valid JSON with:
- amount (number)
- type (\"debit\" or \"credit\")
- date (format: YYYY-MM-DD HH:MM)
- vendor (string)
- category (choose ONLY from: Rent, Insurance, Groceries, Transport, Eating_Out, Entertainment, Utilities, Healthcare, Miscellaneous)
"""
            url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
            headers = {"Content-Type": "application/json"}
            payload = {"contents": [{"parts": [{"text": prompt}]}]}

            response = requests.post(url, headers=headers, json=payload)
            response_json = response.json()
            output = response_json["candidates"][0]["content"]["parts"][0]["text"]
            json_start = output.find("{")
            json_end = output.rfind("}") + 1
            parsed = json.loads(output[json_start:json_end])

            sms.update(parsed)
            enriched_count += 1
            time.sleep(5)

        # Save the updated list
        with open(file_path, "w") as f:
            json.dump(sms_list, f, indent=2)

        return jsonify({"message": "5 messages enriched", "count": enriched_count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500










if __name__ == '__main__':
    app.run(debug=True)
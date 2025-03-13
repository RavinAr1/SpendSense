from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load trained models
income_model = joblib.load("savings_optimization_model.pkl")
expense_model = joblib.load("savings_optimization_model.pkl")

# Load dataset
df = pd.read_csv("data/expense_data_2.csv")

# Expense categories
expense_columns = ["Rent", "Loan_Repayment", "Insurance", "Groceries", "Transport",
                   "Eating_Out", "Entertainment", "Utilities", "Healthcare", "Education", "Miscellaneous"]

# Manageable & Fixed Expenses
manageable_expenses = ["Groceries", "Transport", "Eating_Out", "Entertainment"]
fixed_expenses = ["Education", "Healthcare", "Insurance", "Loan_Repayment", "Miscellaneous", "Rent", "Utilities"]

# Savings percentage recommendations
savings_targets = {
    "Eating_Out": 0.30,
    "Entertainment": 0.25,
    "Groceries": 0.20,
    "Transport": 0.15,
    "Miscellaneous": 0.20
}

### API Endpoint: User Budget Planning ###
@app.route('/user_budget_plan', methods=['POST'])
def user_budget_plan():
    try:
        data = request.json

        # Get user inputs
        user_income = data.get("user_income")
        past_savings = data.get("past_savings", 0)  # Default to 0
        user_budget = data.get("user_budget", {})

        # AI Estimates Monthly Income if not provided
        if user_income is None:
            user_income = round(df['Income'].mean(), 2)
            income_source = "AI Estimated"
        else:
            user_income = float(user_income)
            income_source = "User Entered"

        # AI Estimates Budgets for ALL Categories (Manageable & Fixed)
        estimated_budget = {category: round(df[category].mean(), 2) for category in expense_columns}

        # Ensure all categories have valid numeric values
        for category in expense_columns:
            if category not in user_budget or user_budget[category] is None or user_budget[category] == "":
                user_budget[category] = estimated_budget[category]
            else:
                user_budget[category] = float(user_budget[category])  # Convert entered values to float

        # Calculate Free Budget
        total_budget_allocated = sum(user_budget.values())
        free_budget = user_income - total_budget_allocated if user_income else 0

        # Generate Transactions based on new budget
        transactions = []
        spending_tracker = {category: 0 for category in expense_columns}
        for _ in range(5):  # Simulating 5 transactions
            category = random.choice(expense_columns)
            new_expense = random.randint(1000, 5000)
            spending_tracker[category] += new_expense
            remaining_budget = user_budget.get(category, 0) - spending_tracker[category]

            transaction_detail = {
                "category": category,
                "amount": new_expense,
                "remaining_budget": remaining_budget if remaining_budget is not None else 0
            }

            transactions.append(transaction_detail)

        # Generate AI Savings Recommendations for Manageable Expenses
        savings_recommendations = {
            category: f"Reduce {category} spending by ${user_budget.get(category, 0) * savings_targets[category]:.2f} to optimize savings."
            for category in savings_targets
        }

        # Generate AI Financial Advice for ALL Expenses
        financial_advice = {
            category: f"⚠️ You are spending ${budget:.2f} on {category}. Consider reducing costs."
            if budget > 5000 else (
                f"🟡 Your {category} expenses are moderate at ${budget:.2f}. Try saving more."
                if 2000 <= budget <= 5000 else f"✅ Good job! Your {category} spending is under control at ${budget:.2f}."
            )
            for category, budget in user_budget.items()
        }

        return jsonify({
            "income_prediction": user_income if user_income else 0,
            "income_source": income_source,
            "past_savings": past_savings if past_savings else 0,
            "budget_allocations": {c: float(user_budget.get(c, 0)) for c in expense_columns},
            "free_budget": free_budget if free_budget else 0,
            "transactions": transactions,
            "savings_recommendations": savings_recommendations if savings_recommendations else {},
            "financial_advice": financial_advice if financial_advice else {}
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

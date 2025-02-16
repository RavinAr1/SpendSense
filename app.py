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
        for category in expense_columns:
            if category not in user_budget or user_budget[category] is None:
                user_budget[category] = estimated_budget[category]

        # Calculate Free Budget
        total_budget_allocated = sum(user_budget.values())
        free_budget = user_income - total_budget_allocated

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
                "remaining_budget": remaining_budget
            }

            if remaining_budget < 0:
                excess = abs(remaining_budget)
                if free_budget >= excess:
                    free_budget -= excess
                    transaction_detail["covered_by_free_budget"] = excess
                else:
                    transaction_detail["covered_by_savings"] = excess - free_budget
                    free_budget = 0  

            transactions.append(transaction_detail)

        # Generate AI Savings Recommendations for Manageable Expenses
        savings_recommendations = {
            category: f"Reduce {category} spending by ${user_budget.get(category, 0) * savings_targets[category]:.2f} to optimize savings."
            for category in savings_targets
        }

        # Generate AI Financial Advice for ALL Expenses
        financial_advice = {}
        for category, budget in user_budget.items():
            if budget > 5000:
                financial_advice[category] = f"⚠️ You are spending ${budget:.2f} on {category}. Consider reducing costs."
            elif 2000 <= budget <= 5000:
                financial_advice[category] = f"🟡 Your {category} expenses are moderate at ${budget:.2f}. Try saving more."
            else:
                financial_advice[category] = f"✅ Good job! Your {category} spending is under control at ${budget:.2f}."

        return jsonify({
            "income_prediction": user_income,
            "income_source": income_source,
            "past_savings": past_savings,
            "budget_allocations": user_budget,  
            "free_budget": free_budget,
            "transactions": transactions,
            "savings_recommendations": savings_recommendations,
            "financial_advice": financial_advice
        })

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)

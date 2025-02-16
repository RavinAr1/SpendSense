import joblib

# Path to your model
model_path = "savings_optimization_model.pkl"

# Load the model
try:
    model = joblib.load(model_path)
    print(f"✅ Model loaded successfully: {type(model)}")
except Exception as e:
    print(f"❌ Error loading model: {e}")

import pickle

# Load the trained model
model_path = r"D:\Ravindu -Documents\IIT\Learning Modules\Year 4\FYP\SpendSense_Backend\savings_optimization_model.pkl"
with open(model_path, 'rb') as file:
    model = pickle.load(file)

# Check if the model loads correctly
print("Model loaded successfully:", type(model))

import pandas as pd
import shap
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MultiLabelBinarizer

#load data
data = pd.read_csv("jobs_dataset.csv")

print("Dataset Loaded for Explainable AI\n")

# CONVERT SKILLS INTO MACHINE READABLE FORM
data["Skills_List"] = data["Skills"].apply(lambda x: x.split(";"))

mlb = MultiLabelBinarizer()
skills_encoded = pd.DataFrame(mlb.fit_transform(data["Skills_List"]),
                              columns=mlb.classes_)

# Combine with demand + salary
X = skills_encoded
y = data["Demand_Score"]   # What we want to explain

# TRAIN MODEL (Predict Industry Demand)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

print("Model trained to understand industry demand.\n")

# APPLY SHAP (Explain Predictions)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X)

# FEATURE IMPORTANCE GRAPH
print("Generating SHAP Feature Importance Plot:")
shap.summary_plot(shap_values, X)

# BAR CHART (MOST IMPORTANT SKILLS)
print("Generating SHAP Bar Chart:")
shap.summary_plot(shap_values, X, plot_type="bar")

# GENERATE HUMAN-READABLE INSIGHT
importance = pd.DataFrame({
    "Skill": X.columns,
    "Importance": abs(shap_values).mean(axis=0)
}).sort_values(by="Importance", ascending=False)

top_skills = importance.head(5)["Skill"].tolist()

print("\nTop Skills Driving Industry Demand:")
for skill in top_skills:
    print(">", skill)

print("\nExplanation Example:")
print(f"Careers are in demand mainly due to strong need for {', '.join(top_skills)}.")

print("\nExplainable AI Analysis Completed!")

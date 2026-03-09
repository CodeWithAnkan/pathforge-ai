import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter

# GLOBAL GRAPH SETTINGS (Fix size issues)
plt.rcParams["figure.figsize"] = (8, 4)
plt.rcParams["axes.titlesize"] = 12
plt.rcParams["axes.labelsize"] = 10
plt.rcParams["xtick.labelsize"] = 9
plt.rcParams["ytick.labelsize"] = 9

# LOAD DATASET
data = pd.read_csv("jobs_dataset.csv")

print("\nDataset Loaded Successfully!\n")

# SKILL POPULARITY ANALYSIS
all_skills = []

for skills in data["Skills"]:
    skill_list = skills.split(";")
    all_skills.extend(skill_list)

skill_count = Counter(all_skills)

skill_df = pd.DataFrame(skill_count.items(), columns=["Skill", "Frequency"])
skill_df = skill_df.sort_values(by="Frequency", ascending=False)

print("Top In-Demand Skills:\n")
print(skill_df.head(10))

# Plot Top Skills
plt.figure()
plt.bar(skill_df["Skill"][:10], skill_df["Frequency"][:10])
plt.title("Top 10 Most Demanded Skills")
plt.xlabel("Skills")
plt.ylabel("Frequency")
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()

# CAREER DEMAND INDEX
career_demand = data.groupby("Job_Role")["Demand_Score"].mean().sort_values(ascending=False)

print("\nCareer Demand Ranking:\n")
print(career_demand)

plt.figure()
career_demand.plot(kind="bar")
plt.title("Career Demand Index")
plt.xlabel("Career")
plt.ylabel("Demand Score")
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()

#SALARY TREND ANALYSIS
salary_trend = data.groupby("Job_Role")["Average_Salary_INR"].mean().sort_values(ascending=False)

print("\nSalary Comparison:\n")
print(salary_trend)

plt.figure()
salary_trend.plot(kind="bar")
plt.title("Average Salary by Career")
plt.xlabel("Career")
plt.ylabel("Salary (INR)")
plt.xticks(rotation=30)
plt.tight_layout()
plt.show()

# DEMAND vs SALARY RELATIONSHIP
plt.figure()
plt.scatter(data["Demand_Score"], data["Average_Salary_INR"])
plt.title("Demand vs Salary Relationship")
plt.xlabel("Demand Score")
plt.ylabel("Salary (INR)")
plt.tight_layout()
plt.show()

print("\nIndustry Analysis Completed Successfully!")

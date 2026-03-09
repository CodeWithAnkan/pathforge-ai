import pandas as pd
from collections import Counter

class JobAnalyzer:

    def __init__(self, dataset_path="jobs_dataset.csv"):
        self.data = pd.read_csv(dataset_path)
        print("Industry Dataset Loaded.")

        # Prepare skill frequency
        self._analyze_skills()

    # ----------------------------------------
    # 1️⃣ SKILL POPULARITY SCORE
    # ----------------------------------------
    def _analyze_skills(self):
        all_skills = []

        for skills in self.data["Skills"]:
            all_skills.extend(skills.split(";"))

        self.skill_count = Counter(all_skills)

    def get_top_skills(self, top_n=10):
        return self.skill_count.most_common(top_n)

    # ----------------------------------------
    # 2️⃣ CAREER DEMAND INDEX
    # ----------------------------------------
    def get_career_demand(self, career_name):
        career_data = self.data[self.data["Job_Role"] == career_name]

        if career_data.empty:
            return "Career not found."

        return career_data["Demand_Score"].mean()

    # ----------------------------------------
    # 3️⃣ SALARY TREND
    # ----------------------------------------
    def get_average_salary(self, career_name):
        career_data = self.data[self.data["Job_Role"] == career_name]

        if career_data.empty:
            return "Career not found."

        return career_data["Average_Salary_INR"].mean()

    # ----------------------------------------
    # 4️⃣ FULL CAREER INSIGHT (MAIN FUNCTION)
    # ----------------------------------------
    def analyze_career(self, career_name):
        demand = self.get_career_demand(career_name)
        salary = self.get_average_salary(career_name)

        skills = self.data[self.data["Job_Role"] == career_name]["Skills"].iloc[0]

        return {
            "Career": career_name,
            "Demand Score": demand,
            "Average Salary": salary,
            "Key Skills": skills
        }

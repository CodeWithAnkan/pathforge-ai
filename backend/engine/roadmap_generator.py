from engine.model_loader import learning_resources, skill_difficulty

def generate_roadmap(priority_skills, top_n=6):

    roadmap = {}
    month = 1

    top_skills = list(priority_skills.items())[:top_n]

    for i, (skill, score) in enumerate(top_skills):

        course_list = learning_resources.get(skill.lower(), [])

        if course_list:
            course_name = course_list[0]["Course"]
            difficulty = course_list[0]["Difficulty"]
        else:
            course_name = "Self Study Recommended"
            difficulty = skill_difficulty.get(skill.lower(), "Intermediate")

        roadmap.setdefault(f"Month {month}", []).append({
            "Skill": skill,
            "Course": course_name,
            "Difficulty": difficulty,
            "Priority Score": score
        })

        if (i + 1) % 2 == 0:
            month += 1

    return roadmap
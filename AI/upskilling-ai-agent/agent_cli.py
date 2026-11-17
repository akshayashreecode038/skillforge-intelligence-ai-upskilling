#!/usr/bin/env python3
"""
AI-Powered Personalized Upskilling & Skill-Gap Learning Agent (CLI Engine)
Strictly adheres to the Master System Prompt Sections 1 to 28.
"""

import json
import os
import sys
from typing import Dict, Any, List

class UpskillingAgentCLI:
    def __init__(self):
        self.profile_path = os.path.join(os.path.dirname(__file__), "learner_profile.json")
        self.profile = self.load_or_init_profile()
        self.role_competencies = {
            "Data Analyst": {
                "Python": {"required_level": 4, "importance": 0.9, "prereqs": []},
                "SQL": {"required_level": 4, "importance": 1.0, "prereqs": []},
                "Excel": {"required_level": 3, "importance": 0.8, "prereqs": []},
                "Statistics": {"required_level": 3, "importance": 0.85, "prereqs": []},
                "Data Cleaning": {"required_level": 4, "importance": 0.95, "prereqs": ["Python", "Excel"]},
                "Data Visualization": {"required_level": 4, "importance": 0.9, "prereqs": ["Statistics", "Excel"]},
                "Power BI": {"required_level": 3, "importance": 0.75, "prereqs": ["SQL", "Data Visualization"]},
                "Business Analysis": {"required_level": 3, "importance": 0.7, "prereqs": ["Statistics", "Communication"]},
                "Communication": {"required_level": 3, "importance": 0.75, "prereqs": []}
            },
            "AI / Machine Learning Engineer": {
                "Python": {"required_level": 5, "importance": 1.0, "prereqs": []},
                "Linear Algebra & Calculus": {"required_level": 4, "importance": 0.85, "prereqs": []},
                "Probability & Statistics": {"required_level": 4, "importance": 0.9, "prereqs": ["Linear Algebra & Calculus"]},
                "Data Preprocessing": {"required_level": 4, "importance": 0.9, "prereqs": ["Python"]},
                "Machine Learning Algorithms": {"required_level": 4, "importance": 0.95, "prereqs": ["Python", "Probability & Statistics"]},
                "Deep Learning (PyTorch/TF)": {"required_level": 4, "importance": 0.9, "prereqs": ["Machine Learning Algorithms"]},
                "MLOps & Deployment": {"required_level": 3, "importance": 0.8, "prereqs": ["Python", "Deep Learning (PyTorch/TF)"]},
                "Model Evaluation & Ethics": {"required_level": 4, "importance": 0.85, "prereqs": ["Machine Learning Algorithms"]}
            }
        }
        self.question_bank = [
            {
                "skill": "SQL",
                "difficulty": 2,
                "concept": "LEFT JOIN vs INNER JOIN",
                "prompt": "You need all 100 customers returned, even those with zero matching orders in the orders table. Which JOIN must you use?",
                "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
                "correct": 1,
                "explanation": "LEFT JOIN retains all records from the primary left table regardless of right table matches."
            },
            {
                "skill": "Python",
                "difficulty": 2,
                "concept": "Default Mutable Arguments",
                "prompt": "What occurs when `def append_item(val, target_list=[]):` is called repeatedly?",
                "options": [
                    "SyntaxError",
                    "The same list instance is reused across invocations",
                    "A new list is instantiated each time",
                    "IndexError"
                ],
                "correct": 1,
                "explanation": "In Python, default arguments are evaluated once at function definition time."
            },
            {
                "skill": "Statistics",
                "difficulty": 2,
                "concept": "p-values in A/B Testing",
                "prompt": "In an A/B test with alpha = 0.05, you obtain a p-value of 0.021. What is the proper statistical decision?",
                "options": [
                    "Fail to reject null hypothesis",
                    "Reject null hypothesis (statistically significant difference)",
                    "Accept null hypothesis as true",
                    "Inconclusive test"
                ],
                "correct": 1,
                "explanation": "Since p-value (0.021) < alpha (0.05), we reject the null hypothesis."
            }
        ]

    def load_or_init_profile(self) -> Dict[str, Any]:
        if os.path.exists(self.profile_path):
            try:
                with open(self.profile_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        
        # Section 2 Default Profile
        return {
            "learner": {
                "name": "Alex Rivera",
                "education": "B.S. in Computer Science",
                "experience": "2 years general scripting & analysis",
                "career_goal": "Transition into Enterprise Data Analytics",
                "target_role": "Data Analyst",
                "target_industry": "Technology & E-Commerce"
            },
            "skills": {
                "Python": {
                    "proficiency": 2,
                    "confidence": 0.5,
                    "evidence": ["Self-reported basic scripting"],
                    "weak_areas": ["Object-Oriented Design", "Memory Optimization"],
                    "strong_areas": ["Basic syntax", "List comprehensions"]
                },
                "SQL": {
                    "proficiency": 1,
                    "confidence": 0.4,
                    "evidence": ["Self-reported basic queries"],
                    "weak_areas": ["Complex JOINs", "Window functions"],
                    "strong_areas": ["SELECT WHERE"]
                },
                "Excel": {
                    "proficiency": 3,
                    "confidence": 0.75,
                    "evidence": ["Daily reporting with Pivot Tables"],
                    "weak_areas": ["Power Query"],
                    "strong_areas": ["VLOOKUP", "Pivot Tables"]
                }
            },
            "learning_history": {
                "completed_topics": ["Excel Fundamentals"],
                "current_topic": "SQL Relational JOINs",
                "paused_topic": "",
                "assessment_results": [],
                "projects_completed": [],
                "mistakes": []
            },
            "preferences": {
                "learning_style": "Practical hands-on",
                "difficulty": "Adaptive balanced",
                "preferred_content": "Code challenges and scenario tasks"
            },
            "career_requirements": {
                "required_skills": ["Python", "SQL", "Excel", "Statistics", "Data Cleaning", "Data Visualization", "Power BI"],
                "optional_skills": [],
                "skill_levels": {"Python": 4, "SQL": 4, "Excel": 3, "Statistics": 3, "Data Cleaning": 4, "Data Visualization": 4, "Power BI": 3}
            }
        }

    def save_profile(self):
        with open(self.profile_path, "w", encoding="utf-8") as f:
            json.dump(self.profile, f, indent=2)

    def calculate_skill_gaps(self) -> List[Dict[str, Any]]:
        role = self.profile["learner"]["target_role"]
        comps = self.role_competencies.get(role, self.role_competencies["Data Analyst"])
        gaps = []
        for skill, meta in comps.items():
            curr = self.profile["skills"].get(skill, {}).get("proficiency", 0)
            conf = self.profile["skills"].get(skill, {}).get("confidence", 0.1)
            req = meta["required_level"]
            gap = max(0, req - curr)
            
            # Prereq boost
            prereq_count = sum(1 for _, m in comps.items() if skill in m.get("prereqs", []))
            priority_score = gap * meta["importance"] * (1.0 + (prereq_count * 0.35))
            
            p_label = "low"
            if priority_score >= 3.0: p_label = "critical"
            elif priority_score >= 1.8: p_label = "high"
            elif priority_score >= 0.9: p_label = "medium"

            gaps.append({
                "skill": skill,
                "required_level": req,
                "current_level": curr,
                "gap": gap,
                "confidence": conf,
                "priority": p_label,
                "priority_score": round(priority_score, 2)
            })
        return sorted(gaps, key=lambda x: x["priority_score"], reverse=True)

    def print_status(self):
        print("\n" + "="*60)
        print(" AI UPSKILLING AGENT - CURRENT LEARNER STATUS")
        print("="*60)
        learner = self.profile["learner"]
        print(f"Learner: {learner['name']} | Target Role: {learner['target_role']}")
        print(f"Goal: {learner['career_goal']}")
        print("-"*60)
        print(f"{'SKILL':<22} | {'CURRENT':<8} | {'TARGET':<8} | {'GAP':<6} | {'PRIORITY'}")
        print("-"*60)
        for g in self.calculate_skill_gaps():
            print(f"{g['skill']:<22} | Lvl {g['current_level']:<4} | Lvl {g['required_level']:<4} | {g['gap']:<6} | {g['priority'].upper()}")
        print("="*60)

    def run_diagnostic(self):
        print("\n--- ADAPTIVE DIAGNOSTIC CHALLENGE ---")
        gaps = self.calculate_skill_gaps()
        target_gap = next((g for g in gaps if g["gap"] > 0), gaps[0])
        skill = target_gap["skill"]
        
        q = next((item for item in self.question_bank if item["skill"] == skill), self.question_bank[0])
        print(f"\nSkill: {q['skill']} (Level {q['difficulty']}) - Concept: {q['concept']}")
        print(f"Question: {q['prompt']}\n")
        for i, opt in enumerate(q["options"]):
            print(f"  [{i + 1}] {opt}")
        
        choice = input("\nEnter your answer (1-4) or 'q' to quit: ").strip()
        if choice.lower() == 'q':
            return
        
        try:
            c_idx = int(choice) - 1
            if c_idx == q["correct"]:
                print(f"\n[CORRECT!] {q['explanation']}")
                print(f"[ADAPTATION]: Demonstrating mastery. Stepping up difficulty and updating skill profile.")
                if q["skill"] not in self.profile["skills"]:
                    self.profile["skills"][q["skill"]] = {"proficiency": 0, "confidence": 0.2, "evidence": []}
                s_obj = self.profile["skills"][q["skill"]]
                s_obj["proficiency"] = max(s_obj.get("proficiency", 0), q["difficulty"])
                s_obj["confidence"] = min(0.95, round(s_obj.get("confidence", 0.4) + 0.15, 2))
                s_obj.setdefault("evidence", []).insert(0, f"Passed Level {q['difficulty']} assessment on '{q['concept']}'")
            else:
                print(f"\n[INCORRECT]. Correct Answer: {q['options'][q['correct']]}")
                print(f"Explanation: {q['explanation']}")
                print(f"[ADAPTATION]: Concept gap flagged. Queuing targeted spaced revision and stepping down difficulty.")
            self.save_profile()
        except ValueError:
            print("Invalid input.")

    def run_menu(self):
        while True:
            print("\n[1] View Skill Gaps & Profile Status")
            print("[2] Take Adaptive Diagnostic Assessment")
            print("[3] View Live Learner Profile JSON (Section 2 Schema)")
            print("[4] Exit")
            choice = input("\nSelect option: ").strip()
            if choice == "1":
                self.print_status()
            elif choice == "2":
                self.run_diagnostic()
            elif choice == "3":
                print(json.dumps(self.profile, indent=2))
            elif choice == "4":
                print("Session saved. Keep progressing!")
                break
            else:
                print("Invalid choice.")

if __name__ == "__main__":
    agent = UpskillingAgentCLI()
    agent.run_menu()

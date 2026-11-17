# Backend ↔ AI Contract

## AI Dynamic Skill Analysis

The backend receives from the frontend:

```json
{
    "name": "Alex Rivera",
    "target_role": "Cloud DevOps Engineer",
    "resume_text": "Built Kubernetes clusters, configured Terraform CI/CD pipelines, and deployed Docker microservices on AWS."
}
```

The dynamic AI analysis pipeline processes the input and returns:

```json
{
    "user_id": 1,
    "name": "Alex Rivera",
    "target_role": "Cloud DevOps Engineer",
    "skills": [
        {
            "name": "Kubernetes",
            "current_level": 70,
            "required_level": 85,
            "gap": 15,
            "priority": "medium",
            "evidence": "Candidate built Kubernetes clusters in production",
            "confidence": "high"
        },
        {
            "name": "Terraform",
            "current_level": 65,
            "required_level": 80,
            "gap": 15,
            "priority": "medium",
            "evidence": "Configured Terraform CI/CD pipelines",
            "confidence": "medium"
        }
    ],
    "summary": "Candidate shows strong foundational DevOps skills with practical container orchestration experience.",
    "recommendations": [
        "Focus on advanced Kubernetes ingress controller and service mesh configurations.",
        "Deepen Terraform state management and security auditing."
    ]
}
```

### Proficiency Levels
- `0` = No knowledge / no textual evidence
- `25` = Foundational / beginner awareness
- `50` = Competent junior practitioner
- `75` = Experienced professional
- `100` = Senior domain authority / world-class expert

### Core Principles
- **Evidence-based**: No skills are fabricated without textual support from user profile or target role context.
- **Dynamic**: Target competencies are dynamically derived from the requested role title and industry requirements (no hard-coded role maps).
- **Extensible Normalization**: Skills are canonicalized (e.g. "ReactJS" $\rightarrow$ "React", "Python 3" $\rightarrow$ "Python") without static dictionaries.

---

## AI Learning Recommendation

The backend sends candidate context:
- `target_role`: Target career role
- `skills`: Current candidate skills with levels and gaps
- `completed_topics`: List of previously finished learning topics

The AI returns:

```json
{
    "next_topic": "Advanced Kubernetes Service Mesh & Istio",
    "skill": "Kubernetes",
    "reason": "This area represents your largest remaining competency gap for Cloud DevOps Engineer.",
    "difficulty": "intermediate"
}
```

---

## AI Agent Chat & Coaching

The backend sends:
- `message`: User message
- `user_id`: (Optional) User ID to fetch real skills from database
- `context`: (Optional) Learning context

The AI returns:

```json
{
    "reply": "Coaching message tailored directly to the user's specific skill gaps and career goal.",
    "reasoning": {
        "skill": "Targeted Competency",
        "evidence": "Diagnostic gap evaluation",
        "action": "Next practice task",
        "confidence": "High"
    }
}
```
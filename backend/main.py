from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from database import engine, Base, SessionLocal
import models
from ai import analyze_resume, get_chat_reply, get_recommendation

app = FastAPI(title="SkillForge API", version="1.0.0")

# ── CORS (allow frontend dev server) ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── DB init ───────────────────────────────────────────────────────────────────
Base.metadata.create_all(bind=engine)


# ── Pydantic models ───────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    name: str
    target_role: str
    resume_text: str


class ProgressRequest(BaseModel):
    user_id: int
    skill_name: str
    topic: str
    status: str
    score: int = 0


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None
    context: Optional[dict] = None


class RecommendRequest(BaseModel):
    user_id: int


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/")
def home():
    return {"message": "SkillForge Backend is running!"}


# ── Profile ───────────────────────────────────────────────────────────────────

@app.post("/profile")
def create_profile(profile: UserProfile):
    return {
        "message": "Profile received!",
        "name": profile.name,
        "target_role": profile.target_role,
    }


@app.get("/profile/{user_id}")
def get_profile(user_id: int):
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        skills = db.query(models.UserSkill).filter(
            models.UserSkill.user_id == user_id
        ).all()

        return {
            "user_id": user.id,
            "name": user.name,
            "target_role": user.target_role,
            "resume_text": user.resume_text,
            "skills": [
                {
                    "name": s.skill_name,
                    "current_level": s.current_level,
                    "required_level": s.required_level,
                    "gap": s.required_level - s.current_level,
                }
                for s in skills
            ],
        }
    finally:
        db.close()


# ── Analyze (AI-powered) ──────────────────────────────────────────────────────

@app.post("/analyze")
def analyze_profile(profile: UserProfile):
    """
    Analyze user resume/background dynamically for the specified target career role.
    Extracts evidence-based skills and computes personalized gaps without hardcoded defaults.
    """
    db = SessionLocal()
    try:
        # Save user to DB
        user = models.User(
            name=profile.name.strip(),
            target_role=profile.target_role.strip(),
            resume_text=profile.resume_text.strip(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Call dynamic AI pipeline to analyze resume
        ai_result = analyze_resume(user.resume_text, user.target_role)
        skills = ai_result.get("skills", [])

        # Save each AI-identified skill to DB
        for skill in skills:
            user_skill = models.UserSkill(
                user_id=user.id,
                skill_name=skill["name"],
                current_level=float(skill.get("current_level", 0)),
                required_level=float(skill.get("required_level", 0)),
            )
            db.add(user_skill)

        db.commit()

        return {
            "user_id": user.id,
            "name": user.name,
            "target_role": user.target_role,
            "skills": skills,
            "summary": ai_result.get("summary", ""),
            "recommendations": ai_result.get("recommendations", []),
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Skill analysis failed: {str(e)}")
    finally:
        db.close()


# ── Learning Progress ─────────────────────────────────────────────────────────

@app.post("/progress")
def add_progress(progress: ProgressRequest):
    db = SessionLocal()
    try:
        new_progress = models.LearningProgress(
            user_id=progress.user_id,
            skill_name=progress.skill_name,
            topic=progress.topic,
            status=progress.status,
            score=progress.score,
        )
        db.add(new_progress)
        db.commit()
        db.refresh(new_progress)

        return {
            "progress_id": new_progress.id,
            "message": "Learning progress saved",
        }
    finally:
        db.close()


@app.get("/progress/{user_id}")
def get_progress(user_id: int):
    db = SessionLocal()
    try:
        progress = db.query(models.LearningProgress).filter(
            models.LearningProgress.user_id == user_id
        ).all()

        return {
            "user_id": user_id,
            "progress": [
                {
                    "id": item.id,
                    "skill_name": item.skill_name,
                    "topic": item.topic,
                    "status": item.status,
                    "score": item.score,
                }
                for item in progress
            ],
        }
    finally:
        db.close()


# ── AI Chat Agent ─────────────────────────────────────────────────────────────

@app.post("/chat")
def chat_with_agent(request: ChatRequest):
    """
    Send a message to the AI learning agent.
    Optionally pass user_id to enrich context with real skill data.
    """
    context = request.context or {}

    # Enrich context with DB data if user_id is provided
    if request.user_id:
        db = SessionLocal()
        try:
            user = db.query(models.User).filter(
                models.User.id == request.user_id
            ).first()
            if user:
                context["user_name"] = user.name
                context["target_role"] = user.target_role

                skills = db.query(models.UserSkill).filter(
                    models.UserSkill.user_id == request.user_id
                ).all()
                context["skills"] = [
                    {
                        "name": s.skill_name,
                        "current_level": s.current_level,
                        "required_level": s.required_level,
                    }
                    for s in skills
                ]
        finally:
            db.close()

    try:
        result = get_chat_reply(request.message, context)
        return {
            "reply": result["reply"],
            "reasoning": result.get("reasoning"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")


# ── AI Recommendation ─────────────────────────────────────────────────────────

@app.post("/recommend")
def recommend_next(request: RecommendRequest):
    """
    Get an AI-powered recommendation for the next learning topic.
    """
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(
            models.User.id == request.user_id
        ).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        skills = db.query(models.UserSkill).filter(
            models.UserSkill.user_id == request.user_id
        ).all()

        progress_items = db.query(models.LearningProgress).filter(
            models.LearningProgress.user_id == request.user_id,
            models.LearningProgress.status == "completed",
        ).all()
        completed_topics = [p.topic for p in progress_items]

        skills_list = [
            {
                "name": s.skill_name,
                "current_level": s.current_level,
                "required_level": s.required_level,
            }
            for s in skills
        ]

        result = get_recommendation(user.target_role, skills_list, completed_topics)
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
    finally:
        db.close()
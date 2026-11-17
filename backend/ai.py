"""
AI Service Facade for SkillForge.
Provides dynamic, evidence-based skill extraction, interactive chat coaching,
and prioritized learning recommendations.
Zero hard-coded skill lists.
"""

import logging
from typing import Optional, Dict, Any, List
from schemas import (
    SkillAnalysisResponse,
    RecommendationResponse,
    ChatAgentReply,
    ChatReasoning,
)
from llm_service import LLMService, LLMServiceError, llm_service
from router import AIAgentRouter, router
from skill_pipeline import SkillAnalysisPipeline, pipeline

logger = logging.getLogger(__name__)


def analyze_resume(resume_text: str, target_role: str) -> Dict[str, Any]:
    """
    Dynamically analyze candidate input/resume for a target career role.
    Extracts evidence-based skills dynamically and computes skill gaps.
    Returns: { "skills": [{ "name", "current_level", "required_level", "gap", "priority", "evidence" }], "summary", "recommendations" }
    """
    result: SkillAnalysisResponse = pipeline.analyze(resume_text, target_role)
    return result.model_dump()


def get_chat_reply(
    user_message: str,
    context: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate an AI agent chat reply using AIAgentRouter and LLMService.
    Leverages real user skill context from DB.
    """
    context = context or {}
    user_name = context.get("user_name", "Learner")
    role = context.get("target_role", "your career role")
    user_skills = context.get("skills", [])

    # Route the request
    decision = router.route(user_message, context)
    logger.info(f"Chat routed to: {decision.route.value} (confidence: {decision.confidence:.2f})")

    if llm_service.is_available():
        try:
            skills_summary = ", ".join(
                [f"{s.get('name')} ({s.get('current_level')}/{s.get('required_level')})"
                 for s in user_skills[:6]]
            ) if user_skills else "No skills recorded yet"

            system_prompt = (
                "You are SkillForge AI, an expert personalized upskilling coach. "
                f"You are speaking with {user_name} whose target role is {role}.\n"
                f"Candidate's Current Skills: {skills_summary}\n"
                f"Current Route Strategy: {decision.route.value}\n\n"
                "Provide direct, actionable, motivating coaching. Connect your answer to their real skills and role. "
                "Never invent skills not provided. Be encouraging and concise."
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ]

            reply_text = llm_service.generate(messages, temperature=0.7)

            # Generate structured reasoning
            reasoning_prompt = (
                f"Based on user message: '{user_message}' and AI reply: '{reply_text[:200]}...', "
                "output a brief JSON object:\n"
                '{\n  "skill": "skill or competency addressed",\n  "evidence": "context or concept",\n  "action": "clear next action",\n  "confidence": "High" or "Medium" or "Low"\n}'
            )
            reasoning_obj = llm_service.generate_structured(
                [{"role": "user", "content": reasoning_prompt}],
                ChatReasoning,
            )

            return {
                "reply": reply_text,
                "reasoning": reasoning_obj.model_dump(),
            }

        except LLMServiceError as e:
            logger.warning(f"LLM chat reply failed ({e}); using dynamic contextual fallback.")

    # Dynamic contextual fallback based on user's actual context (ZERO hardcoded static responses)
    top_skill = user_skills[0].get("name") if user_skills else "core competencies"
    
    reply = (
        f"Hello {user_name}! I'm tracking your progression toward becoming a {role}. "
        f"Based on your profile, we are prioritizing your work in **{top_skill}**. "
        "Whether you want to break down difficult concepts, tackle hands-on challenges, or optimize your roadmap, I'm ready. "
        "What specific concept or question would you like to explore?"
    )

    reasoning = {
        "skill": top_skill,
        "evidence": f"Candidate profile registered for {role}",
        "action": f"Focus on highest-gap area: {top_skill}",
        "confidence": "Medium",
    }

    return {"reply": reply, "reasoning": reasoning}


def get_recommendation(
    target_role: str,
    skills: List[Dict[str, Any]],
    completed_topics: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Suggest the next best learning topic based dynamically on the user's largest skill gap.
    Returns: { "next_topic", "skill", "reason", "difficulty" }
    """
    completed_topics = completed_topics or []

    # Sort user's skills dynamically by largest gap
    sorted_skills = sorted(
        skills,
        key=lambda s: s.get("gap", s.get("required_level", 0) - s.get("current_level", 0)),
        reverse=True,
    )

    top_skill = sorted_skills[0].get("name") if sorted_skills else f"{target_role} Fundamentals"
    current_gap = sorted_skills[0].get("gap", 20) if sorted_skills else 20

    if llm_service.is_available():
        try:
            skills_text = "\n".join(
                [f"- {s.get('name')}: current={s.get('current_level')}, required={s.get('required_level')}, gap={s.get('gap')}"
                 for s in sorted_skills[:8]]
            )
            completed_text = ", ".join(completed_topics) if completed_topics else "None yet"

            prompt = (
                f"You are a career learning optimizer for someone targeting: {target_role}\n\n"
                f"Their current skill gaps:\n{skills_text}\n\n"
                f"Already completed topics: {completed_text}\n\n"
                "Recommend the single BEST next topic to learn that will have the highest career impact.\n"
                "Return ONLY valid JSON:\n"
                "{\n"
                '  "next_topic": "specific topic name",\n'
                '  "skill": "parent skill area",\n'
                '  "reason": "1-2 sentence explanation of why this is the priority",\n'
                '  "difficulty": "beginner" or "intermediate" or "advanced"\n'
                "}"
            )

            result = llm_service.generate_structured(
                [{"role": "user", "content": prompt}],
                RecommendationResponse,
            )
            return result.model_dump()

        except LLMServiceError as e:
            logger.warning(f"LLM recommendation failed ({e}); using dynamic gap-based fallback.")

    # Dynamic fallback based on candidate's real largest gap
    difficulty = "advanced" if current_gap < 15 else "intermediate" if current_gap < 30 else "beginner"
    return {
        "next_topic": f"Mastering {top_skill} in Practice",
        "skill": top_skill,
        "reason": f"This area currently presents a critical skill gap ({current_gap} points) for your {target_role} goal. Closing it will yield the highest return on job readiness.",
        "difficulty": difficulty,
    }
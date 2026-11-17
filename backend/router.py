import logging
from typing import Optional, Dict, Any
from schemas import TaskRoute, RouterDecision
from llm_service import LLMService, LLMServiceError, llm_service

logger = logging.getLogger(__name__)

ROUTER_PROMPT = """You are an AI Agent Router for an intelligent career upskilling platform.
Classify the user request into exactly ONE of the following routes:

1. SIMPLE: Quick question, conceptual explanation, simple definition, or basic query.
2. SKILL_ANALYSIS: Resume / profile analysis, skill extraction, proficiency estimation from evidence.
3. CAREER_ANALYSIS: Comparing a candidate's profile against a target role, finding role-specific gaps.
4. LEARNING_PLAN: Generating a structured learning roadmap or sequenced learning activities.
5. COMPLEX_AGENT: Multi-stage evaluation needing extraction, gap scoring, role benchmarking, and customized roadmap synthesis.

Return ONLY valid JSON matching this schema:
{
    "route": "SIMPLE" | "SKILL_ANALYSIS" | "CAREER_ANALYSIS" | "LEARNING_PLAN" | "COMPLEX_AGENT",
    "confidence": 0.0 to 1.0,
    "reasoning": "brief explanation"
}
"""


class AIAgentRouter:
    def __init__(self, service: Optional[LLMService] = None):
        self.llm = service or llm_service

    def route(self, user_input: str, context: Optional[Dict[str, Any]] = None) -> RouterDecision:
        """
        Determine the appropriate route for the user request.
        Uses deterministic heuristic rules first, with LLM fallback for ambiguous queries.
        """
        context = context or {}
        text = user_input.strip()
        lower = text.lower()

        # Deterministic classification rules
        # 1. Check for complete onboarding / multi-stage profile input
        has_resume = bool(context.get("resume_text") or "resume" in lower or len(text) > 250 or "experience" in lower)
        has_target_role = bool(context.get("target_role") or "target role" in lower or "want to become" in lower or "career goal" in lower)

        if has_resume and has_target_role:
            return RouterDecision(
                route=TaskRoute.COMPLEX_AGENT,
                confidence=0.95,
                reasoning="Request includes both candidate profile/resume and target career role for comprehensive analysis.",
                parameters={"has_resume": True, "has_target_role": True},
            )

        if any(kw in lower for kw in ["roadmap", "learning plan", "learning path", "curriculum", "schedule", "study plan"]):
            return RouterDecision(
                route=TaskRoute.LEARNING_PLAN,
                confidence=0.9,
                reasoning="Request explicitly asks for a structured learning roadmap or study plan.",
            )

        if any(kw in lower for kw in ["gap", "missing competencies", "transition to", "fit for", "ready for"]):
            return RouterDecision(
                route=TaskRoute.CAREER_ANALYSIS,
                confidence=0.88,
                reasoning="Request focuses on career alignment and missing competencies.",
            )

        if has_resume or any(kw in lower for kw in ["analyze my", "extract skills", "my skills", "proficiency", "evaluate my"]):
            return RouterDecision(
                route=TaskRoute.SKILL_ANALYSIS,
                confidence=0.9,
                reasoning="Request focuses on skill extraction and proficiency estimation.",
            )

        if len(text.split()) < 20 or any(kw in lower for kw in ["what is", "how do i", "explain", "quiz", "example", "help"]):
            return RouterDecision(
                route=TaskRoute.SIMPLE,
                confidence=0.9,
                reasoning="Short interactive question, concept explanation, or simple query.",
            )

        # If still ambiguous and LLM is available, query LLM router
        if self.llm.is_available():
            try:
                messages = [
                    {"role": "system", "content": ROUTER_PROMPT},
                    {"role": "user", "content": f"User Input:\n{text}\n\nContext:\n{context}"},
                ]
                decision = self.llm.generate_structured(messages, RouterDecision)
                return decision
            except LLMServiceError as e:
                logger.warning(f"LLM routing failed ({e}); defaulting to SKILL_ANALYSIS or SIMPLE.")

        # Default fallback
        if len(text) > 100:
            return RouterDecision(
                route=TaskRoute.SKILL_ANALYSIS,
                confidence=0.7,
                reasoning="Fallback route for descriptive text.",
            )
        return RouterDecision(
            route=TaskRoute.SIMPLE,
            confidence=0.7,
            reasoning="Fallback route for brief message.",
        )


router = AIAgentRouter()

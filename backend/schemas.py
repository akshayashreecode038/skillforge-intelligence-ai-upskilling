from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TaskRoute(str, Enum):
    SIMPLE = "SIMPLE"
    SKILL_ANALYSIS = "SKILL_ANALYSIS"
    CAREER_ANALYSIS = "CAREER_ANALYSIS"
    LEARNING_PLAN = "LEARNING_PLAN"
    COMPLEX_AGENT = "COMPLEX_AGENT"


class RouterDecision(BaseModel):
    route: TaskRoute
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    reasoning: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)


class ExtractedSkill(BaseModel):
    name: str
    source: str = "explicit"  # "explicit" | "inferred"
    evidence: str = ""
    confidence: str = "medium"  # "high" | "medium" | "low"


class ExtractedSkillList(BaseModel):
    """Wrapper for Stage 1: Skill Extraction LLM response."""
    skills: List[ExtractedSkill] = Field(default_factory=list)


class TargetCompetency(BaseModel):
    name: str
    required_level: int = Field(default=75, ge=0, le=100)
    importance: float = Field(default=0.8, ge=0.0, le=1.0)
    rationale: str = ""


class TargetCompetencyList(BaseModel):
    """Wrapper for Stage 2: Target Competency LLM response."""
    competencies: List[TargetCompetency] = Field(default_factory=list)


class SkillGapItem(BaseModel):
    name: str
    current_level: int = Field(default=0, ge=0, le=100)
    required_level: int = Field(default=0, ge=0, le=100)
    gap: int = 0
    priority: str = "medium"  # "high" | "medium" | "low"
    evidence: str = ""
    confidence: str = "medium"  # "high" | "medium" | "low"


class SkillAnalysisResponse(BaseModel):
    skills: List[SkillGapItem] = Field(default_factory=list)
    career_goal: str = ""
    summary: str = ""
    recommendations: List[str] = Field(default_factory=list)
    uncertainty_note: Optional[str] = None


class RecommendationResponse(BaseModel):
    next_topic: str
    skill: str
    reason: str
    difficulty: str = "intermediate"  # "beginner" | "intermediate" | "advanced"


class ChatReasoning(BaseModel):
    skill: str
    evidence: str
    action: str
    confidence: str


class ChatAgentReply(BaseModel):
    reply: str
    reasoning: Optional[ChatReasoning] = None


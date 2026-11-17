"""
Comprehensive Test Suite for Dynamic AI Skill Analysis & Upskilling Agent.

Verifies all requirements from prompt:
1. DevOps resume produces DevOps-related skills (Docker, Kubernetes, Terraform, Go).
2. UI/UX resume produces UI/UX-related skills (Figma, Design Systems, Wireframing).
3. CRITICAL CONTRAST TEST: Asserts two distinct users produce completely different detected skills.
4. User with insufficient information / handles uncertainty honestly without fabricating.
5. Multi-stage AI pipeline orchestration:
   - Stage 1: ExtractedSkill structured objects from candidate text.
   - Stage 2: TargetCompetency generated via LLM prompt, NOT a static dictionary.
   - Stage 3: Skill Gap Analysis receives structured outputs from Stages 1 & 2.
   - Stage 4: Recommendations reference actual detected gaps.
6. Fallback Rule: LLM failure does NOT produce fabricated role competencies; uncertainty is stated honestly.
7. Model Configuration: gpt-5-mini is the centralized default model, overrideable via env var.
8. Fallback extracts real user skills without any hardcoded role-skill maps.
9. Missing API key safety: graceful operation without crashing.
10. End-to-end /analyze API contract and DB persistence.
"""

import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

import models
from database import Base, engine, SessionLocal
from config import MODEL_CONFIG
from schemas import (
    TaskRoute,
    RouterDecision,
    ExtractedSkill,
    ExtractedSkillList,
    TargetCompetency,
    TargetCompetencyList,
    SkillGapItem,
    SkillAnalysisResponse,
)
from llm_service import LLMService, LLMServiceError
from router import AIAgentRouter
from skill_pipeline import (
    SkillAnalysisPipeline,
    normalize_skill_name,
    deduplicate_and_normalize_skills,
    _extract_skills_from_text_dynamically,
)
from ai import analyze_resume, get_chat_reply, get_recommendation
from main import app


class TestSkillAnalysisPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)
        cls.client = TestClient(app)

    def test_01_user_with_cloud_devops_skills(self):
        """DevOps resume produces DevOps-related skills."""
        resume = """
        Experienced systems engineer.
        Built automated deployment pipelines using Terraform and Docker.
        Managed production Kubernetes clusters on AWS with high availability.
        Proficient in Go for developing high-throughput microservices.
        """
        role = "Cloud Infrastructure Engineer"
        result = analyze_resume(resume, role)

        self.assertIn("skills", result)
        self.assertGreater(len(result["skills"]), 0)

        skill_names = [s["name"] for s in result["skills"]]
        detected_tech = [
            s for s in skill_names
            if any(k in s.lower() for k in ["docker", "terraform", "kubernetes", "go", "cloud", "aws"])
        ]
        self.assertGreater(len(detected_tech), 0, f"Expected DevOps/Cloud skills, got: {skill_names}")

        # Must NOT contain hard-coded unrelated default skills
        self.assertNotIn("Power BI", skill_names)
        self.assertNotIn("Power BI (basic dashboards)", skill_names)

    def test_02_user_with_design_ui_skills(self):
        """UI/UX resume produces UI/UX-related skills, not generic programming/data defaults."""
        resume = """
        Product designer with 3 years experience.
        Designed mobile interfaces and interactive prototypes in Figma.
        Conducted user research, usability testing, and wireframing for web apps.
        Expert in design systems, typography, and color theory.
        """
        role = "Senior Product Designer"
        result = analyze_resume(resume, role)

        skill_names = [s["name"] for s in result["skills"]]
        detected_design = [
            s for s in skill_names
            if any(k in s.lower() for k in ["figma", "design", "prototype", "wireframing", "typography", "user research"])
        ]
        self.assertGreater(len(detected_design), 0, f"Expected Design skills, got: {skill_names}")

        # Must NOT contain Python, SQL, or Power BI
        self.assertNotIn("Python", skill_names)
        self.assertNotIn("SQL", skill_names)
        self.assertNotIn("Power BI", skill_names)

    def test_03_critical_contrast_test(self):
        """
        CRITICAL CONTRAST TEST:
        Two users with completely different inputs must produce distinct detected skills.
        The test must fail if the system returns the same predefined skill list for both users.
        """
        user_devops_resume = "Built Kubernetes clusters, deployed Docker containers, and configured Terraform."
        user_devops_role = "DevOps Engineer"

        user_design_resume = "Designed user flows in Figma, created design systems, and performed usability testing."
        user_design_role = "UI/UX Designer"

        result_devops = analyze_resume(user_devops_resume, user_devops_role)
        result_design = analyze_resume(user_design_resume, user_design_role)

        skills_devops = set(s["name"].lower() for s in result_devops["skills"])
        skills_design = set(s["name"].lower() for s in result_design["skills"])

        # They must NOT be identical
        self.assertNotEqual(
            skills_devops,
            skills_design,
            f"Predefined list detected! Both users received identical skills: {skills_devops}"
        )

        # DevOps should have container/infra concepts, not Figma
        self.assertTrue(any("k8s" in s or "kubern" in s or "docker" in s or "terraform" in s for s in skills_devops))
        self.assertFalse(any("figma" in s for s in skills_devops))

        # Design should have design concepts, not Kubernetes
        self.assertTrue(any("figma" in s or "design" in s or "usability" in s for s in skills_design))
        self.assertFalse(any("k8s" in s or "kubern" in s or "docker" in s or "terraform" in s for s in skills_design))

    def test_04_insufficient_information_handling(self):
        """User with minimal or empty text is handled honestly with uncertainty note, without fabrication."""
        empty_resume = ""
        role = "Data Scientist"

        result = analyze_resume(empty_resume, role)

        self.assertIn("skills", result)
        self.assertEqual(len(result["skills"]), 0, "Should not fabricate skills for empty input")
        self.assertTrue(
            result.get("uncertainty_note") is not None
            or "insufficient" in result.get("summary", "").lower(),
            "Must report uncertainty when candidate text is empty"
        )

    def test_05_multi_stage_ai_pipeline_orchestration(self):
        """
        Verify the multi-stage AI pipeline:
        Stage 1: Skill Extraction produces ExtractedSkill objects from input.
        Stage 2: Target Competency Analysis calls LLM dynamically for the specific role without a static dict.
        Stage 3: Gap Analysis receives structured extracted skills + structured competencies.
        Stage 4: Recommendations reference actual gaps.
        """
        mock_llm = MagicMock(spec=LLMService)
        mock_llm.is_available.return_value = True

        # Mock Stage 1: Extraction
        stage1_output = ExtractedSkillList(skills=[
            ExtractedSkill(name="Solidity", source="explicit", evidence="Wrote smart contracts in Solidity", confidence="high"),
            ExtractedSkill(name="Hardhat", source="explicit", evidence="Deployed via Hardhat", confidence="medium"),
        ])

        # Mock Stage 2: Target Competencies generated dynamically for "Smart Contract Auditor"
        stage2_output = TargetCompetencyList(competencies=[
            TargetCompetency(name="Solidity Security Patterns", required_level=90, importance=0.95, rationale="Essential for auditing"),
            TargetCompetency(name="EVM Architecture", required_level=85, importance=0.9, rationale="Understanding opcode execution"),
            TargetCompetency(name="Automated Vulnerability Analysis", required_level=80, importance=0.85, rationale="Static analysis tools like Slither"),
        ])

        # Mock Stage 3: Gap Analysis response
        stage3_output = SkillAnalysisResponse(
            skills=[
                SkillGapItem(name="Solidity", current_level=70, required_level=90, gap=20, priority="medium", evidence="Wrote smart contracts in Solidity", confidence="high"),
                SkillGapItem(name="EVM Architecture", current_level=20, required_level=85, gap=65, priority="high", evidence="Minimal evidence of low-level EVM internals", confidence="low"),
                SkillGapItem(name="Automated Vulnerability Analysis", current_level=15, required_level=80, gap=65, priority="high", evidence="No automated tooling mentioned", confidence="low"),
            ],
            career_goal="Smart Contract Auditor",
            summary="Strong foundational Solidity development skills. High-priority gaps in EVM Architecture and Automated Vulnerability Analysis.",
            recommendations=[
                "Deep dive into EVM Architecture opcodes and gas optimization.",
                "Practice using Slither and Mythril for automated vulnerability analysis.",
            ],
        )

        def mock_generate_structured(messages, schema):
            if schema == ExtractedSkillList:
                return stage1_output
            elif schema == TargetCompetencyList:
                # Assert Stage 2 prompt contains the dynamic target role
                user_msg = messages[-1]["content"]
                self.assertIn("Smart Contract Auditor", user_msg)
                return stage2_output
            elif schema == SkillAnalysisResponse:
                # Assert Stage 3 receives structured Stage 1 and Stage 2 outputs, not raw unparsed text
                user_msg = messages[-1]["content"]
                self.assertIn("Solidity", user_msg)
                self.assertIn("EVM Architecture", user_msg)
                return stage3_output
            raise ValueError(f"Unexpected schema: {schema}")

        mock_llm.generate_structured.side_effect = mock_generate_structured

        pipeline = SkillAnalysisPipeline(service=mock_llm)
        result = pipeline.analyze(
            "Experienced blockchain dev. Wrote smart contracts in Solidity and deployed via Hardhat.",
            "Smart Contract Auditor"
        )

        self.assertIsInstance(result, SkillAnalysisResponse)
        self.assertEqual(len(result.skills), 3)
        self.assertEqual(result.career_goal, "Smart Contract Auditor")

        # Recommendations reference the detected gaps
        rec_text = " ".join(result.recommendations)
        self.assertIn("EVM", rec_text)
        self.assertIn("vulnerability", rec_text.lower())

    def test_06_llm_failure_does_not_fabricate_role_competencies(self):
        """
        Fallback Rule: When the LLM is unavailable, NEVER fabricate target competencies
        from a static role dictionary (e.g. no Data Analyst -> SQL + Python + Stats).
        Instead, report uncertainty honestly and extract only candidate-evidenced skills.
        """
        mock_llm = MagicMock(spec=LLMService)
        mock_llm.is_available.return_value = False

        pipeline = SkillAnalysisPipeline(service=mock_llm)
        resume = "Worked with Rust and WebAssembly building browser audio synthesizers."
        role = "Audio DSP Engineer"

        result = pipeline.analyze(resume, role)

        self.assertIsInstance(result, SkillAnalysisResponse)
        skill_names = [s.name.lower() for s in result.skills]

        # Candidate skills are extracted from real text
        self.assertTrue(any("rust" in s or "webassembly" in s or "audio" in s for s in skill_names))

        # No fabricated competencies for "Audio DSP Engineer" from a static dictionary
        self.assertTrue(
            result.uncertainty_note is not None and "offline" in result.uncertainty_note.lower(),
            f"Expected uncertainty note explaining AI service status, got: {result.uncertainty_note}"
        )

        # Gaps are not arbitrarily fabricated when LLM is unavailable
        for s in result.skills:
            self.assertEqual(s.required_level, 0, "Target levels should not be fabricated without LLM")

    def test_07_gpt_5_mini_default_model_configuration(self):
        """Enforce gpt-5-mini as the default model in centralized MODEL_CONFIG."""
        self.assertEqual(MODEL_CONFIG["default"], "gpt-5-mini")
        self.assertEqual(MODEL_CONFIG["fallback"], "gpt-5-mini")
        self.assertIn("temperature_default", MODEL_CONFIG)
        self.assertIn("max_tokens_default", MODEL_CONFIG)

    def test_08_fallback_behavior_no_hardcoded_skills(self):
        """When LLM raises 429 quota exhausted, fallback extracts real candidate skills without hardcoded defaults."""
        mock_llm = MagicMock(spec=LLMService)
        mock_llm.is_available.return_value = True
        mock_llm.generate_structured.side_effect = LLMServiceError("Quota exhausted", error_type="rate_limit", status_code=429)

        pipeline = SkillAnalysisPipeline(service=mock_llm)

        resume = "I have 2 years of experience developing iOS apps in Swift and SwiftUI. Published 3 apps to App Store."
        role = "iOS Engineer"

        result = pipeline.analyze(resume, role)

        self.assertIsInstance(result, SkillAnalysisResponse)
        skill_names = [s.name for s in result.skills]

        # Must have extracted Swift / SwiftUI from actual text
        detected_ios = [s for s in skill_names if "swift" in s.lower() or "ios" in s.lower()]
        self.assertGreater(len(detected_ios), 0, f"Expected Swift/iOS skills, got: {skill_names}")

        # Must NEVER return old hard-coded skills
        self.assertNotIn("Power BI", skill_names)
        self.assertNotIn("SQL", skill_names)

    def test_09_missing_api_key_safety(self):
        """When API key is empty, pipeline does not crash and operates gracefully."""
        mock_llm = LLMService(api_key="")
        self.assertFalse(mock_llm.is_available())

        pipeline = SkillAnalysisPipeline(service=mock_llm)
        result = pipeline.analyze(
            "Experienced in Rust backend systems and Tokio async networking.",
            "Rust Systems Developer"
        )
        self.assertIsInstance(result, SkillAnalysisResponse)
        skill_names = [s.name.lower() for s in result.skills]
        self.assertTrue(any("rust" in s or "system" in s for s in skill_names))

    def test_10_end_to_end_analyze_api_contract_and_db(self):
        """Test POST /analyze API endpoint returns contract-compliant JSON and persists to DB."""
        payload = {
            "name": "Jordan Lee",
            "target_role": "Mobile Developer",
            "resume_text": "Built Flutter cross-platform applications and integrated REST APIs with Dart."
        }

        response = self.client.post("/analyze", json=payload)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertIn("user_id", data)
        self.assertEqual(data["name"], "Jordan Lee")
        self.assertEqual(data["target_role"], "Mobile Developer")
        self.assertIn("skills", data)
        self.assertIsInstance(data["skills"], list)
        self.assertGreater(len(data["skills"]), 0)

        # Verify contract fields on each skill
        for skill in data["skills"]:
            self.assertIn("name", skill)
            self.assertIn("current_level", skill)
            self.assertIn("required_level", skill)
            self.assertIn("gap", skill)
            self.assertIsInstance(skill["current_level"], (int, float))
            self.assertIsInstance(skill["required_level"], (int, float))
            self.assertIsInstance(skill["gap"], (int, float))

        # Check DB persistence
        db = SessionLocal()
        try:
            saved_user = db.query(models.User).filter(models.User.id == data["user_id"]).first()
            self.assertIsNotNone(saved_user)
            self.assertEqual(saved_user.name, "Jordan Lee")

            saved_skills = db.query(models.UserSkill).filter(models.UserSkill.user_id == data["user_id"]).all()
            self.assertGreater(len(saved_skills), 0)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
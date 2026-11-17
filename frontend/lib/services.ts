import {
  currentUser as initialUser,
  jobRoles,
  allSkills,
  skillProfile as initialSkillProfile,
  learningModules as initialModules,
  assessments as initialAssessments,
  projects as initialProjects,
  learningProgress as initialProgress,
  aiMessages as initialMessages,
  recommendations as initialRecommendations,
  skillGapData as initialSkillGapData,
  getTargetRole,
} from './mock-data';

import { api, getStoredUserId, setStoredUserId } from './api';
import type { AnalyzeRequest, AnalyzeResponse } from './api';

import type {
  User,
  JobRole,
  Skill,
  SkillProfile,
  LearningModule,
  Assessment,
  Project,
  LearningProgress,
  AIMessage,
  Recommendation,
  LearningMemory,
  ProjectEvaluationResult,
  AIReasoning,
} from './types';

// Storage keys for persistent demo state
const STORAGE_KEYS = {
  USER: 'skillforge_user',
  SKILL_PROFILE: 'skillforge_skill_profile',
  ROADMAP: 'skillforge_roadmap',
  PROGRESS: 'skillforge_progress',
  MESSAGES: 'skillforge_messages',
  MEMORY: 'skillforge_memory',
  PROJECTS: 'skillforge_projects',
};

// Initial learning memory structure
const initialLearningMemory: LearningMemory = {
  completedTopics: [
    'Python Foundations',
    'SQL Fundamentals',
    'Basic SELECT, WHERE & Aggregations',
    'SQL Joins (Targeted review)',
  ],
  strongConcepts: [
    'Data Filtering & Sorting',
    'GROUP BY & HAVING clauses',
    'Python data structures & functions',
  ],
  weakConcepts: [
    'Probability Distributions & Hypothesis Testing',
    'Window Functions: PARTITION BY vs GROUP BY',
    'Business reasoning & executive summary writing',
  ],
  learningPreferences: {
    style: 'practical',
    sessionLengthMinutes: 30,
    challengeFrequency: 'balanced',
  },
  lastSession: {
    topic: 'SQL Window Functions',
    moduleId: 'mod-sql-window',
    timestamp: '2025-09-18T09:30:00Z',
    progressPercentage: 64,
  },
  currentRoadmapPosition: 'Module 4 of 7 (SQL Window Functions)',
  contextSummary: [
    'Completed SQL and Python fundamentals with top-quartile assessment score',
    'Assessment #2 identified minor join gap, resolved in targeted practice',
    'Actively practicing: OVER (PARTITION BY ... ORDER BY ...)',
    'Next planned milestone: Statistics for Data Analysis (Priority Gap)',
  ],
};

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('skillforge_state_updated'));
  } catch (e) {
    console.warn(`Error writing ${key} to storage:`, e);
  }
}

/**
 * Service API Abstraction Layer
 * Cleanly decouples UI from storage; can be switched to FastAPI backend endpoints.
 */

export async function getUserProfile(): Promise<User> {
  // Simulate network latency if desired
  return getFromStorage<User>(STORAGE_KEYS.USER, initialUser);
}

export async function updateUserProfile(updates: Partial<User>): Promise<User> {
  const current = await getUserProfile();
  const updated = { ...current, ...updates };
  saveToStorage(STORAGE_KEYS.USER, updated);
  return updated;
}

export async function getSkillProfile(): Promise<SkillProfile> {
  return getFromStorage<SkillProfile>(STORAGE_KEYS.SKILL_PROFILE, initialSkillProfile);
}

export async function updateSkillProfile(
  skillId: string,
  newLevel: number,
  evidenceText?: string
): Promise<SkillProfile> {
  const profile = await getSkillProfile();
  const updatedSkills = profile.skills.map((s) => {
    if (s.skillId === skillId) {
      const currentLevel = Math.min(100, Math.max(0, newLevel));
      const gap = Math.max(0, s.targetLevel - currentLevel);
      const newEvidence = evidenceText
        ? [
            {
              type: 'project' as const,
              description: evidenceText,
              date: new Date().toISOString(),
            },
            ...s.evidence,
          ]
        : s.evidence;
      return {
        ...s,
        currentLevel,
        gap,
        lastAssessed: new Date().toISOString(),
        evidence: newEvidence,
      };
    }
    return s;
  });

  // Recompute overall alignment
  const totalTarget = updatedSkills.reduce((acc, s) => acc + s.targetLevel, 0);
  const totalCurrent = updatedSkills.reduce((acc, s) => acc + Math.min(s.currentLevel, s.targetLevel), 0);
  const overallAlignment = Math.round((totalCurrent / totalTarget) * 100);

  const updatedProfile: SkillProfile = {
    ...profile,
    overallAlignment,
    skills: updatedSkills,
    lastUpdated: new Date().toISOString(),
  };

  saveToStorage(STORAGE_KEYS.SKILL_PROFILE, updatedProfile);
  return updatedProfile;
}

export async function getSkillGaps(): Promise<
  { skill: string; skillId: string; current: number; target: number; gap: number; category: string }[]
> {
  const profile = await getSkillProfile();
  return profile.skills.map((s) => ({
    skill: s.skillName,
    skillId: s.skillId,
    current: s.currentLevel,
    target: s.targetLevel,
    gap: s.gap,
    category: s.proficiency,
  }));
}

export async function getLearningRoadmap(): Promise<LearningModule[]> {
  return getFromStorage<LearningModule[]>(STORAGE_KEYS.ROADMAP, initialModules);
}

export async function updateModuleProgress(
  moduleId: string,
  progress: number,
  status?: 'not-started' | 'in-progress' | 'completed'
): Promise<LearningModule[]> {
  const modules = await getLearningRoadmap();
  const updated = modules.map((m) => {
    if (m.id === moduleId) {
      const newStatus = status ?? (progress >= 100 ? 'completed' : 'in-progress');
      return { ...m, progress, status: newStatus };
    }
    return m;
  });
  saveToStorage(STORAGE_KEYS.ROADMAP, updated);

  // Update memory last session
  const targetModule = updated.find((m) => m.id === moduleId);
  if (targetModule) {
    const memory = await getLearningMemory();
    memory.lastSession = {
      topic: targetModule.title,
      moduleId: targetModule.id,
      timestamp: new Date().toISOString(),
      progressPercentage: progress,
    };
    if (progress >= 100 && !memory.completedTopics.includes(targetModule.title)) {
      memory.completedTopics.push(targetModule.title);
    }
    saveToStorage(STORAGE_KEYS.MEMORY, memory);
  }

  return updated;
}

export async function getLearningProgress(): Promise<LearningProgress> {
  return getFromStorage<LearningProgress>(STORAGE_KEYS.PROGRESS, initialProgress);
}

export async function getProjects(): Promise<Project[]> {
  return getFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, initialProjects);
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.id === id);
}

export async function submitProject(
  projectId: string,
  submission: {
    code: string;
    explanation: string;
    datasetQuery?: string;
  }
): Promise<ProjectEvaluationResult> {
  // Realistic simulated evaluation based on submission content
  const isGoodLength = submission.code.length > 50 && submission.explanation.length > 30;

  const result: ProjectEvaluationResult = {
    projectId,
    overallScore: isGoodLength ? 84 : 68,
    skillScores: [
      {
        skillId: 'skill-sql',
        skillName: 'SQL Analysis & Aggregation',
        score: isGoodLength ? 88 : 72,
        feedback: 'Effective utilization of window functions and joins to aggregate metrics across dimensions.',
      },
      {
        skillId: 'skill-viz',
        skillName: 'Data Cleaning & Structuring',
        score: isGoodLength ? 82 : 70,
        feedback: 'Correctly handled null timestamps and filtered out abnormal refund anomalies.',
      },
      {
        skillId: 'skill-biz',
        skillName: 'Business Interpretation',
        score: isGoodLength ? 76 : 58,
        feedback: 'Solid conclusions drawn, though actionable executive recommendations could be clearer.',
      },
    ],
    strengths: [
      'Clean query formatting with idiomatic window function syntax',
      'Accurate conversion rate calculations and cohort grouping',
      'Realistic handling of edge cases in sample dataset',
    ],
    areasToImprove: [
      'Synthesizing raw statistical output into C-suite recommendations',
      'Include sensitivity/confidence intervals when calculating return rates',
    ],
    recommendedNextStep: 'Practice turning analytical results into executive-ready business recommendations.',
    skillProfileUpdated: true,
  };

  // Automatically update SQL and Business Analysis skills in skill profile
  await updateSkillProfile('skill-sql', 85, 'E-Commerce Sales Analysis Capstone: 88% Score');
  await updateSkillProfile('skill-biz', 62, 'E-Commerce Sales Analysis: Business interpretation evaluated');

  // Update memory
  const memory = await getLearningMemory();
  memory.contextSummary.unshift('Submitted and evaluated practical project: E-commerce Sales Analysis (84% overall score)');
  memory.strongConcepts.push('SQL Cohort Analysis');
  saveToStorage(STORAGE_KEYS.MEMORY, memory);

  return result;
}

export async function getAssessment(id?: string): Promise<Assessment> {
  const targetId = id ?? 'assess-da-foundations';
  const found = initialAssessments.find((a) => a.id === targetId);
  return found ?? initialAssessments[0];
}

export async function getLearningMemory(): Promise<LearningMemory> {
  return getFromStorage<LearningMemory>(STORAGE_KEYS.MEMORY, initialLearningMemory);
}

export async function updateLearningMemory(updates: Partial<LearningMemory>): Promise<LearningMemory> {
  const current = await getLearningMemory();
  const updated = { ...current, ...updates };
  saveToStorage(STORAGE_KEYS.MEMORY, updated);
  return updated;
}

export async function getChatMessages(): Promise<AIMessage[]> {
  return getFromStorage<AIMessage[]>(STORAGE_KEYS.MESSAGES, initialMessages);
}

export async function sendAgentMessage(
  userText: string,
  context?: { currentTopic?: string; skillId?: string }
): Promise<{ reply: AIMessage; reasoning?: AIReasoning }> {
  const history = await getChatMessages();

  const userMsg: AIMessage = {
    id: `msg-${Date.now()}`,
    role: 'user',
    content: userText,
    timestamp: new Date().toISOString(),
  };

  // Save the user message immediately
  const historyWithUser = [...history, userMsg];
  saveToStorage(STORAGE_KEYS.MESSAGES, historyWithUser);

  let replyContent = '';
  let reasoning: AIReasoning | undefined = undefined;

  try {
    // Build context for the backend
    const userId = getStoredUserId();
    const backendContext: Record<string, unknown> = {};
    if (context?.currentTopic) backendContext['current_topic'] = context.currentTopic;

    const result = await api.chat({
      message: userText,
      user_id: userId ?? undefined,
      context: backendContext,
    });

    replyContent = result.reply;
    if (result.reasoning) {
      reasoning = {
        skill: result.reasoning.skill,
        evidence: result.reasoning.evidence,
        action: result.reasoning.action,
        confidence: result.reasoning.confidence,
      };
    }
  } catch (err) {
    // Graceful fallback if backend is offline
    console.warn('Backend unavailable, using fallback response:', err);
    replyContent =
      "I'm having trouble connecting to the server right now. Please make sure the backend is running (`uvicorn main:app --reload` in the backend folder) and try again.";
    reasoning = {
      skill: 'Connection',
      evidence: 'Backend unreachable',
      action: 'Start the backend server',
      confidence: 'N/A',
    };
  }

  const aiMsg: AIMessage = {
    id: `msg-${Date.now() + 1}`,
    role: 'ai',
    content: replyContent,
    timestamp: new Date().toISOString(),
    metadata: {
      action: reasoning ? 'reasoning_provided' : undefined,
    },
  };

  const updatedMessages = [...historyWithUser, aiMsg];
  saveToStorage(STORAGE_KEYS.MESSAGES, updatedMessages);

  return { reply: aiMsg, reasoning };
}

/**
 * Submit the onboarding form to the backend for AI-powered skill analysis.
 * Saves the returned user_id to localStorage for subsequent API calls.
 * Converts the backend response into a SkillProfile and persists it so that
 * all skill-display pages (skills/, skill-gap/, assessment-results/) show
 * real backend data rather than mock data.
 */
export async function analyzeProfile(
  name: string,
  targetRole: string,
  resumeText: string
): Promise<AnalyzeResponse> {
  const result = await api.analyze({ name, target_role: targetRole, resume_text: resumeText });

  // Persist the user_id so chat and recommend endpoints can use it
  setStoredUserId(result.user_id);

  // Persist user profile from backend
  const backendUser: Partial<User> = {
    id: String(result.user_id),
    name: result.name,
    targetRoleId: result.target_role,
  };
  const currentStored = getFromStorage<User>(STORAGE_KEYS.USER, initialUser);
  saveToStorage(STORAGE_KEYS.USER, { ...currentStored, ...backendUser });

  // Convert the backend AnalyzeResponse skills into a SkillProfile and persist it.
  // This ensures the skills/, skill-gap/, and assessment-results/ pages display
  // the real AI-generated analysis rather than mock data.
  if (result.skills && result.skills.length > 0) {
    const now = new Date().toISOString();
    const backendSkills = result.skills.map((s, i) => ({
      skillId: `backend-skill-${i}`,
      skillName: s.name,
      currentLevel: s.current_level,
      targetLevel: s.required_level,
      proficiency: (
        s.current_level >= 80 ? 'advanced' :
        s.current_level >= 60 ? 'intermediate' :
        'beginner'
      ) as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      confidence: (s.confidence === 'high' || s.confidence === 'low' ? s.confidence : 'medium') as 'low' | 'medium' | 'high',
      gap: s.gap,
      lastAssessed: now,
      evidence: [
        {
          type: 'resume' as const,
          description: s.evidence || 'Extracted from provided profile',
          date: now.slice(0, 10),
        },
      ],
    }));

    const totalTarget = backendSkills.reduce((acc, s) => acc + s.targetLevel, 0);
    const totalCurrent = backendSkills.reduce(
      (acc, s) => acc + Math.min(s.currentLevel, s.targetLevel),
      0
    );
    const overallAlignment = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;

    const backendProfile: SkillProfile = {
      userId: String(result.user_id),
      targetRoleId: result.target_role,
      overallAlignment,
      skills: backendSkills,
      lastUpdated: now,
    };
    saveToStorage(STORAGE_KEYS.SKILL_PROFILE, backendProfile);
  }

  return result;
}

export async function resetDemoState(): Promise<void> {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.USER);
  window.localStorage.removeItem(STORAGE_KEYS.SKILL_PROFILE);
  window.localStorage.removeItem(STORAGE_KEYS.ROADMAP);
  window.localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  window.localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  window.localStorage.removeItem(STORAGE_KEYS.MEMORY);
  window.localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  window.dispatchEvent(new Event('skillforge_state_updated'));
}

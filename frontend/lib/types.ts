export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type SkillCategory =
  | 'programming'
  | 'data'
  | 'ml'
  | 'web'
  | 'statistics'
  | 'business'
  | 'cloud'
  | 'tools';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  education: string;
  experienceLevel: ProficiencyLevel;
  currentOccupation: string;
  targetRoleId: string;
  createdAt: string;
  streak: number;
  weeklyGoalMinutes: number;
  weeklyMinutesSpent: number;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon?: string;
}

export interface SkillAssessment {
  skillId: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  proficiency: ProficiencyLevel;
  confidence: 'low' | 'medium' | 'high';
  gap: number;
  lastAssessed: string;
  evidence: SkillEvidence[];
}

export interface SkillEvidence {
  type: 'assessment' | 'resume' | 'project' | 'practice';
  description: string;
  date: string;
}

export interface SkillProfile {
  userId: string;
  targetRoleId: string;
  overallAlignment: number;
  skills: SkillAssessment[];
  lastUpdated: string;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  icon: string;
  requiredSkills: { skillId: string; targetLevel: number }[];
  color: string;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  skillId: string;
  skillName: string;
  difficulty: ProficiencyLevel;
  estimatedMinutes: number;
  lessons: Lesson[];
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed';
  prerequisites: string[];
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'reading' | 'interactive' | 'practice';
  completed: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  skillId: string;
  skillName: string;
  totalQuestions: number;
  difficulty: ProficiencyLevel;
  adaptive: boolean;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'scenario';
  options: { id: string; text: string; correct: boolean }[];
  difficulty: ProficiencyLevel;
  explanation?: string;
  topic: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  skillIds: string[];
  difficulty: ProficiencyLevel;
  estimatedHours: number;
  status: 'not-started' | 'in-progress' | 'submitted' | 'reviewed';
  progress: number;
  deliverables: string[];
  skillsPracticed: string[];
}

export interface LearningProgress {
  weeklyTime: number;
  weeklyGoal: number;
  topicsCompleted: number;
  assessmentsCompleted: number;
  projectsCompleted: number;
  streakDays: number;
  recentActivity: ActivityItem[];
  dailyMinutes: { day: string; minutes: number }[];
}

export interface ActivityItem {
  id: string;
  type: 'lesson' | 'assessment' | 'project' | 'skill-update';
  description: string;
  timestamp: string;
  skillId?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  metadata?: {
    moduleRef?: string;
    skillRef?: string;
    action?: string;
  };
}

export interface Recommendation {
  id: string;
  type: 'module' | 'practice' | 'assessment' | 'project';
  title: string;
  description: string;
  skillId: string;
  skillName: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface LearningMemory {
  completedTopics: string[];
  strongConcepts: string[];
  weakConcepts: string[];
  learningPreferences: {
    style: 'practical' | 'visual' | 'conceptual' | 'mixed';
    sessionLengthMinutes: number;
    challengeFrequency: 'balanced' | 'frequent' | 'gradual';
  };
  lastSession: {
    topic: string;
    moduleId: string;
    timestamp: string;
    progressPercentage: number;
  };
  currentRoadmapPosition: string;
  contextSummary: string[];
}

export interface ProjectEvaluationResult {
  projectId: string;
  overallScore: number;
  skillScores: {
    skillId: string;
    skillName: string;
    score: number;
    feedback: string;
  }[];
  strengths: string[];
  areasToImprove: string[];
  recommendedNextStep: string;
  skillProfileUpdated: boolean;
}

export interface AIReasoning {
  skill: string;
  evidence: string;
  action: string;
  confidence: string;
}


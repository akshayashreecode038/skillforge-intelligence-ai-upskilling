/**
 * Thin HTTP client for the SkillForge FastAPI backend.
 * All backend calls go through this module so the base URL is one place.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    let detail: string | undefined;
    try {
      const body = await res.json();
      detail = body?.detail ?? JSON.stringify(body);
    } catch {
      detail = await res.text();
    }
    throw new ApiError(
      `Backend error: ${res.status} ${res.statusText}`,
      res.status,
      detail
    );
  }

  return res.json() as Promise<T>;
}

// ── Typed helpers ─────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  name: string;
  target_role: string;
  resume_text: string;
}

export interface SkillResult {
  name: string;
  current_level: number;
  required_level: number;
  gap: number;
  priority?: 'high' | 'medium' | 'low' | string;
  evidence?: string;
  confidence?: 'high' | 'medium' | 'low' | string;
}

export interface AnalyzeResponse {
  user_id: number;
  name: string;
  target_role: string;
  skills: SkillResult[];
}

export interface BackendProfile {
  user_id: number;
  name: string;
  target_role: string;
  resume_text: string;
  skills: SkillResult[];
}

export interface ChatRequest {
  message: string;
  user_id?: number;
  context?: Record<string, unknown>;
}

export interface ChatResponse {
  reply: string;
  reasoning?: {
    skill: string;
    evidence: string;
    action: string;
    confidence: string;
  };
}

export interface RecommendResponse {
  next_topic: string;
  skill: string;
  reason: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ── API functions ─────────────────────────────────────────────────────────────

export const api = {
  /** POST /analyze — AI resume analysis, saves user to DB, returns skill gaps */
  analyze(body: AnalyzeRequest) {
    return apiFetch<AnalyzeResponse>('/analyze', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** GET /profile/:id — fetch saved user + skills from DB */
  getProfile(userId: number) {
    return apiFetch<BackendProfile>(`/profile/${userId}`);
  },

  /** POST /chat — send a message to the AI learning agent */
  chat(body: ChatRequest) {
    return apiFetch<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  /** POST /recommend — get AI-powered next learning topic */
  recommend(userId: number) {
    return apiFetch<RecommendResponse>('/recommend', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  /** GET /progress/:id — fetch learning progress */
  getProgress(userId: number) {
    return apiFetch<{ user_id: number; progress: unknown[] }>(
      `/progress/${userId}`
    );
  },

  /** POST /progress — save a learning progress item */
  saveProgress(body: {
    user_id: number;
    skill_name: string;
    topic: string;
    status: string;
    score?: number;
  }) {
    return apiFetch('/progress', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

/** Persisted user_id for the current session (stored in localStorage) */
export const USER_ID_KEY = 'skillforge_backend_user_id';

export function getStoredUserId(): number | null {
  if (typeof window === 'undefined') return null;
  const v = window.localStorage.getItem(USER_ID_KEY);
  return v ? parseInt(v, 10) : null;
}

export function setStoredUserId(id: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(USER_ID_KEY, String(id));
}

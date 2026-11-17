/**
 * LLM Service - Connects with Gemini API or falls back to local intelligent engine
 * Ensures strict conformity with Master System Prompt.
 */

class LLMService {
  constructor() {
    this.apiKey = localStorage.getItem('upskilling_gemini_api_key') || "";
    this.modelName = "gemini-2.5-flash";
    this.systemPrompt = `
# MASTER SYSTEM PROMPT
You are an AI-powered Personalized Upskilling Agent whose purpose is to understand a learner's existing capabilities, identify the gap between their current skills and the requirements of their desired career role, and continuously guide them through a personalized learning journey.
Maintain an evolving understanding of the learner:
"What does this learner already know, what do they actually know how to do, what are they missing, and what should they learn or practice next?"
Rules:
- Never teach what the learner has already demonstrated they can do.
- Never treat resume claims as verified mastery.
- Scale proficiency 0 to 5.
- Return natural, encouraging, direct, evidence-based mentor responses.
- When generating structured JSON telemetry, include message, skill_updates, identified_gaps, and recommended_next_step.
`;
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : "";
    localStorage.setItem('upskilling_gemini_api_key', this.apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }

  hasApiKey() {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  async sendQuery(userMessage, currentProfile, agentCore) {
    // If user provided a Gemini API Key, try live Gemini API
    if (this.hasApiKey()) {
      try {
        const response = await this.callGeminiApi(userMessage, currentProfile);
        return response;
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local expert engine:", err);
        // Fall through to local simulation
      }
    }

    // Local deterministic high-fidelity intelligence
    const telemetry = agentCore.generateAgentResponse(userMessage);
    return telemetry;
  }

  async callGeminiApi(userMessage, currentProfile) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const payload = {
      system_instruction: {
        parts: [{ text: this.systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Current Learner Profile JSON:\n${JSON.stringify(currentProfile, null, 2)}\n\nLearner Query:\n"${userMessage}"\n\nPlease respond as the AI Upskilling Mentor. Provide your direct conversational response and also return a structured JSON block if recommending skill updates or next actions.`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // Parse JSON block if present
    let parsedJson = null;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*"recommended_next_step"[\s\S]*\}/);
      if (jsonMatch) {
        parsedJson = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Non-fatal if pure markdown text
    }

    return {
      message: rawText.replace(/```json[\s\S]*?```/g, "").trim(),
      raw: rawText,
      structured: parsedJson,
      isLiveGemini: true
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LLMService };
} else {
  window.LLMService = LLMService;
}

# AI-Powered Personalized Upskilling & Skill-Gap Learning Agent

An intelligent, continuous learning platform and autonomous AI agent designed strictly in accordance with the **Master System Prompt** for personalized upskilling.

The agent continuously maintains an evolving understanding of the learner to answer:
> **"What does this learner already know, what do they actually know how to do, what are they missing, and what should they learn or practice next?"**

---

## 🌟 Core Architectural Features

1. **Evolving Personalized Skill Profile (Section 2 & 5)**
   - Proficiency scored on a strict 0–5 scale:
     - `0: Unknown`
     - `1: Beginner`
     - `2: Basic`
     - `3: Intermediate`
     - `4: Advanced`
     - `5: Professional`
   - Multi-source evidence tracking (`evidence: []`) paired with statistical confidence scores (`confidence: 0.0 to 1.0`).
   - Strong and weak concept indexing without artificial certainty.

2. **Resume & Background Analyzer (Section 3)**
   - Parses pasted CVs, resumes, or project summaries.
   - Extracts claimed technologies and domains without assuming mastery (`"claims exposure (unverified)"`).

3. **Role Competency Mapping & Gap Identification (Section 4 & 8)**
   - Pre-configured benchmarks for **Data Analyst**, **AI / Machine Learning Engineer**, **Full-Stack Developer**, and **Cloud & DevOps Engineer**.
   - Priority ranking computed using:
     $$\text{Priority} = \text{Gap Size} \times \text{Role Importance} \times \text{Prerequisite Importance}$$
   - Multi-dependency foundational skills (e.g. Python, SQL) are weighted to ensure solid prerequisites.

4. **Adaptive Diagnostic Arena (Section 6 & 7)**
   - Questions across **Conceptual**, **Scenario-Based**, **Practical Application**, and **Debugging / Error Analysis**.
   - Live difficulty adaptation:
     - Correct answer: elevates difficulty to test deeper practical capability.
     - Incorrect answer: identifies the root concept, provides remedial explanations, steps down difficulty temporarily, and schedules spaced revision.

5. **Non-Linear Personalized Roadmap (Section 9)**
   - Graph-based topological milestone sequencing derived from verified gaps and prerequisites. No generic linear curriculums.

6. **Level-Adapted Learning & Spaced Revision (Section 10, 12, 21)**
   - Explanations tailored to learner proficiency:
     - *Beginner:* Simple analogies, step-by-step guidance.
     - *Intermediate:* Real-world schemas, windowing, applied scripting.
     - *Advanced:* Cost-based optimization, indexing, edge cases.
   - 8-Step modular teaching pattern with dedicated spaced revision alerts.

7. **Project Studio & Rubric Evaluator (Section 13, 14, 15)**
   - Role-specific scenarios with multi-criteria AI rubric evaluation across 5 dimensions:
     - Correctness
     - Technical implementation
     - Problem-solving
     - Efficiency
     - Real-world applicability

8. **Context-Aware AI Mentor & Telemetry (Section 11, 23, 24, 26)**
   - Real-time conversational agent maintaining session continuity.
   - Emits human-friendly mentoring alongside machine-readable JSON telemetry (`message`, `skill_updates`, `identified_gaps`, `recommended_next_step`).
   - Supports Gemini 2.5 Flash via optional API key, with a high-fidelity deterministic offline engine out of the box.

---

## 🚀 How to Run the Application

### Option A: Web Platform (Interactive Dashboard)
You can open `index.html` directly in any modern browser, or run a lightweight local HTTP server:

```powershell
# In PowerShell:
cd "c:\Users\Neha Manoo\.gemini\antigravity\upskilling-ai-agent"
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

### Option B: Terminal CLI Mode
To run the terminal-based interactive agent:

```powershell
python "c:\Users\Neha Manoo\.gemini\antigravity\upskilling-ai-agent\agent_cli.py"
```

---

## 📂 Project Structure

```
upskilling-ai-agent/
├── index.html              # Modern responsive Single-Page Application
├── css/
│   └── styles.css          # Design system: glassmorphism, dark palette, animations
├── js/
│   ├── competency-data.js  # Role competency maps, question bank, project specs
│   ├── agent-core.js       # Master System Prompt engine, profile state machine
│   ├── llm-service.js      # Gemini API integration & offline intelligence fallback
│   └── app.js              # Application controller & view bindings
├── agent_cli.py            # Standalone terminal CLI engine
└── README.md               # System documentation
```

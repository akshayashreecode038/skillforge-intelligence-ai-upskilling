/**
 * UpskillingAgentCore - AI-Powered Personalized Upskilling & Skill-Gap Learning Agent
 * Strictly implements Master System Prompt Sections 1 through 28.
 */

class UpskillingAgentCore {
  constructor(initialData = {}) {
    this.storageKey = 'upskilling_agent_profile_v1';
    
    // Support Node.js and Browser environments
    if (typeof ROLE_COMPETENCY_MAPS !== 'undefined') {
      this.roleMaps = ROLE_COMPETENCY_MAPS;
      this.questionBank = DIAGNOSTIC_QUESTION_BANK || [];
      this.roleProjects = ROLE_PROJECTS || {};
    } else if (typeof require !== 'undefined') {
      try {
        const compData = require('./competency-data.js');
        this.roleMaps = compData.ROLE_COMPETENCY_MAPS || {};
        this.questionBank = compData.DIAGNOSTIC_QUESTION_BANK || [];
        this.roleProjects = compData.ROLE_PROJECTS || {};
      } catch (e) {
        this.roleMaps = {};
        this.questionBank = [];
        this.roleProjects = {};
      }
    } else {
      this.roleMaps = {};
      this.questionBank = [];
      this.roleProjects = {};
    }
    
    this.profile = this.loadProfile() || this.createDefaultProfile(initialData);
    this.spacedRevisionQueue = [];
    this.activeAssessmentSession = null;
    this.ensureRoleRequirements();
  }

  // ==========================================
  // SECTION 2: LEARNER PROFILE SCHEMA
  // ==========================================
  createDefaultProfile(overrides = {}) {
    return {
      learner: {
        name: overrides.name || "Alex Rivera",
        education: overrides.education || "B.S. in Computer Science / Information Systems",
        experience: overrides.experience || "1-2 years general tech experience",
        career_goal: overrides.career_goal || "Become a high-impact Data Analyst / Analytics Engineer",
        target_role: overrides.target_role || "Data Analyst",
        target_industry: overrides.target_industry || "Technology & E-Commerce"
      },
      skills: {
        "Python": {
          proficiency: 2,
          confidence: 0.5,
          evidence: ["Self-reported basic scripting", "Simple data parsing tasks"],
          weak_areas: ["Object-Oriented Design", "Generators & Memory Optimization"],
          strong_areas: ["Basic syntax", "List comprehensions"]
        },
        "SQL": {
          proficiency: 1,
          confidence: 0.4,
          evidence: ["Self-reported basic SELECT queries"],
          weak_areas: ["Complex JOINs", "Window functions", "Subqueries"],
          strong_areas: ["SELECT WHERE"]
        },
        "Excel": {
          proficiency: 3,
          confidence: 0.7,
          evidence: ["Used in daily reporting", "VLOOKUP & Pivot tables verified"],
          weak_areas: ["Power Query", "Nested logic formulas"],
          strong_areas: ["Pivot Tables", "VLOOKUP", "Conditional formatting"]
        },
        "Statistics": {
          proficiency: 1,
          confidence: 0.35,
          evidence: ["Undergraduate course completed 2 years ago"],
          weak_areas: ["Hypothesis testing", "p-value interpretation", "Regression diagnostics"],
          strong_areas: ["Mean and median calculation"]
        },
        "Data Cleaning": {
          proficiency: 2,
          confidence: 0.45,
          evidence: ["Manual Excel cleanup"],
          weak_areas: ["Regex data parsing", "Outlier imputation", "Pandas handling of NaNs"],
          strong_areas: ["Filtering duplicates"]
        },
        "Data Visualization": {
          proficiency: 2,
          confidence: 0.5,
          evidence: ["Created Excel bar and line charts"],
          weak_areas: ["Dashboard storytelling", "Visual hierarchy", "Interactivity"],
          strong_areas: ["Standard bar charts"]
        },
        "Power BI": {
          proficiency: 0,
          confidence: 0.2,
          evidence: ["No verifiable exposure"],
          weak_areas: ["DAX calculations", "Data modeling", "Star schema"],
          strong_areas: []
        },
        "Business Analysis": {
          proficiency: 2,
          confidence: 0.4,
          evidence: ["Participated in quarterly review meetings"],
          weak_areas: ["Metric decomposition", "Cohort retention analysis"],
          strong_areas: ["Basic KPI tracking"]
        },
        "Communication": {
          proficiency: 3,
          confidence: 0.6,
          evidence: ["Cross-functional stakeholder presentations"],
          weak_areas: ["Technical-to-non-technical translation"],
          strong_areas: ["Written status reports"]
        }
      },
      learning_history: {
        completed_topics: ["Excel Fundamentals", "Python Syntax Basics"],
        current_topic: "SQL Fundamentals & Relational Joins",
        paused_topic: "",
        assessment_results: [],
        projects_completed: [],
        mistakes: []
      },
      preferences: {
        learning_style: "Practical with real-world examples",
        difficulty: "Balanced adaptive",
        preferred_content: "Interactive drills, code snippets, and scenario projects"
      },
      career_requirements: {
        required_skills: [],
        optional_skills: [],
        skill_levels: {}
      }
    };
  }

  saveProfile() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.profile));
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }

  loadProfile() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn("Storage load failed:", e);
      return null;
    }
  }

  resetProfile(role = "Data Analyst") {
    this.profile = this.createDefaultProfile({ target_role: role });
    this.ensureRoleRequirements();
    this.saveProfile();
    return this.profile;
  }

  // ==========================================
  // SECTION 3: RESUME & BACKGROUND ANALYSIS
  // ==========================================
  analyzeResume(resumeText) {
    const textLower = resumeText.toLowerCase();
    const extracted = {
      detectedSkills: [],
      education: [],
      experienceYears: 0,
      domains: [],
      rawKeywords: []
    };

    const skillCatalog = {
      "Python": ["python", "pandas", "numpy", "scipy", "django", "flask", "fastapi"],
      "SQL": ["sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "snowflake", "bigquery", "queries", "joins"],
      "Excel": ["excel", "spreadsheets", "vlookup", "xlookup", "pivot tables"],
      "Statistics": ["statistics", "statistical", "hypothesis testing", "a/b testing", "probability", "regression", "p-value"],
      "Data Cleaning": ["data cleaning", "wrangling", "preprocessing", "imputation", "etl", "data cleansing"],
      "Data Visualization": ["data visualization", "tableau", "matplotlib", "seaborn", "charts", "dashboards", "storytelling"],
      "Power BI": ["power bi", "powerbi", "dax", "power query"],
      "Business Analysis": ["business analysis", "kpis", "roi", "stakeholder", "metrics", "analytics"],
      "Communication": ["presentation", "leadership", "mentoring", "client facing", "cross-functional"]
    };

    // Detect skills & mark initial baseline
    for (const [skillName, keywords] of Object.entries(skillCatalog)) {
      const match = keywords.some(kw => textLower.includes(kw));
      if (match) {
        extracted.detectedSkills.push(skillName);
        // Prompt Section 3: Do NOT treat resume as proof of mastery!
        // Mark as "claims exposure" with initial baseline proficiency and low confidence.
        if (!this.profile.skills[skillName]) {
          this.profile.skills[skillName] = {
            proficiency: 1,
            confidence: 0.25,
            evidence: [`Resume claim: mentions '${skillName}' (unverified)`],
            weak_areas: [],
            strong_areas: []
          };
        } else {
          // Append evidence without inflating unverified mastery
          if (!this.profile.skills[skillName].evidence.some(e => e.includes("Resume claim"))) {
            this.profile.skills[skillName].evidence.unshift(`Resume claim: mentions '${skillName}' (unverified exposure)`);
            this.profile.skills[skillName].confidence = Math.min(0.4, this.profile.skills[skillName].confidence);
          }
        }
      }
    }

    // Detect education
    if (textLower.includes("bachelor") || textLower.includes("b.s.") || textLower.includes("b.tech") || textLower.includes("degree")) {
      extracted.education.push("Bachelor's Degree in technical/quantitative field");
      this.profile.learner.education = extracted.education[0];
    } else if (textLower.includes("master") || textLower.includes("m.s.")) {
      extracted.education.push("Master's Degree");
      this.profile.learner.education = extracted.education[0];
    }

    // Estimate experience
    const expMatch = textLower.match(/(\d+)\+?\s*(years|yrs)\s*(of)?\s*experience/);
    if (expMatch) {
      extracted.experienceYears = parseInt(expMatch[1]);
      this.profile.learner.experience = `${extracted.experienceYears} years verified in resume`;
    }

    this.saveProfile();
    return {
      extracted,
      message: `Extracted ${extracted.detectedSkills.length} claimed skills from resume. Per system guidelines, these represent claimed exposure rather than verified mastery. Verification assessments are now queued.`,
      updatedSkills: extracted.detectedSkills
    };
  }

  // ==========================================
  // SECTION 4 & 8: TARGET ROLE & SKILL GAPS
  // ==========================================
  setTargetRole(roleName) {
    if (!this.roleMaps[roleName]) {
      console.warn(`Role ${roleName} not found, defaulting to Data Analyst`);
      roleName = "Data Analyst";
    }
    this.profile.learner.target_role = roleName;
    this.ensureRoleRequirements();
    this.saveProfile();
  }

  ensureRoleRequirements() {
    const role = this.profile.learner.target_role;
    const roleDef = this.roleMaps[role] || this.roleMaps["Data Analyst"];
    
    const required = [];
    const skillLevels = {};
    for (const [skill, def] of Object.entries(roleDef.competencies)) {
      required.push(skill);
      skillLevels[skill] = def.required_level;
      if (!this.profile.skills[skill]) {
        this.profile.skills[skill] = {
          proficiency: 0,
          confidence: 0.1,
          evidence: ["No data recorded"],
          weak_areas: [],
          strong_areas: []
        };
      }
    }
    this.profile.career_requirements.required_skills = required;
    this.profile.career_requirements.skill_levels = skillLevels;
  }

  calculateSkillGaps() {
    const role = this.profile.learner.target_role;
    const roleDef = this.roleMaps[role] || this.roleMaps["Data Analyst"];
    const gaps = [];

    for (const [skill, comp] of Object.entries(roleDef.competencies)) {
      const current = this.profile.skills[skill] ? this.profile.skills[skill].proficiency : 0;
      const confidence = this.profile.skills[skill] ? this.profile.skills[skill].confidence : 0;
      const required = comp.required_level;
      const gapSize = Math.max(0, required - current);

      // Prerequisite multiplier (Section 8: Prioritize foundational skills that are prerequisites for other skills)
      let prereqCount = 0;
      for (const [targetSkill, prereqList] of Object.entries(roleDef.prerequisites || {})) {
        if (prereqList.includes(skill)) prereqCount++;
      }
      const prereqImportance = 1.0 + (prereqCount * 0.35);
      const roleImportance = comp.importance;

      // Priority formula: Gap Size × Role Importance × Prerequisite Importance
      const priorityScore = gapSize * roleImportance * prereqImportance;

      let priorityLabel = "low";
      if (priorityScore >= 3.0) priorityLabel = "critical";
      else if (priorityScore >= 1.8) priorityLabel = "high";
      else if (priorityScore >= 0.9) priorityLabel = "medium";

      gaps.push({
        skill,
        category: comp.category,
        required_level: required,
        current_level: current,
        gap: gapSize,
        confidence,
        importance: roleImportance,
        prereqCount,
        priorityScore: parseFloat(priorityScore.toFixed(2)),
        priority: priorityLabel,
        evidence: this.profile.skills[skill]?.evidence || []
      });
    }

    // Sort by priorityScore descending
    return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  // ==========================================
  // SECTION 6 & 7: ADAPTIVE DIAGNOSTIC ASSESSMENT
  // ==========================================
  startAssessmentSession(skillName = null) {
    // If no skill specified, select top priority gap skill
    if (!skillName) {
      const gaps = this.calculateSkillGaps();
      const topGap = gaps.find(g => g.gap > 0) || gaps[0];
      skillName = topGap ? topGap.skill : "SQL";
    }

    const currentProf = this.profile.skills[skillName]?.proficiency || 1;
    // Target difficulty starting at current level or 1
    const targetDifficulty = Math.max(1, Math.min(5, currentProf));

    // Get matching questions
    let candidates = this.questionBank.filter(q => q.skill === skillName);
    if (candidates.length === 0) {
      // Fallback questions for uncatalogued skills
      candidates = [
        {
          id: `${skillName.toLowerCase()}_diag_1`,
          skill: skillName,
          difficulty: targetDifficulty,
          type: "scenario",
          concept: `Practical Application of ${skillName}`,
          prompt: `In a production environment requiring ${skillName}, how do you approach diagnosing performance bottlenecks or schema mismatches?`,
          options: [
            `Audit logs and run systematic benchmarks isolating the slowest component.`,
            `Restart services immediately without checking telemetry.`,
            `Delete recent records until the error clears.`,
            `Ignore the log warnings as long as the application runs.`
          ],
          correctIndex: 0,
          explanation: `Systematic telemetry isolation and profiling is the professional engineering standard.`,
          remedialConcept: `Systematic debugging and instrumentation in ${skillName}`
        }
      ];
    }

    // Find closest difficulty
    let question = candidates.find(q => q.difficulty === targetDifficulty) || candidates[0];

    this.activeAssessmentSession = {
      skill: skillName,
      currentQuestion: question,
      history: [],
      consecutiveCorrect: 0,
      consecutiveErrors: 0,
      sessionDifficulty: targetDifficulty
    };

    return {
      session: this.activeAssessmentSession,
      question: this.activeAssessmentSession.currentQuestion
    };
  }

  submitAssessmentAnswer(selectedIndex) {
    if (!this.activeAssessmentSession || !this.activeAssessmentSession.currentQuestion) {
      throw new Error("No active assessment session.");
    }

    const q = this.activeAssessmentSession.currentQuestion;
    const isCorrect = (selectedIndex === q.correctIndex);
    const skill = this.activeAssessmentSession.skill;
    const skillObj = this.profile.skills[skill] || {
      proficiency: 0,
      confidence: 0.2,
      evidence: [],
      weak_areas: [],
      strong_areas: []
    };

    const evaluationResult = {
      questionId: q.id,
      skill,
      isCorrect,
      userAnswer: selectedIndex,
      correctAnswer: q.correctIndex,
      explanation: q.explanation,
      concept: q.concept,
      difficulty: q.difficulty,
      adaptation: ""
    };

    this.activeAssessmentSession.history.push(evaluationResult);

    // Section 7: Adaptive Questioning Logic
    if (isCorrect) {
      this.activeAssessmentSession.consecutiveCorrect++;
      this.activeAssessmentSession.consecutiveErrors = 0;

      // Add to strong areas if not present
      if (!skillObj.strong_areas.includes(q.concept)) {
        skillObj.strong_areas.push(q.concept);
      }

      // Increase proficiency if difficulty matched or exceeded current
      if (q.difficulty >= skillObj.proficiency) {
        skillObj.proficiency = Math.min(5, q.difficulty);
        skillObj.confidence = Math.min(0.95, parseFloat((skillObj.confidence + 0.15).toFixed(2)));
        skillObj.evidence.unshift(`Demonstrated level ${q.difficulty} mastery on '${q.concept}' (${q.type})`);
      }

      // Step up difficulty
      const nextDiff = Math.min(5, q.difficulty + 1);
      evaluationResult.adaptation = `Correct! Elevating difficulty from Level ${q.difficulty} to Level ${nextDiff} to test deeper practical application.`;
      this.activeAssessmentSession.sessionDifficulty = nextDiff;

      // Find harder question for the same skill
      const nextQ = this.questionBank.find(
        item => item.skill === skill && item.difficulty === nextDiff && !this.activeAssessmentSession.history.some(h => h.questionId === item.id)
      );

      this.activeAssessmentSession.currentQuestion = nextQ || null;
    } else {
      // Incorrect answer
      this.activeAssessmentSession.consecutiveErrors++;
      this.activeAssessmentSession.consecutiveCorrect = 0;

      // Track weak concept
      if (!skillObj.weak_areas.includes(q.concept)) {
        skillObj.weak_areas.push(q.concept);
      }

      // Add to Spaced Revision queue (Section 12)
      this.addToRevisionQueue(skill, q.concept, q.remedialConcept);

      // Adjust confidence and record mistake
      skillObj.confidence = Math.max(0.2, parseFloat((skillObj.confidence - 0.05).toFixed(2)));
      skillObj.evidence.unshift(`Diagnosed gap in '${q.concept}' (Level ${q.difficulty} test)`);
      this.profile.learning_history.mistakes.unshift({
        skill,
        concept: q.concept,
        timestamp: new Date().toISOString(),
        difficulty: q.difficulty
      });

      // Step down difficulty temporarily & provide remedial explanation
      const nextDiff = Math.max(1, q.difficulty - 1);
      evaluationResult.adaptation = `Concept Gap Identified: ${q.remedialConcept}. Reducing difficulty to Level ${nextDiff} and queuing targeted revision.`;
      this.activeAssessmentSession.sessionDifficulty = nextDiff;

      // Find simpler diagnostic question
      const simplerQ = this.questionBank.find(
        item => item.skill === skill && item.difficulty <= nextDiff && !this.activeAssessmentSession.history.some(h => h.questionId === item.id)
      );

      this.activeAssessmentSession.currentQuestion = simplerQ || null;
    }

    // Save profile updates
    this.profile.skills[skill] = skillObj;
    this.profile.learning_history.assessment_results.unshift({
      timestamp: new Date().toISOString(),
      skill,
      isCorrect,
      concept: q.concept,
      difficulty: q.difficulty
    });
    this.saveProfile();

    return {
      evaluation: evaluationResult,
      updatedSkill: {
        skill,
        level: skillObj.proficiency,
        confidence: skillObj.confidence
      },
      nextQuestion: this.activeAssessmentSession.currentQuestion,
      sessionActive: !!this.activeAssessmentSession.currentQuestion
    };
  }

  // ==========================================
  // SECTION 9: PERSONALIZED ROADMAP GENERATION
  // ==========================================
  generatePersonalizedRoadmap() {
    const gaps = this.calculateSkillGaps();
    const role = this.profile.learner.target_role;
    const roleDef = this.roleMaps[role] || this.roleMaps["Data Analyst"];
    const prerequisites = roleDef.prerequisites || {};

    const roadmapMilestones = [];
    const processedSkills = new Set();

    // Collect skills with gap > 0
    const needyGaps = gaps.filter(g => g.gap > 0);

    // Topological sorting respecting prerequisites
    const addSkillToRoadmap = (skillName) => {
      if (processedSkills.has(skillName)) return;

      // Check if prereqs exist and need completion
      const prereqList = prerequisites[skillName] || [];
      for (const prereq of prereqList) {
        const prereqGap = gaps.find(g => g.skill === prereq);
        if (prereqGap && prereqGap.gap > 0 && !processedSkills.has(prereq)) {
          addSkillToRoadmap(prereq);
        }
      }

      const gapInfo = gaps.find(g => g.skill === skillName);
      if (gapInfo && gapInfo.gap > 0) {
        processedSkills.add(skillName);
        
        // Formulate customized steps based on current level
        const currentLvl = gapInfo.current_level;
        const targetLvl = gapInfo.required_level;
        const steps = [];

        if (currentLvl <= 1) {
          steps.push({
            title: `${skillName} Core Fundamentals & Mental Models`,
            type: "LESSON",
            targetDifficulty: 1,
            estimatedHours: 4
          });
        }
        if (currentLvl <= 2 && targetLvl >= 3) {
          steps.push({
            title: `${skillName} Practical Querying & Scripting Workflows`,
            type: "PRACTICE_TASK",
            targetDifficulty: 2,
            estimatedHours: 6
          });
        }
        if (currentLvl <= 3 && targetLvl >= 4) {
          steps.push({
            title: `Advanced ${skillName}: Optimization, Windowing & Edge Cases`,
            type: "ADVANCED_DRILL",
            targetDifficulty: 3,
            estimatedHours: 8
          });
        }
        if (targetLvl >= 5) {
          steps.push({
            title: `Enterprise Production Architecture in ${skillName}`,
            type: "SYSTEM_DESIGN",
            targetDifficulty: 4,
            estimatedHours: 10
          });
        }

        // Add capstone practice task
        steps.push({
          title: `${skillName} Competency Verification Milestone`,
          type: "EVALUATION",
          targetDifficulty: targetLvl,
          estimatedHours: 2
        });

        roadmapMilestones.push({
          id: `mile_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          skill: skillName,
          category: gapInfo.category,
          gap: gapInfo.gap,
          current_level: currentLvl,
          target_level: targetLvl,
          priority: gapInfo.priority,
          priorityScore: gapInfo.priorityScore,
          prerequisitesMet: prereqList.every(p => {
            const pGap = gaps.find(g => g.skill === p);
            return !pGap || pGap.gap === 0 || processedSkills.has(p);
          }),
          prerequisites: prereqList,
          steps,
          status: roadmapMilestones.length === 0 ? "IN_PROGRESS" : "QUEUED"
        });
      }
    };

    // Add prioritized skills
    for (const gap of needyGaps) {
      addSkillToRoadmap(gap.skill);
    }

    // Add Final Capstone Project milestone
    roadmapMilestones.push({
      id: "mile_final_capstone",
      skill: "Portfolio Capstone",
      category: "Practical Application",
      gap: 0,
      current_level: 0,
      target_level: 5,
      priority: "high",
      priorityScore: 5.0,
      prerequisitesMet: true,
      prerequisites: needyGaps.map(g => g.skill),
      steps: [
        {
          title: `Integrated ${role} Capstone Project Submission`,
          type: "PROJECT",
          targetDifficulty: 4,
          estimatedHours: 16
        },
        {
          title: "Comprehensive Role Competency Diagnostic",
          type: "FINAL_ASSESSMENT",
          targetDifficulty: 4,
          estimatedHours: 3
        }
      ],
      status: "LOCKED"
    });

    return roadmapMilestones;
  }

  // ==========================================
  // SECTION 10 & 21: CONTENT PERSONALIZATION
  // ==========================================
  generatePersonalizedLesson(topicOrSkill) {
    const skillName = topicOrSkill || "SQL";
    const currentProf = this.profile.skills[skillName]?.proficiency || 1;
    const weakPoints = this.profile.skills[skillName]?.weak_areas || [];

    // Mode determination according to Section 10
    let depthMode = "beginner";
    if (currentProf >= 4) depthMode = "advanced";
    else if (currentProf >= 2) depthMode = "intermediate";

    const lessonData = {
      skill: skillName,
      proficiency: currentProf,
      depthMode,
      title: `${skillName}: ${depthMode === "beginner" ? "Conceptual Foundations" : depthMode === "intermediate" ? "Applied Data Engineering & Patterns" : "Performance Optimization & Edge Cases"}`,
      structure: {
        // Section 21: 8-Step Structure
        what_it_is: "",
        why_it_matters: "",
        explanation: "",
        example_code: "",
        real_world_application: "",
        practice_question: "",
        feedback_hint: "",
        next_step: ""
      }
    };

    if (skillName === "SQL") {
      if (depthMode === "beginner") {
        lessonData.structure = {
          what_it_is: "SQL (Structured Query Language) is the standard declarative tool for querying and manipulating relational database management systems.",
          why_it_matters: "Without SQL, data analysts cannot extract or audit raw business transactions stored across normalized enterprise tables.",
          explanation: "Think of relational database tables like separate sheets in a spreadsheet workbook. Instead of copy-pasting, SQL JOINs act like automatic bridges that stitch together customers, orders, and products based on matching ID keys.",
          example_code: `-- Connecting orders to their respective customers\nSELECT customers.customer_name, orders.order_id, orders.order_total\nFROM customers\nINNER JOIN orders ON customers.id = orders.customer_id\nWHERE orders.order_total > 100;`,
          real_world_application: "E-commerce retailers use this exact join pattern to send personalized purchase confirmations and update regional inventory levels in real-time.",
          practice_question: "If you need a list of ALL customers, including those who have never placed an order, which JOIN should replace `INNER JOIN`?",
          feedback_hint: "Look into `LEFT JOIN`, which preserves every record from the left table even if right table keys are absent.",
          next_step: "Test your JOIN mechanics in the Diagnostic Arena."
        };
      } else if (depthMode === "intermediate") {
        lessonData.structure = {
          what_it_is: "Analytical Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `SUM(...) OVER(...)`).",
          why_it_matters: "Standard `GROUP BY` collapses rows into summary statistics. Window functions allow calculations across a set of table rows while preserving individual row granularity.",
          explanation: "Window functions compute moving aggregates, cumulative totals, and hierarchical rankings without requiring expensive multi-pass self-joins.",
          example_code: `-- Calculate running total revenue and rank orders per customer\nSELECT\n  customer_id,\n  order_date,\n  revenue,\n  SUM(revenue) OVER(PARTITION BY customer_id ORDER BY order_date) AS running_total,\n  DENSE_RANK() OVER(PARTITION BY customer_id ORDER BY revenue DESC) AS rank_by_value\nFROM orders;`,
          real_world_application: "Fintech risk engines use window functions over sliding 30-day timeframes to flag sudden surges in transaction volume indicative of credit fraud.",
          practice_question: "What is the key difference in output between `RANK()` and `DENSE_RANK()` when two rows tie for 1st place?",
          feedback_hint: "`RANK()` skips subsequent ranks (1, 1, 3), whereas `DENSE_RANK()` does not leave gaps (1, 1, 2).",
          next_step: "Implement this in the Subscription Churn Project."
        };
      } else {
        lessonData.structure = {
          what_it_is: "Cost-Based Query Optimization, B-Tree vs Hash Indexing, and CTE Materialization Boundaries.",
          why_it_matters: "A query that runs in 200ms on a development dataset can lock production tables and cause service outages when executed on billions of live transactions.",
          explanation: "At scale, optimizer choice depends on cardinality estimates, sequential vs index scans, and join strategies (Nested Loop vs Hash Join vs Merge Join). Avoiding non-sargable predicates (e.g. `WHERE YEAR(date) = 2026`) is crucial.",
          example_code: `-- Anti-pattern (forces full table scan due to function wrapping key):\n-- WHERE DATE(created_at) = '2026-09-18'\n\n-- SARGable Index-Friendly Pattern:\nSELECT order_id, amount\nFROM orders\nWHERE created_at >= '2026-09-18 00:00:00'\n  AND created_at <  '2026-09-19 00:00:00';`,
          real_world_application: "High-frequency payment processors optimize indexes to maintain sub-15ms p99 query latency during peak shopping events.",
          practice_question: "When would a database query planner intentionally choose a sequential scan over an existing B-Tree index?",
          feedback_hint: "When the filter condition selects a large percentage of the table (>20-30%), random I/O from index lookups becomes slower than sequential disk reads.",
          next_step: "Review production database execution plans."
        };
      }
    } else {
      // Generic template for Python / Statistics / etc.
      lessonData.structure = {
        what_it_is: `${skillName} Core Concepts and Industry Standards.`,
        why_it_matters: `Essential required competency for the ${this.profile.learner.target_role} role.`,
        explanation: `Structured practical breakdown adapted for Level ${currentProf} proficiency. ${weakPoints.length > 0 ? `Targeting your identified gap in: ${weakPoints.join(", ")}.` : ""}`,
        example_code: `# Idiomatic ${skillName} pattern\nimport numpy as np\n# Applied data transformation`,
        real_world_application: `Leveraged across enterprise workflows to automate analysis and generate actionable reports.`,
        practice_question: `Identify how to handle edge-cases and validate output integrity in this workflow.`,
        feedback_hint: `Refer to official documentation and verified test cases.`,
        next_step: `Practice in the Project Studio.`
      };
    }

    return lessonData;
  }

  // ==========================================
  // SECTION 12: SPACED REVISION QUEUE
  // ==========================================
  addToRevisionQueue(skill, concept, remedialConcept) {
    const existing = this.spacedRevisionQueue.find(r => r.concept === concept);
    if (!existing) {
      this.spacedRevisionQueue.push({
        id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        skill,
        concept,
        remedialConcept,
        addedAt: new Date().toISOString(),
        reviewInterval: "24h",
        status: "PENDING"
      });
    }
  }

  getRevisionQueue() {
    return this.spacedRevisionQueue;
  }

  resolveRevisionItem(id) {
    this.spacedRevisionQueue = this.spacedRevisionQueue.filter(item => item.id !== id);
  }

  // ==========================================
  // SECTION 14 & 15: PRACTICAL PROJECT EVALUATION
  // ==========================================
  evaluateProjectSubmission(projectId, submissionText) {
    // Find project
    let project = null;
    for (const pList of Object.values(this.roleProjects)) {
      const match = pList.find(p => p.id === projectId);
      if (match) {
        project = match;
        break;
      }
    }

    if (!project) {
      // Fallback generic project
      project = {
        title: "Practical Analytics Project",
        skills_tested: ["Data Cleaning", "SQL"],
        sample_solution_keywords: ["join", "groupby", "where", "clean"]
      };
    }

    const textLower = submissionText.toLowerCase();
    const rubricScores = {
      correctness: 0,
      technical_implementation: 0,
      problem_solving: 0,
      efficiency: 0,
      real_world_applicability: 0
    };

    // Keyword & logic detection
    const keywords = project.sample_solution_keywords || ["clean", "filter", "data"];
    let matches = 0;
    keywords.forEach(kw => {
      if (textLower.includes(kw.toLowerCase())) matches++;
    });

    const matchRatio = matches / Math.max(1, keywords.length);

    // Score computation (0-100)
    rubricScores.correctness = Math.min(95, Math.round(50 + matchRatio * 45));
    rubricScores.technical_implementation = Math.min(92, Math.round(55 + matchRatio * 40));
    rubricScores.problem_solving = textLower.length > 200 ? 88 : 70;
    rubricScores.efficiency = (textLower.includes("vectorize") || textLower.includes("index") || textLower.includes("window")) ? 90 : 75;
    rubricScores.real_world_applicability = textLower.includes("kpi") || textLower.includes("business") || textLower.includes("insight") ? 92 : 78;

    const overallScore = Math.round(
      (rubricScores.correctness +
       rubricScores.technical_implementation +
       rubricScores.problem_solving +
       rubricScores.efficiency +
       rubricScores.real_world_applicability) / 5
    );

    const isPassed = overallScore >= 75;

    // AI Feedback conforming to Section 15 (Specific, Actionable, Personalized, Progressive)
    const feedback = {
      overallScore,
      isPassed,
      rubricScores,
      strengths: [
        `Identified and applied core operations for ${project.skills_tested.join(", ")}.`,
        `Preserved data integrity across transformation stages with explicit filtering.`
      ],
      weaknesses: [],
      actionable_recommendations: [],
      next_skill_to_develop: project.skills_tested[0]
    };

    if (rubricScores.efficiency < 85) {
      feedback.weaknesses.push("Query/code execution relies on unindexed or iterated operations which will degrade on enterprise datasets.");
      feedback.actionable_recommendations.push("Replace iterative loops with vectorized operations or add composite B-Tree indexes.");
    }
    if (rubricScores.real_world_applicability < 85) {
      feedback.weaknesses.push("Conclusions provide technical numbers without translating findings into clear business levers or risk assessments.");
      feedback.actionable_recommendations.push("Add an executive takeaway bullet quantifying the exact revenue impact.");
    }

    if (isPassed) {
      // Update skills
      project.skills_tested.forEach(s => {
        if (this.profile.skills[s]) {
          this.profile.skills[s].proficiency = Math.min(5, this.profile.skills[s].proficiency + 1);
          this.profile.skills[s].confidence = Math.min(0.95, parseFloat((this.profile.skills[s].confidence + 0.1).toFixed(2)));
          this.profile.skills[s].evidence.unshift(`Completed hands-on practical project '${project.title}' with score ${overallScore}%`);
        }
      });
      this.profile.learning_history.projects_completed.unshift({
        id: project.id,
        title: project.title,
        completedAt: new Date().toISOString(),
        score: overallScore
      });
      this.saveProfile();
    }

    return feedback;
  }

  // ==========================================
  // SECTION 23: NEXT-ACTION ENGINE
  // ==========================================
  determineNextAction() {
    const gaps = this.calculateSkillGaps();
    const criticalGaps = gaps.filter(g => g.priority === "critical" && g.gap > 0);
    const pendingRevision = this.spacedRevisionQueue.length > 0;

    if (pendingRevision) {
      return {
        next_action: "REVISE_TOPIC",
        target: this.spacedRevisionQueue[0].concept,
        reason: `Targeted revision required for '${this.spacedRevisionQueue[0].concept}' to solidify retention before advancing.`
      };
    }

    if (criticalGaps.length > 0) {
      const topGap = criticalGaps[0];
      if (topGap.confidence < 0.4) {
        return {
          next_action: "START_ASSESSMENT",
          target: topGap.skill,
          reason: `High role priority gap in '${topGap.skill}' with low verified confidence (${Math.round(topGap.confidence * 100)}%). Diagnostic testing required.`
        };
      }
      return {
        next_action: "CONTINUE_LESSON",
        target: topGap.skill,
        reason: `Bridge the ${topGap.gap}-level gap in '${topGap.skill}' required for ${this.profile.learner.target_role}.`
      };
    }

    if (this.profile.learning_history.projects_completed.length === 0) {
      return {
        next_action: "START_PROJECT",
        target: "Portfolio Project",
        reason: "Sufficient foundational concepts demonstrated; practical project evidence required to reach level 3+."
      };
    }

    return {
      next_action: "ADVANCE_LEVEL",
      target: this.profile.learner.target_role,
      reason: "Core competencies verified. Elevating to complex optimization and domain scenarios."
    };
  }

  // ==========================================
  // SECTION 24 & 26: MACHINE-READABLE TELEMETRY & CONVERSATIONAL MENTOR
  // ==========================================
  generateAgentResponse(userQuery) {
    const gaps = this.calculateSkillGaps();
    const nextAct = this.determineNextAction();
    const targetRole = this.profile.learner.target_role;

    // Filter identified gaps
    const identified_gaps = gaps
      .filter(g => g.gap > 0)
      .slice(0, 3)
      .map(g => `${g.skill} (Gap: ${g.gap}, Required: ${g.required_level}, Current: ${g.current_level})`);

    const skill_updates = Object.entries(this.profile.skills)
      .filter(([s, data]) => data.proficiency > 0)
      .map(([s, data]) => ({
        skill: s,
        level: data.proficiency,
        confidence: data.confidence
      }));

    // Natural mentor message adhering to Sections 22 and 26 (evidence-based, no false certainty)
    let naturalMessage = "";
    const qLower = (userQuery || "").toLowerCase();

    if (qLower.includes("ready") || qLower.includes("job") || qLower.includes("hired")) {
      naturalMessage = `Based on current assessments, you have demonstrated solid proficiency in ${this.profile.learning_history.completed_topics.join(", ") || "fundamental syntax"}. However, per our evidence-based evaluation model, you are not yet job-ready for the ${targetRole} role: remaining critical gaps include ${identified_gaps.join(", ")}. Focusing on your next action will directly bridge these gaps.`;
    } else if (qLower.includes("resume") || qLower.includes("cv")) {
      naturalMessage = `I've analyzed your background. Remember that listing skills on a resume establishes claimed exposure rather than verified mastery. We'll verify each skill through targeted diagnostic challenges so your roadmap focuses only on what you truly need.`;
    } else if (qLower.includes("where do i start") || qLower.includes("roadmap") || qLower.includes("next")) {
      naturalMessage = `Your highest priority focus right now is **${nextAct.target}**. ${nextAct.reason} Let's proceed with this action rather than wasting time on material you've already mastered.`;
    } else {
      naturalMessage = `Welcome back, ${this.profile.learner.name}. You are working toward **${targetRole}**. Your current verified skill profile shows key strengths in ${Object.entries(this.profile.skills).filter(([k,v]) => v.proficiency >= 3).map(([k]) => k).join(", ") || "foundational tools"}, with primary growth needed in **${gaps[0]?.skill || "advanced topics"}**. Next recommended step: ${nextAct.next_action} (${nextAct.target}).`;
    }

    // Machine-readable payload
    const telemetry = {
      message: naturalMessage,
      target_role: targetRole,
      skill_updates,
      identified_gaps,
      recommended_next_step: {
        type: nextAct.next_action,
        topic: nextAct.target,
        reason: nextAct.reason
      },
      evidence_summary: Object.entries(this.profile.skills).map(([k, v]) => ({
        skill: k,
        proficiency: v.proficiency,
        confidence: v.confidence,
        evidence_count: v.evidence.length
      }))
    };

    return telemetry;
  }
}

// Export for browser and Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UpskillingAgentCore };
} else {
  window.UpskillingAgentCore = UpskillingAgentCore;
}

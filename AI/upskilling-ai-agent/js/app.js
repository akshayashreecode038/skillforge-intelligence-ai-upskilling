/**
 * App Controller - Connects UI Views, Agent Core, and LLM Service
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Engines
  const agentCore = new UpskillingAgentCore();
  const llmService = new LLMService();

  let selectedAnswerIndex = null;
  let currentProject = null;

  // DOM Elements
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');
  const headerRoleSelect = document.getElementById('header-role-select');
  const btnToggleJson = document.getElementById('btn-toggle-json');
  const btnCloseJson = document.getElementById('btn-close-json');
  const jsonDrawer = document.getElementById('json-drawer');
  const liveJsonContent = document.getElementById('live-json-content');
  const btnCopyJson = document.getElementById('btn-copy-json');
  const btnResetProfile = document.getElementById('btn-reset-profile');
  
  // Settings Modal Elements
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const btnCloseSettings = document.getElementById('btn-close-settings');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const settingsModal = document.getElementById('settings-modal');
  const inputGeminiKey = document.getElementById('input-gemini-key');

  // ==========================================
  // VIEW NAVIGATION
  // ==========================================
  function switchView(viewName) {
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    viewSections.forEach(section => {
      if (section.id === `view-${viewName}`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });

    // Refresh view-specific content
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'gap-matrix') renderGapMatrix();
    if (viewName === 'roadmap') renderRoadmap();
    if (viewName === 'learning') renderLesson();
    if (viewName === 'projects') renderProjectStudio();
    if (viewName === 'diagnostic' && !agentCore.activeAssessmentSession) {
      startDiagnosticSession();
    }
    updateJsonViewer();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      switchView(view);
    });
  });

  document.getElementById('dash-btn-view-all-gaps')?.addEventListener('click', () => switchView('gap-matrix'));
  document.getElementById('hero-action-btn')?.addEventListener('click', () => {
    const nextAct = agentCore.determineNextAction();
    if (nextAct.next_action === 'START_ASSESSMENT' || nextAct.next_action === 'TAKE_QUIZ') {
      startDiagnosticSession(nextAct.target);
      switchView('diagnostic');
    } else if (nextAct.next_action === 'CONTINUE_LESSON' || nextAct.next_action === 'REVISE_TOPIC') {
      renderLesson(nextAct.target);
      switchView('learning');
    } else if (nextAct.next_action === 'START_PROJECT') {
      switchView('projects');
    } else {
      switchView('roadmap');
    }
  });

  // ==========================================
  // ROLE SWITCHING & SYNC
  // ==========================================
  headerRoleSelect.value = agentCore.profile.learner.target_role || "Data Analyst";
  headerRoleSelect.addEventListener('change', (e) => {
    const newRole = e.target.value;
    agentCore.setTargetRole(newRole);
    document.getElementById('sidebar-target-role').textContent = newRole;
    renderDashboard();
    renderGapMatrix();
    renderRoadmap();
    renderProjectStudio();
    updateJsonViewer();
  });

  // Sync Learner sidebar tags
  function updateSidebarProfile() {
    document.getElementById('sidebar-learner-name').textContent = agentCore.profile.learner.name;
    document.getElementById('sidebar-target-role').textContent = agentCore.profile.learner.target_role;
    const initials = agentCore.profile.learner.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    document.getElementById('learner-avatar-initials').textContent = initials || "AL";
  }

  // ==========================================
  // 1. DASHBOARD VIEW CONTROLLER
  // ==========================================
  function renderDashboard() {
    updateSidebarProfile();
    const gaps = agentCore.calculateSkillGaps();
    const nextAct = agentCore.determineNextAction();
    const verifiedCount = Object.values(agentCore.profile.skills).filter(s => s.proficiency >= 3).length;
    const totalSkills = Object.keys(agentCore.profile.career_requirements.skill_levels).length || 9;
    
    // Proficiency Average
    const profValues = Object.values(agentCore.profile.skills).map(s => s.proficiency);
    const avgProf = (profValues.reduce((a, b) => a + b, 0) / Math.max(1, profValues.length)).toFixed(1);
    
    // Critical gaps
    const critGaps = gaps.filter(g => g.gap > 0 && (g.priority === 'critical' || g.priority === 'high'));

    // DOM Stats
    document.getElementById('stat-verified-skills').textContent = `${verifiedCount} / ${totalSkills}`;
    document.getElementById('stat-avg-proficiency').textContent = `${avgProf} / 5.0`;
    document.getElementById('stat-priority-gaps').textContent = `${critGaps.length} Gaps`;
    document.getElementById('stat-revision-queue').textContent = `${agentCore.spacedRevisionQueue.length} Concepts`;
    document.getElementById('sidebar-gap-badge').textContent = `${gaps.filter(g => g.gap > 0).length} Gaps`;

    // Hero Next Action
    document.getElementById('hero-action-title').textContent = `NEXT ACTION: ${nextAct.next_action.replace(/_/g, ' ')}`;
    document.getElementById('hero-badge-priority').textContent = nextAct.target ? nextAct.target.toUpperCase() : "PRIORITY";
    document.getElementById('hero-action-reason').textContent = nextAct.reason;
    document.getElementById('hero-btn-text').textContent = nextAct.next_action.replace(/_/g, ' ');

    // Top Gaps List
    const topGapsContainer = document.getElementById('dash-top-gaps-container');
    topGapsContainer.innerHTML = '';
    gaps.slice(0, 4).forEach(gap => {
      const row = document.createElement('div');
      row.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: var(--radius-md);`;
      row.innerHTML = `
        <div>
          <div style="font-size: 0.9rem; font-weight: 600; color: #fff;">${gap.skill}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">Level ${gap.current_level} → Target: ${gap.required_level} (Gap: ${gap.gap})</div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span class="priority-badge ${gap.priority}">${gap.priority}</span>
          <button class="btn-secondary btn-assess-quick" data-skill="${gap.skill}" style="padding: 4px 10px; font-size: 0.75rem;">Verify</button>
        </div>
      `;
      topGapsContainer.appendChild(row);
    });

    document.querySelectorAll('.btn-assess-quick').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skill = e.target.getAttribute('data-skill');
        startDiagnosticSession(skill);
        switchView('diagnostic');
      });
    });

    // Evidence Log
    const evidenceContainer = document.getElementById('dash-evidence-container');
    evidenceContainer.innerHTML = '';
    const allEvidence = [];
    Object.entries(agentCore.profile.skills).forEach(([skill, data]) => {
      data.evidence.forEach(ev => {
        allEvidence.push({ skill, text: ev, confidence: data.confidence });
      });
    });

    if (allEvidence.length === 0) {
      evidenceContainer.innerHTML = `<div style="font-size: 0.82rem; color: var(--text-dim); padding: 12px;">No verified evidence yet. Complete assessments or upload a resume.</div>`;
    } else {
      allEvidence.slice(0, 4).forEach(item => {
        const div = document.createElement('div');
        div.style.cssText = `display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-cyan); font-size: 0.82rem; color: #cbd5e1;`;
        div.innerHTML = `
          <div>
            <strong style="color: #fff;">${item.skill}:</strong> ${item.text}
            <span style="display: block; font-size: 0.7rem; color: var(--text-dim); margin-top: 2px;">Confidence: ${Math.round(item.confidence * 100)}%</span>
          </div>
        `;
        evidenceContainer.appendChild(div);
      });
    }
  }

  // ==========================================
  // 2. RESUME & PROFILE ONBOARDING
  // ==========================================
  const resumeInput = document.getElementById('resume-input-text');
  const btnParseResume = document.getElementById('btn-parse-resume');
  const btnLoadSampleResume = document.getElementById('btn-load-sample-resume');
  const statusResume = document.getElementById('resume-extraction-status');

  const paramName = document.getElementById('param-learner-name');
  const paramEdu = document.getElementById('param-learner-edu');
  const paramExp = document.getElementById('param-learner-exp');
  const paramGoal = document.getElementById('param-learner-goal');

  function syncOnboardingInputs() {
    paramName.value = agentCore.profile.learner.name;
    paramEdu.value = agentCore.profile.learner.education;
    paramExp.value = agentCore.profile.learner.experience;
    paramGoal.value = agentCore.profile.learner.career_goal;
  }
  syncOnboardingInputs();

  [paramName, paramEdu, paramExp, paramGoal].forEach(input => {
    input.addEventListener('change', () => {
      agentCore.profile.learner.name = paramName.value;
      agentCore.profile.learner.education = paramEdu.value;
      agentCore.profile.learner.experience = paramExp.value;
      agentCore.profile.learner.career_goal = paramGoal.value;
      agentCore.saveProfile();
      updateSidebarProfile();
      updateJsonViewer();
    });
  });

  btnLoadSampleResume.addEventListener('click', () => {
    resumeInput.value = `Alex Rivera
Email: alex.rivera@example.com | B.S. in Computer Science (2024)

Summary:
Motivated junior software engineer with 2 years of experience building data processing scripts and web reporting dashboards. Looking to transition into a full-time Data Analyst role.

Technical Skills:
- Programming: Python (Pandas, basic NumPy, list comprehensions, scripting)
- Databases: SQL (PostgreSQL queries, basic SELECT, WHERE filtering)
- Tools: Microsoft Excel (VLOOKUP, Pivot Tables, conditional formatting), Power BI (basic dashboards)
- Analytical: Data cleaning, data visualization with matplotlib, basic statistics (A/B testing concept).

Work Experience:
Junior Data Technician - Horizon Media (2024 - Present)
- Automated weekly Excel marketing reports using Python scripts, saving 4 hours per cycle.
- Executed PostgreSQL queries to pull transactional records for sales analytics.
- Prepared data cleansing spreadsheets for quarterly management presentations.`;
  });

  btnParseResume.addEventListener('click', () => {
    const text = resumeInput.value.trim();
    if (!text) {
      alert("Please paste resume text or click 'Load Sample Resume'.");
      return;
    }

    const result = agentCore.analyzeResume(text);
    syncOnboardingInputs();
    statusResume.style.display = 'block';
    statusResume.innerHTML = `
      <strong><i class="fa-solid fa-check-circle" style="color: var(--accent-emerald);"></i> Analysis Complete (Prompt Section 3 Compliant):</strong>
      <p style="margin-top: 4px;">${result.message}</p>
      <p style="margin-top: 4px; font-size: 0.78rem; color: var(--accent-cyan);">Claimed Skills Extracted: ${result.extracted.detectedSkills.join(", ")}</p>
    `;
    renderDashboard();
    renderGapMatrix();
    updateJsonViewer();
  });

  // ==========================================
  // 3. SKILL GAP MATRIX VIEW
  // ==========================================
  function renderGapMatrix() {
    const gaps = agentCore.calculateSkillGaps();
    const container = document.getElementById('full-gap-matrix-container');
    container.innerHTML = '';

    gaps.forEach(gap => {
      const row = document.createElement('div');
      row.className = 'gap-row';

      const currentPct = (gap.current_level / 5) * 100;
      const targetPct = (gap.required_level / 5) * 100;
      const confLevel = gap.confidence >= 0.7 ? 'high' : gap.confidence >= 0.4 ? 'medium' : 'low';

      row.innerHTML = `
        <div class="skill-info">
          <h4>${gap.skill}</h4>
          <span>${gap.category} • Prereq Weight: ${gap.prereqCount > 0 ? `${gap.prereqCount} dep` : 'Baseline'}</span>
        </div>

        <div class="proficiency-meter">
          <div class="meter-labels">
            <span>Current: <strong>Lvl ${gap.current_level}</strong></span>
            <span>Target: <strong>Lvl ${gap.required_level}</strong> (Gap: ${gap.gap})</span>
          </div>
          <div class="meter-track">
            <div class="meter-bar-target" style="width: ${targetPct}%;"></div>
            <div class="meter-bar-current" style="width: ${currentPct}%;"></div>
          </div>
          <div class="confidence-indicator">
            <span class="conf-dot ${confLevel}"></span>
            <span>Confidence: ${Math.round(gap.confidence * 100)}%</span>
            <span style="color: var(--text-dim);">• Priority Score: ${gap.priorityScore}</span>
          </div>
        </div>

        <div style="text-align: center;">
          <span class="priority-badge ${gap.priority}">${gap.priority}</span>
        </div>

        <div style="text-align: right;">
          <button class="btn-primary btn-assess-skill" data-skill="${gap.skill}" style="padding: 7px 14px; font-size: 0.8rem;">
            ${gap.gap > 0 ? 'Bridge Gap' : 'Verify Level'}
          </button>
        </div>
      `;

      container.appendChild(row);
    });

    document.querySelectorAll('.btn-assess-skill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skill = e.target.closest('button').getAttribute('data-skill');
        startDiagnosticSession(skill);
        switchView('diagnostic');
      });
    });
  }

  document.getElementById('btn-recalc-gaps')?.addEventListener('click', () => {
    renderGapMatrix();
    renderDashboard();
    updateJsonViewer();
  });

  // ==========================================
  // 4. ADAPTIVE DIAGNOSTIC ARENA CONTROLLER
  // ==========================================
  const arenaSkillName = document.getElementById('arena-skill-name');
  const arenaDifficultyPill = document.getElementById('arena-difficulty-pill');
  const arenaTypeIndicator = document.getElementById('arena-type-indicator');
  const arenaPromptText = document.getElementById('arena-prompt-text');
  const arenaOptionsContainer = document.getElementById('arena-options-container');
  const arenaBtnSubmit = document.getElementById('arena-btn-submit');
  const arenaBtnSkip = document.getElementById('arena-btn-skip');
  const arenaFeedbackCard = document.getElementById('arena-feedback-card');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackExplanation = document.getElementById('feedback-explanation');
  const feedbackAdaptationText = document.getElementById('feedback-adaptation-text');
  const feedbackBtnNext = document.getElementById('feedback-btn-next');

  function startDiagnosticSession(skillName = null) {
    const sessionData = agentCore.startAssessmentSession(skillName);
    renderActiveQuestion(sessionData.question);
  }

  function renderActiveQuestion(q) {
    selectedAnswerIndex = null;
    arenaBtnSubmit.disabled = true;
    arenaFeedbackCard.classList.remove('show', 'correct-feedback', 'incorrect-feedback');

    if (!q) {
      arenaSkillName.textContent = "Diagnostic Complete";
      arenaDifficultyPill.textContent = "Session Finished";
      arenaPromptText.innerHTML = `
        <div style="text-align: center; padding: 24px;">
          <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: var(--accent-emerald); margin-bottom: 14px;"></i>
          <h3>All Diagnostic Questions Evaluated!</h3>
          <p style="color: var(--text-muted); margin-top: 8px;">Your skill profile, confidence scores, and personalized roadmap have been adapted based on your performance.</p>
          <button class="btn-primary" id="arena-btn-view-roadmap" style="margin-top: 20px;">View Updated Roadmap</button>
        </div>
      `;
      arenaOptionsContainer.innerHTML = '';
      arenaBtnSubmit.style.display = 'none';
      arenaBtnSkip.style.display = 'none';

      document.getElementById('arena-btn-view-roadmap')?.addEventListener('click', () => {
        switchView('roadmap');
      });
      return;
    }

    arenaBtnSubmit.style.display = 'inline-flex';
    arenaBtnSkip.style.display = 'inline-flex';

    arenaSkillName.textContent = `${q.skill}: ${q.concept}`;
    arenaDifficultyPill.textContent = `Level ${q.difficulty} (${getDifficultyLabel(q.difficulty)})`;
    arenaTypeIndicator.textContent = `${capitalize(q.type)} Assessment`;

    // Render formatted prompt (handling markdown code blocks)
    let formattedPrompt = q.prompt;
    if (formattedPrompt.includes('```')) {
      formattedPrompt = formattedPrompt.replace(/```(sql|python)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    }
    arenaPromptText.innerHTML = formattedPrompt;

    // Render options
    arenaOptionsContainer.innerHTML = '';
    q.options.forEach((optText, idx) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      card.setAttribute('data-idx', idx);
      card.innerHTML = `
        <div class="option-radio"></div>
        <div class="option-text">${optText}</div>
      `;

      card.addEventListener('click', () => {
        if (arenaFeedbackCard.classList.contains('show')) return; // locked after submit
        document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedAnswerIndex = idx;
        arenaBtnSubmit.disabled = false;
      });

      arenaOptionsContainer.appendChild(card);
    });
  }

  function getDifficultyLabel(diff) {
    switch (diff) {
      case 1: return "Beginner";
      case 2: return "Basic";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Professional";
      default: return "Adaptive";
    }
  }

  function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  arenaBtnSubmit.addEventListener('click', () => {
    if (selectedAnswerIndex === null) return;

    const result = agentCore.submitAssessmentAnswer(selectedAnswerIndex);
    const evalData = result.evaluation;

    // Mark visual cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach((card, idx) => {
      if (idx === evalData.correctAnswer) {
        card.classList.add('correct');
      }
      if (idx === evalData.userAnswer && !evalData.isCorrect) {
        card.classList.add('incorrect');
      }
    });

    // Show feedback card
    arenaFeedbackCard.classList.add('show');
    if (evalData.isCorrect) {
      arenaFeedbackCard.classList.add('correct-feedback');
      feedbackTitle.innerHTML = `<i class="fa-solid fa-circle-check"></i> Correct Solution!`;
    } else {
      arenaFeedbackCard.classList.add('incorrect-feedback');
      feedbackTitle.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Concept Gap Detected`;
    }

    feedbackExplanation.textContent = evalData.explanation;
    feedbackAdaptationText.textContent = `[Adaptive Engine]: ${evalData.adaptation}`;

    arenaBtnSubmit.disabled = true;
    updateJsonViewer();
    renderDashboard();
  });

  feedbackBtnNext.addEventListener('click', () => {
    if (agentCore.activeAssessmentSession?.currentQuestion) {
      renderActiveQuestion(agentCore.activeAssessmentSession.currentQuestion);
    } else {
      renderActiveQuestion(null);
    }
  });

  arenaBtnSkip.addEventListener('click', () => {
    startDiagnosticSession();
  });

  // ==========================================
  // 5. PERSONALIZED ROADMAP CONTROLLER
  // ==========================================
  function renderRoadmap() {
    const milestones = agentCore.generatePersonalizedRoadmap();
    const container = document.getElementById('roadmap-timeline-container');
    container.innerHTML = '';

    milestones.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = `milestone-item ${m.status.toLowerCase().replace(/_/g, '-')}`;

      let statusBadgeColor = 'var(--text-dim)';
      if (m.status === 'IN_PROGRESS') statusBadgeColor = 'var(--accent-primary)';
      if (m.status === 'QUEUED') statusBadgeColor = 'var(--accent-amber)';

      item.innerHTML = `
        <div class="milestone-node">${idx + 1}</div>
        <div class="milestone-header">
          <div>
            <h3>
              ${m.skill}
              <span class="hero-badge" style="background: rgba(99,102,241,0.2); color: #c7d2fe; font-size: 0.7rem;">${m.category}</span>
            </h3>
            <span style="font-size: 0.75rem; color: var(--text-dim);">
              ${m.gap > 0 ? `Bridging Gap: Lvl ${m.current_level} → Lvl ${m.target_level}` : 'Capstone Integration'} • Priority: ${m.priority}
            </span>
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <span style="font-size: 0.75rem; font-weight: 700; color: ${statusBadgeColor}; text-transform: uppercase;">${m.status.replace(/_/g, ' ')}</span>
            <button class="btn-primary btn-start-milestone" data-skill="${m.skill}" style="padding: 6px 14px; font-size: 0.78rem;">
              ${m.status === 'IN_PROGRESS' ? 'Resume' : 'Start'}
            </button>
          </div>
        </div>

        <div style="font-size: 0.8rem; color: var(--text-muted);">
          Prerequisites: ${m.prerequisites.length > 0 ? m.prerequisites.join(", ") : 'None (Foundational)'}
        </div>

        <div class="milestone-steps">
          ${m.steps.map(s => `
            <div class="step-chip">
              <i class="fa-solid ${s.type === 'LESSON' ? 'fa-book-open' : s.type === 'PRACTICE_TASK' ? 'fa-code' : 'fa-check'}"></i>
              <span>${s.title}</span>
              <span style="color: var(--accent-cyan); font-size: 0.7rem;">(${s.estimatedHours}h)</span>
            </div>
          `).join('')}
        </div>
      `;

      container.appendChild(item);
    });

    document.querySelectorAll('.btn-start-milestone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const skill = e.target.closest('button').getAttribute('data-skill');
        renderLesson(skill);
        switchView('learning');
      });
    });
  }

  document.getElementById('btn-regenerate-roadmap')?.addEventListener('click', () => {
    renderRoadmap();
  });

  // ==========================================
  // 6. ADAPTIVE LESSON CONTROLLER
  // ==========================================
  function renderLesson(topic = "SQL") {
    const lesson = agentCore.generatePersonalizedLesson(topic);

    document.getElementById('lesson-topic-title').textContent = lesson.title;
    document.getElementById('lesson-depth-badge').textContent = `${capitalize(lesson.depthMode)} Mode (Lvl ${lesson.proficiency})`;
    document.getElementById('lesson-step-what').textContent = lesson.structure.what_it_is;
    document.getElementById('lesson-step-why').textContent = lesson.structure.why_it_matters;
    document.getElementById('lesson-step-exp').textContent = lesson.structure.explanation;
    document.getElementById('lesson-step-code').textContent = lesson.structure.example_code;
    document.getElementById('lesson-step-practice').textContent = lesson.structure.practice_question;
    document.getElementById('lesson-step-hint').textContent = lesson.structure.feedback_hint;

    // Spaced Revision check
    const revAlert = document.getElementById('spaced-revision-alert-box');
    if (agentCore.spacedRevisionQueue.length > 0) {
      revAlert.style.display = 'flex';
      document.getElementById('rev-concept-name').textContent = agentCore.spacedRevisionQueue[0].concept;
    } else {
      revAlert.style.display = 'none';
    }
  }

  document.getElementById('btn-start-revision')?.addEventListener('click', () => {
    const rev = agentCore.spacedRevisionQueue[0];
    if (rev) {
      renderLesson(rev.skill);
      agentCore.resolveRevisionItem(rev.id);
      document.getElementById('spaced-revision-alert-box').style.display = 'none';
      renderDashboard();
      updateJsonViewer();
    }
  });

  document.getElementById('btn-switch-lesson-topic')?.addEventListener('click', () => {
    const currentRole = agentCore.profile.learner.target_role;
    const skills = Object.keys(agentCore.roleMaps[currentRole]?.competencies || { SQL: 1 });
    const chosen = prompt(`Select a competency to learn:\n${skills.join(", ")}`, skills[0]);
    if (chosen && skills.includes(chosen)) {
      renderLesson(chosen);
    }
  });

  // ==========================================
  // 7. PROJECT STUDIO & RUBRIC EVALUATOR
  // ==========================================
  function renderProjectStudio() {
    const role = agentCore.profile.learner.target_role;
    const projects = agentCore.roleProjects[role] || agentCore.roleProjects["Data Analyst"];
    currentProject = projects[0];

    document.getElementById('proj-tier-badge').textContent = currentProject.tier.toUpperCase();
    document.getElementById('proj-skills-tested').textContent = `Skills: ${currentProject.skills_tested.join(", ")}`;
    document.getElementById('proj-title').textContent = currentProject.title;
    document.getElementById('proj-objective').textContent = currentProject.objective;

    const tasksList = document.getElementById('proj-tasks-list');
    tasksList.innerHTML = '';
    currentProject.tasks.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      tasksList.appendChild(li);
    });

    document.getElementById('proj-submission-code').value = '';
    document.getElementById('proj-evaluation-result').style.display = 'none';
  }

  document.getElementById('btn-load-sample-solution')?.addEventListener('click', () => {
    const codeBox = document.getElementById('proj-submission-code');
    codeBox.value = `-- End-to-end cohort retention and churn query with window functions
WITH customer_cohort AS (
  SELECT
    customer_id,
    DATE_TRUNC('month', MIN(order_date)) AS cohort_month
  FROM orders
  GROUP BY customer_id
),
monthly_activity AS (
  SELECT
    o.customer_id,
    DATE_TRUNC('month', o.order_date) AS activity_month,
    SUM(o.order_total) as monthly_revenue
  FROM orders o
  WHERE o.order_total > 0
  GROUP BY o.customer_id, DATE_TRUNC('month', o.order_date)
)
SELECT
  c.cohort_month,
  a.activity_month,
  COUNT(DISTINCT a.customer_id) AS active_users,
  SUM(a.monthly_revenue) as cohort_revenue,
  DENSE_RANK() OVER(PARTITION BY c.cohort_month ORDER BY a.activity_month) AS period_number
FROM customer_cohort c
LEFT JOIN monthly_activity a ON c.customer_id = a.customer_id
GROUP BY c.cohort_month, a.activity_month
ORDER BY c.cohort_month, a.activity_month;

/* Executive Business Insight:
   Month 3 cohort drop-off averages 32%. We recommend triggering an automated
   re-engagement discount campaign at Day 45 to protect Customer Lifetime Value (LTV).
*/`;
  });

  document.getElementById('btn-submit-project')?.addEventListener('click', () => {
    const submissionText = document.getElementById('proj-submission-code').value.trim();
    if (!submissionText) {
      alert("Please paste your solution code or click 'Load Sample Solution'.");
      return;
    }

    const evaluation = agentCore.evaluateProjectSubmission(currentProject?.id || "default", submissionText);
    const resultBox = document.getElementById('proj-evaluation-result');
    const statusTitle = document.getElementById('eval-status-title');
    const passedPill = document.getElementById('eval-passed-pill');
    const feedbackBody = document.getElementById('eval-feedback-body');

    resultBox.style.display = 'block';
    statusTitle.textContent = `Overall Score: ${evaluation.overallScore}% (${evaluation.isPassed ? "PASSED" : "REVISE & RESUBMIT"})`;
    passedPill.textContent = evaluation.isPassed ? "Competency Verified" : "Needs Refinement";
    passedPill.style.background = evaluation.isPassed ? "rgba(16,185,129,0.15)" : "rgba(244,63,94,0.15)";
    passedPill.style.color = evaluation.isPassed ? "var(--accent-emerald)" : "var(--accent-rose)";

    feedbackBody.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px;">
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-dim);">Correctness</div>
          <strong style="color: var(--accent-cyan); font-size: 1rem;">${evaluation.rubricScores.correctness}%</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-dim);">Efficiency</div>
          <strong style="color: var(--accent-emerald); font-size: 1rem;">${evaluation.rubricScores.efficiency}%</strong>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 8px; border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 0.72rem; color: var(--text-dim);">Applicability</div>
          <strong style="color: var(--accent-purple); font-size: 1rem;">${evaluation.rubricScores.real_world_applicability}%</strong>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <strong style="color: var(--accent-emerald);">Demonstrated Strengths:</strong>
        <ul style="padding-left: 18px; margin-top: 4px;">
          ${evaluation.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>

      ${evaluation.actionable_recommendations.length > 0 ? `
        <div style="margin-top: 8px;">
          <strong style="color: var(--accent-amber);">Actionable Mentor Next Steps:</strong>
          <ul style="padding-left: 18px; margin-top: 4px;">
            ${evaluation.actionable_recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    `;

    renderDashboard();
    renderGapMatrix();
    updateJsonViewer();
  });

  // ==========================================
  // 8. AI MENTOR CHAT CONTROLLER
  // ==========================================
  const chatMessagesContainer = document.getElementById('chat-messages-container');
  const chatUserInput = document.getElementById('chat-user-input');
  const btnSendChat = document.getElementById('btn-send-chat');

  async function handleSendMessage() {
    const userMsg = chatUserInput.value.trim();
    if (!userMsg) return;

    // Append User message
    const userBubble = document.createElement('div');
    userBubble.className = 'chat-bubble user';
    userBubble.textContent = userMsg;
    chatMessagesContainer.appendChild(userBubble);
    chatUserInput.value = '';
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    // Loading indicator
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-bubble assistant';
    loadingBubble.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Mentor reasoning over profile...`;
    chatMessagesContainer.appendChild(loadingBubble);
    chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;

    // Query LLM Service
    try {
      const response = await llmService.sendQuery(userMsg, agentCore.profile, agentCore);
      loadingBubble.remove();

      const assistantBubble = document.createElement('div');
      assistantBubble.className = 'chat-bubble assistant';
      
      const liveTag = response.isLiveGemini ? `<span style="font-size: 0.68rem; background: var(--accent-primary); color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Gemini Live</span>` : '';
      
      assistantBubble.innerHTML = `
        <div style="font-weight: 600; color: var(--accent-cyan); margin-bottom: 6px;">
          AI Upskilling Mentor ${liveTag}
        </div>
        <div>${response.message || response.raw}</div>
        <div class="chat-telemetry-box">
          ${JSON.stringify({
            target_role: agentCore.profile.learner.target_role,
            recommended_next_step: response.recommended_next_step || { type: "CONTINUE_ROADMAP" }
          }, null, 2)}
        </div>
      `;

      chatMessagesContainer.appendChild(assistantBubble);
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    } catch (err) {
      loadingBubble.innerHTML = `<span style="color: var(--accent-rose);">Error connecting to AI mentor: ${err.message}</span>`;
    }
  }

  btnSendChat.addEventListener('click', handleSendMessage);
  chatUserInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  // ==========================================
  // PROFILE JSON DRAWER
  // ==========================================
  function updateJsonViewer() {
    liveJsonContent.textContent = JSON.stringify(agentCore.profile, null, 2);
  }

  btnToggleJson.addEventListener('click', () => {
    updateJsonViewer();
    jsonDrawer.classList.toggle('open');
  });

  btnCloseJson.addEventListener('click', () => {
    jsonDrawer.classList.remove('open');
  });

  btnCopyJson.addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(agentCore.profile, null, 2));
    btnCopyJson.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
    setTimeout(() => {
      btnCopyJson.innerHTML = `<i class="fa-solid fa-copy"></i> Copy JSON`;
    }, 2000);
  });

  btnResetProfile.addEventListener('click', () => {
    if (confirm("Reset profile back to default template?")) {
      agentCore.resetProfile(headerRoleSelect.value);
      renderDashboard();
      renderGapMatrix();
      renderRoadmap();
      updateJsonViewer();
    }
  });

  // ==========================================
  // SETTINGS MODAL
  // ==========================================
  btnOpenSettings.addEventListener('click', () => {
    inputGeminiKey.value = llmService.getApiKey();
    settingsModal.classList.add('open');
  });

  btnCloseSettings.addEventListener('click', () => settingsModal.classList.remove('open'));
  btnCancelSettings.addEventListener('click', () => settingsModal.classList.remove('open'));

  btnSaveSettings.addEventListener('click', () => {
    llmService.setApiKey(inputGeminiKey.value);
    settingsModal.classList.remove('open');
    alert("AI settings saved! " + (llmService.hasApiKey() ? "Live Gemini API enabled." : "Using offline local expert engine."));
  });

  // Initial Render
  renderDashboard();
  renderGapMatrix();
  updateJsonViewer();
});

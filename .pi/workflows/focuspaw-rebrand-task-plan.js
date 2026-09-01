export const meta = {
  name: 'focuspaw-rebrand-task-plan',
  description: 'Generate and validate a detailed FocusPaw rebrand and MIT open-source migration plan',
  phases: [
    { title: 'Extract requirements', detail: 'Map current PRD, brand, UX, code, and OSS migration constraints' },
    { title: 'Plan sprints', detail: 'Define POC, MVP Foundation, MVP Completion, and Full Features scopes' },
    { title: 'Generate sprint tasks', detail: 'Create detailed tasks for each sprint in parallel' },
    { title: 'Resolve dependencies', detail: 'Build the DAG, waves, critical path, and final markdown' },
  ],
}

const REQUIREMENTS_SCHEMA = {
  type: 'object',
  required: ['vision', 'current_state', 'migration_requirements', 'prd_coverage', 'non_functional_requirements', 'technical_constraints', 'ambiguities', 'assumptions'],
  properties: {
    vision: { type: 'string' },
    current_state: { type: 'array', items: { type: 'string' }, minItems: 5 },
    migration_requirements: {
      type: 'array',
      minItems: 12,
      items: {
        type: 'object',
        required: ['id', 'name', 'description', 'source_refs', 'acceptance_signals', 'risk', 'dependencies'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          source_refs: { type: 'array', items: { type: 'string' }, minItems: 1 },
          acceptance_signals: { type: 'array', items: { type: 'string' }, minItems: 2 },
          risk: { type: 'string' },
          dependencies: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    prd_coverage: {
      type: 'array',
      minItems: 16,
      items: {
        type: 'object',
        required: ['requirement', 'source_ref', 'migration_obligation'],
        properties: {
          requirement: { type: 'string' },
          source_ref: { type: 'string' },
          migration_obligation: { type: 'string' },
        },
      },
    },
    non_functional_requirements: {
      type: 'object',
      required: ['performance', 'security_privacy', 'accessibility', 'compatibility', 'quality'],
      properties: {
        performance: { type: 'array', items: { type: 'string' } },
        security_privacy: { type: 'array', items: { type: 'string' } },
        accessibility: { type: 'array', items: { type: 'string' } },
        compatibility: { type: 'array', items: { type: 'string' } },
        quality: { type: 'array', items: { type: 'string' } },
      },
    },
    technical_constraints: { type: 'array', items: { type: 'string' }, minItems: 8 },
    ambiguities: {
      type: 'array',
      minItems: 6,
      items: {
        type: 'object',
        required: ['area', 'question', 'impact'],
        properties: {
          area: { type: 'string' },
          question: { type: 'string' },
          impact: { type: 'string' },
        },
      },
    },
    assumptions: { type: 'array', items: { type: 'string' } },
  },
}

const PLAN_SCHEMA = {
  type: 'object',
  required: ['project_name', 'strategy_summary', 'sprints', 'hard_gates', 'critical_path_hypothesis', 'notes'],
  properties: {
    project_name: { type: 'string' },
    strategy_summary: { type: 'string' },
    sprints: {
      type: 'array',
      minItems: 4,
      maxItems: 4,
      items: {
        type: 'object',
        required: ['sprint_number', 'phase', 'title', 'focus', 'target_task_count', 'task_blueprints', 'nfr'],
        properties: {
          sprint_number: { type: 'integer', minimum: 1, maximum: 4 },
          phase: { type: 'string', enum: ['POC', 'MVP Foundation', 'MVP Completion', 'Full Features'] },
          title: { type: 'string' },
          focus: { type: 'string' },
          target_task_count: { type: 'integer', minimum: 3, maximum: 10 },
          task_blueprints: {
            type: 'array',
            minItems: 3,
            maxItems: 10,
            items: {
              type: 'object',
              required: ['task_id', 'title', 'objective', 'requirement_refs', 'depends_on'],
              properties: {
                task_id: { type: 'string', pattern: '^Task [1-4]\\.[0-9]+$' },
                title: { type: 'string' },
                objective: { type: 'string' },
                requirement_refs: { type: 'array', items: { type: 'string' }, minItems: 1 },
                depends_on: { type: 'array', items: { type: 'string', pattern: '^Task [1-4]\\.[0-9]+$' } },
              },
            },
          },
          nfr: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    hard_gates: { type: 'array', items: { type: 'string' }, minItems: 3 },
    critical_path_hypothesis: { type: 'array', items: { type: 'string', pattern: '^Task [1-4]\\.[0-9]+$' } },
    notes: { type: 'array', items: { type: 'string' } },
  },
}

const SPRINT_SCHEMA = {
  type: 'object',
  required: ['sprint_number', 'phase', 'title', 'focus', 'tasks'],
  properties: {
    sprint_number: { type: 'integer', minimum: 1, maximum: 4 },
    phase: { type: 'string', enum: ['POC', 'MVP Foundation', 'MVP Completion', 'Full Features'] },
    title: { type: 'string' },
    focus: { type: 'string' },
    tasks: {
      type: 'array',
      minItems: 3,
      maxItems: 10,
      items: {
        type: 'object',
        required: ['task_id', 'title', 'description', 'acceptance_criteria', 'effort_days', 'depends_on', 'workstream', 'priority', 'implementation_notes', 'prd_reference', 'requirement_refs'],
        properties: {
          task_id: { type: 'string', pattern: '^Task [1-4]\\.[0-9]+$' },
          title: { type: 'string' },
          description: { type: 'string' },
          acceptance_criteria: { type: 'array', items: { type: 'string' }, minItems: 3 },
          effort_days: { type: 'integer', minimum: 1, maximum: 3 },
          depends_on: { type: 'array', items: { type: 'string', pattern: '^Task [1-4]\\.[0-9]+$' } },
          workstream: { type: 'string' },
          priority: { type: 'string', enum: ['blocker', 'P0', 'P1', 'P2'] },
          implementation_notes: { type: 'array', items: { type: 'string' }, minItems: 2 },
          prd_reference: { type: 'string' },
          requirement_refs: { type: 'array', items: { type: 'string' }, minItems: 1 },
        },
      },
    },
  },
}

const FINAL_SCHEMA = {
  type: 'object',
  required: ['markdown', 'summary', 'validation'],
  properties: {
    markdown: { type: 'string', minLength: 12000 },
    summary: {
      type: 'object',
      required: ['sprint_count', 'total_tasks', 'total_effort_days', 'critical_path', 'critical_path_days', 'waves', 'bottlenecks', 'ambiguity_count'],
      properties: {
        sprint_count: { type: 'integer' },
        total_tasks: { type: 'integer' },
        total_effort_days: { type: 'integer' },
        critical_path: { type: 'array', items: { type: 'string' } },
        critical_path_days: { type: 'integer' },
        waves: { type: 'integer' },
        bottlenecks: { type: 'array', items: { type: 'string' } },
        ambiguity_count: { type: 'integer' },
      },
    },
    validation: {
      type: 'object',
      required: ['task_ids_unique', 'references_resolve', 'dag', 'all_tasks_complete', 'prd_covered', 'phase_split_explicit'],
      properties: {
        task_ids_unique: { type: 'boolean' },
        references_resolve: { type: 'boolean' },
        dag: { type: 'boolean' },
        all_tasks_complete: { type: 'boolean' },
        prd_covered: { type: 'boolean' },
        phase_split_explicit: { type: 'boolean' },
      },
    },
  },
}

function compactForSprint(sprint, requirements) {
  const index = requirements.migration_requirements.map((r) => ({ id: r.id, name: r.name }))
  return {
    directive: args.directive,
    project: args.project,
    new_brand: args.new_brand,
    output_path: args.output_path,
    sprint: sprint,
    requirement_index: index,
  }
}

function sprintPrompt(c, attempt) {
  const guard = attempt > 0
    ? 'A previous attempt failed structured-output validation. Be rigorous: every property must match the schema and be non-empty; use exact task IDs; return valid JSON only.'
    : 'Be rigorous: every property must match the schema and be non-empty; use exact task IDs; return valid JSON only.'
  return `${guard}

You are the sprint-worker for Sprint ${c.sprint.sprint_number}. Research only; do not modify files.

Project directive: ${c.directive}
Your sprint blueprint: ${JSON.stringify(c.sprint)}
Requirement index (id => name): ${JSON.stringify(c.requirement_index)}

Generate exactly the blueprint tasks for this sprint, preserving every task ID and title intent. Each task must:
- Be actionable and independently reviewable in 1-3 active developer days.
- Have a concise what/why description grounded in the existing repository and user directive.
- Have at least 3 specific, testable acceptance criteria covering happy path, edge/failure handling, and verification.
- Use explicit dependencies: [] means None; otherwise only existing Task X.Y IDs from the blueprint dependencies.
- Include implementation notes naming likely authoritative files/surfaces without pretending implementation has already happened.
- Include a precise PRD Reference string. Where the rebrand is absent or contradictory, cite "User directive: FocusPaw + MIT" plus the relevant current PRD/Brand/UX section.
- Avoid new telemetry, cloud services, permissions, broad internal identifier renames, or Git-history rewriting.
- Preserve user data and extension identity; generated output must come from source builds.
- Treat external legal/store review waiting time as outside effort_days.

Do not collapse full regression into vague QA: criteria must identify concrete product areas and recorded commands where relevant.`
}

phase('Extract requirements')
const requirements = await agent(`
You are the requirements-extractor for an existing-product migration plan. Research only; do not modify files.

Goal: ${args.directive}
Primary source: ${args.prd_path}
Supporting sources: phase-1-requirements/brand_kit.md, phase-1-requirements/ux_design.md, phase-1-requirements/pricing_strategy.md.
Current public/release sources: README.md, PRIVACY.md, STORE_LISTING.md, CHANGELOG.md, LICENSE, manifest.json, package.json, landing-page/, src/, assets/, scripts/, tests/, .github/.

This is a rebrand of a working Chrome MV3 extension, not a rebuild. Inspect the repository and extract migration requirements. The current PRD, UX, and brand kit still mandate FocusBear and a bear persona, while the user explicitly requests FocusPaw and MIT open source. Treat an approved rebrand addendum/decision record as required before claiming PRD traceability.

Known constraints to preserve:
- MIT LICENSE already exists; do not assume the product-name change changes the legal copyright holder.
- Preserve Chrome Web Store item/signing identity if one exists, installed-user storage, visit history, limits, focus score/streaks, preferences/theme, badge/notification state, dynamic DNR rules, exports, and rollback ability.
- Do not rename stable storage keys or internal compatibility identifiers without an explicit migration and old-version-to-new-version test.
- Keep all data local; no telemetry, remote fonts, CDNs, remote assets, new permissions, or external APIs.
- Preserve PRD behavior: focus tracking, radial graph, local storage/export, time filters, search, limits, countdowns, blocking, streaks/averages, graph export where applicable, and settings.
- Preserve performance, Chrome 100+, WCAG 2.1 AA, keyboard access, reduced motion, CSP, deterministic builds, tests, lint, and CI.
- Rebuild generated landing-page/dist artifacts from authoritative source; never hand-edit hashed bundles.
- Historical changelog/spec/release references may remain only under a documented allowlist and "formerly FocusBear" policy; do not rewrite Git history.
- Name/trademark/domain/social/store availability, mascot direction, canonical casing/slug, legal holder/year, repository rename, production store ID/status, support contact, version bump, and historical-reference policy are unresolved.
- The exposed Git credential incident is operational security debt, not a product feature; include credential rotation as a repository-security prerequisite only if it belongs in this plan.

Return an exhaustive structured requirement set. Include every PRD feature and NFR in prd_coverage so the final plan can map each to regression work. Separate external waiting time from 1-3 active engineering-day estimates later.
`, { label: 'requirements:focuspaw', phase: 'Extract requirements', schema: REQUIREMENTS_SCHEMA, agentType: 'codebase-researcher', effort: 'high' })

if (!requirements) return { error: 'Requirements extraction failed', phase: 'extract' }

phase('Plan sprints')
const plan = await agent(`
You are the sprint-planner. Research only; do not modify files.

Create exactly four migration sprints for FocusPaw using the extracted requirements below:
${JSON.stringify(requirements)}

Plan 24-32 total tasks, each later sized to 1-3 active developer days, with at least 3 tasks per sprint. Use exactly these phase labels in this order:
1. POC — rebrand feasibility and safety contract
2. MVP Foundation — canonical brand, extension/public-source implementation, compatibility, MIT/open-source foundation
3. MVP Completion — public surfaces, full PRD regression, release candidate and controlled release readiness
4. Full Features — optional repository/community automation and post-release polish

Enforce these gates and boundaries:
- Name/channel clearance, approved brand direction, Chrome identity/data compatibility contract, and license/asset provenance must gate implementation.
- Add/update canonical PRD/UX/brand documentation as an implementation task because current sources contradict FocusPaw.
- Repository rename must not block extension/store release.
- Open-source readiness must cover correct MIT copyright attribution, third-party/asset provenance, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, support/maintainer guidance, issue/PR templates, and reproducible verification.
- Separate source changes from generated artifacts; include a stale-brand/link scan with an explicit historical/compatibility allowlist.
- Include old-version → candidate update-in-place testing under the same extension identity and realistic seeded data.
- Include functional regression across every PRD feature, plus privacy/security, accessibility, performance, deterministic build, and packaging checks.
- Release/deployment remains a planned task requiring explicit human approval; do not perform it.
- Use stable IDs exactly in the form Task <sprint>.<index>. Dependencies may reference only task blueprints in this plan and must form a DAG.

Each blueprint needs an action-oriented title, objective, requirement refs, and dependencies. Identify a plausible critical-path chain but leave exact calculation to the resolver.
`, { label: 'planner:focuspaw', phase: 'Plan sprints', schema: PLAN_SCHEMA, agentType: 'Plan', effort: 'high' })

if (!plan) return { error: 'Sprint planning failed', phase: 'plan', requirements }

phase('Generate sprint tasks')
function runSprint(sprint) {
  const c = compactForSprint(sprint, requirements)
  return agent(sprintPrompt(c, 0), { label: `sprint:${sprint.sprint_number}`, phase: 'Generate sprint tasks', schema: SPRINT_SCHEMA, agentType: 'general-purpose', effort: 'high' })
    .then((primary) => primary || agent(sprintPrompt(c, 1), { label: `sprint:${sprint.sprint_number}-retry`, phase: 'Generate sprint tasks', schema: SPRINT_SCHEMA, agentType: 'general-purpose', effort: 'high' }))
}
const sprintResults = (await parallel(plan.sprints.map((s) => () => runSprint(s)))).filter(Boolean)

if (sprintResults.length !== 4) {
  const failed = plan.sprints.map((s) => s.sprint_number).filter((n) => !sprintResults.some((r) => r.sprint_number === n))
  return { error: 'One or more sprint workers failed', phase: 'sprints', failed_sprints: failed, current_state: requirements.current_state, plan }
}

phase('Resolve dependencies')
const finalResult = await agent(`
You are the dependency-resolver and final technical editor. Research only; do not modify files.

Generate the complete markdown for ${args.output_path}, dated ${args.date}, from:
REQUIREMENTS=${JSON.stringify(requirements)}
PLAN=${JSON.stringify(plan)}
SPRINT_TASKS=${JSON.stringify(sprintResults)}

Project directive: ${args.directive}

Repair dependency references as needed, without changing scope. Build a complete DAG and derive every Blocks value from dependencies. Compute waves and the longest effort-weighted critical path. External legal/store wait time is not included in developer-day totals.

The markdown must be detailed, reviewable, and include, in this order:
1. Title "Development Tasks — FocusPaw Rebrand & MIT Open-Source Migration", source PRD path, user directive, generation date, existing-product migration note.
2. Overview with explicit POC/MVP/post-MVP split and goals.
3. Sprint overview table with exactly 4 sprints, phase labels, task counts, effort.
4. Scope guardrails and hard gates.
5. Risk/bottleneck analysis.
6. Dependency map: complete dependency table for every task with Task ID, title, Depends On, Blocks, Wave, effort; parallel execution waves; cross-sprint dependencies.
7. Explicit critical path chain and summed active developer days.
8. Four sprint sections. Every task heading must be exactly "### Task X.Y: Action-oriented title" and every task block must contain all labels exactly: **Description**, **Acceptance Criteria**, **Dependencies**, **Blocks**, **Effort**, **Workstream**, **PRD Reference**. Use at least 3 checkbox criteria per task. Dependencies must be "None" or existing full "Task X.Y" IDs. Effort must be 1-3 days.
9. Requirement-to-task coverage matrix covering the user directive, every PRD feature (Focus Visit Tracking, Radial Graph Visualization, Local Data Storage/export, Time Range Filters, Search Bar, Daily Visit Limits, Countdown Bubbles, Over-Limit Redirect, Streaks & Averages, Export Graph, Settings Panel), and all performance/security/compatibility/accessibility/infrastructure requirements.
10. Dedicated "Flagged Ambiguities" table including name clearance, mascot, legal holder/year, repo rename, Chrome store status/ID/signing, support contact/domain, versioning, historical references, asset provenance, and pricing/open-source conflict. Do not silently decide them.
11. Assumptions, out of scope, definition of done, and next steps that say to review Sprint 1 / Wave 1 first.
12. Validation checklist.

Quality gates:
- 15-80 total tasks and >=3 tasks per sprint.
- Unique Task <sprint>.<index> IDs.
- Every dependency resolves, no self-dependency, no cycles.
- Every task has all required labels and >=2 testable criteria (use >=3).
- Every PRD requirement maps to at least one task.
- Explicit POC/MVP/Full Features labels and critical path.
- Preserve historical FocusBear references where appropriate; zero unexplained active-brand references is the target.
- No claim that MIT/open-source work is absent: LICENSE exists today, so plan validation/correction and governance rather than blindly "adding MIT".

Return markdown only inside the structured markdown property, plus truthful summary and validation flags. Set a validation flag false if any condition is not met.
`, { label: 'resolver:focuspaw', phase: 'Resolve dependencies', schema: FINAL_SCHEMA, agentType: 'Plan', effort: 'high' })

return { finalResult, plan, sprintResults }
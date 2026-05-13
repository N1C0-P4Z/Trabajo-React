# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| Creating a pull request, opening a PR, or preparing changes for review | branch-pr | ~/.config/opencode/skills/branch-pr/SKILL.md |
| PRs over 400 lines, stacked PRs, review slices | chained-pr | ~/.config/opencode/skills/chained-pr/SKILL.md |
| Creating a GitHub issue, reporting a bug, or requesting a feature | issue-creation | ~/.config/opencode/skills/issue-creation/SKILL.md |
| When user says "judgment day", "judgment-day", "review adversarial", "dual review", "doble review", "juzgar", "que lo juzguen" | judgment-day | ~/.config/opencode/skills/judgment-day/SKILL.md |
| When user asks to create a new skill, add agent instructions, or document patterns for AI | skill-creator | ~/.config/opencode/skills/skill-creator/SKILL.md |
| Updating the skill registry | skill-registry | ~/.claude/skills/skill-registry/SKILL.md |
| Work-unit commits, commit splitting, chained PRs | work-unit-commits | ~/.config/opencode/skills/work-unit-commits/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### branch-pr
- Every PR MUST link an approved issue — no exceptions
- Every PR MUST have exactly one `type:*` label
- Branch naming: `^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)/[a-z0-9._-]+$`
- Commits MUST use conventional commits: `type(scope): description`
- Run shellcheck on modified scripts before push
- PR body MUST contain: linked issue (Closes #N), PR type, summary, changes table, test plan

### issue-creation
- Blank issues are disabled — MUST use a template
- Every issue gets `status:needs-review` automatically on creation
- A maintainer MUST add `status:approved` before any PR can be opened
- Questions go to Discussions, NOT issues
- Use Bug Report template for bugs, Feature Request template for enhancements
- Search existing issues for duplicates before creating

### go-testing
- Table-driven tests for multiple cases: define `tests := []struct{...}` with name/input/expected/wantErr
- Bubbletea TUI: test Model.Update() directly for state changes
- Full TUI flows: use teatest.NewTestModel() for integration testing
- Golden file testing: compare output against saved .golden files, use `-update` flag to refresh
- Mock dependencies for side effects — use interfaces
- File operations: use t.TempDir() for isolation

### judgment-day
- Launch TWO sub-agents via delegate in parallel (async, never sequential)
- Neither agent knows about the other — blind review, no cross-contamination
- Verdict synthesis: Confirmed (both found), Suspect (one found), Contradiction (disagree)
- WARNING classification: real (fix required) vs theoretical (report only, do NOT fix)
- Fix and re-judge: max 2 iterations, then ask user to continue or escalate
- Apply convergence threshold: 0 confirmed CRITICALs + 0 real WARNINGs = APPROVED

### skill-creator
- Create skill when pattern is reused repeatedly, NOT for one-off tasks
- Skill structure: `skills/{name}/SKILL.md` + optional `assets/` + optional `references/`
- Frontmatter REQUIRED: name, description (with Trigger), license: Apache-2.0, metadata.author/version
- Naming: `{technology}` generic, `{project}-{component}` project-specific
- assets/ for code templates/schemas, references/ for local docs (NOT web URLs)
- After creating: add to AGENTS.md registry

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/nicolas/Documentos/Trabajo-React/AGENTS.md | Main project context: stack, structure, API endpoints, Docker commands, architectural decisions |

## SDD Compact Rules

### General SDD Rules
- Engram persistence mode (no openspec/ directory)
- Strict TDD: DISABLED (no test runner detected)
- All SDD saves use `capture_prompt: false` for automated artifacts
- Use topic_key for evolving topics (upserts)
- Always resolve memory conflicts with mem_judge after mem_save

### Project-Specific Rules
- Backend: CommonJS (`require`/`module.exports`)
- Frontend: ESM (`import`/`export`)
- API versioning: all routes under `/api/v1/`
- Docker: never install packages on host, always use `docker compose exec`
- Prisma: never import directly in controllers/routes, always use repository pattern
- Error handling: always use `next(error)` in async controllers
- shadcn/ui: use `npx shadcn add <component>` inside frontend container

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.

<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0
Added sections: Core Principles, Quality Gates, Development Workflow, Governance
Modified principles: N/A (initial ratification)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gates align with 4 principles below
  ✅ .specify/templates/spec-template.md — User Scenarios section aligns with Testing Standards principle
  ✅ .specify/templates/tasks-template.md — Test tasks reflect mandatory coverage requirements
Deferred TODOs: none
-->

# Tour de Ridgewood Constitution

## Core Principles

### I. Code Quality

Every line of code MUST be clean, intentional, and maintainable by any team member without prior context.

- Functions and components MUST have a single, well-defined responsibility (Single Responsibility Principle).
- Code MUST be self-documenting: names of variables, functions, and modules MUST clearly express intent.
- Magic numbers and strings MUST be replaced with named constants.
- Dead code, commented-out blocks, and unused imports MUST NOT be merged to the main branch.
- All code MUST pass linting and formatting checks (configured per-project) before a pull request is approved.
- Complexity MUST be justified; if a simpler solution exists, it MUST be preferred.

### II. Testing Standards (NON-NEGOTIABLE)

Tests are first-class artifacts. No feature is considered complete without an accompanying, passing test suite.

- Test-Driven Development (TDD) is REQUIRED: tests MUST be written and reviewed before implementation begins.
  The Red → Green → Refactor cycle MUST be followed.
- Minimum coverage thresholds MUST be maintained: ≥80% line coverage for unit tests across all modules.
- Unit tests MUST cover all business logic, edge cases, and error paths identified in the feature spec.
- Integration tests MUST be written for: new API contracts, inter-service boundaries, and shared data schemas.
- Tests MUST be deterministic; flaky tests MUST be fixed or removed immediately — they MUST NOT be skipped.
- Test names MUST describe behavior in plain language (e.g., `returns empty array when no results found`).

### III. User Experience Consistency

Every user-facing surface MUST feel like it belongs to the same product.

- UI components MUST be drawn from the established design system; ad-hoc one-off styles are NOT permitted
  without design review.
- Navigation patterns, terminology, and interaction models MUST be consistent across all screens and flows.
- Error messages MUST be human-readable, actionable, and follow the project's tone-of-voice guidelines.
- All interactive elements MUST meet WCAG 2.1 AA accessibility standards (contrast ratios, focus states,
  ARIA labels).
- Loading, empty, and error states MUST be designed and implemented for every data-driven UI surface —
  omitting them is NOT acceptable.
- Any change to a shared component MUST be reviewed for downstream impact across all consumers.

### IV. Performance Requirements

Performance is a feature. Regressions MUST be caught before they reach production.

- Page/screen initial load MUST complete within 2 seconds on a median-spec device and a standard connection.
- API response times MUST meet p95 ≤ 300 ms for read operations and p95 ≤ 500 ms for write operations
  under expected load.
- Render-blocking resources MUST be minimized; critical-path assets MUST be code-split or lazy-loaded
  where applicable.
- No feature MUST introduce a measurable performance regression (>10% degradation vs. baseline) without
  explicit product sign-off and a documented mitigation plan.
- Performance benchmarks MUST be part of the CI pipeline; failures block merges.
- Memory leaks and unbounded resource consumption MUST be identified and resolved before release.

## Quality Gates

The following gates MUST be satisfied before any pull request is merged to the main branch:

1. **Linting & Formatting**: All linting and formatting checks pass with zero errors.
2. **Test Suite Green**: All unit and integration tests pass; no tests are skipped.
3. **Coverage Threshold**: Line coverage MUST be ≥80% across all changed modules.
4. **Performance Benchmark**: No registered benchmark regresses by more than 10% vs. the baseline.
5. **Accessibility Audit**: Automated accessibility checks (e.g., axe-core) report zero critical or
   serious violations on changed UI surfaces.
6. **Peer Review**: At least one team member has approved the pull request after reviewing for
   constitution compliance.

## Development Workflow

- Features MUST be developed on isolated branches following the `[###-feature-name]` naming convention.
- All feature branches MUST originate from the specification workflow (`/speckit.specify`) so that a
  spec, plan, and task list exist before implementation begins.
- Commits MUST be atomic and carry descriptive messages using the Conventional Commits format
  (e.g., `feat:`, `fix:`, `test:`, `chore:`).
- Merges to main MUST go through a pull request; direct pushes to main are NOT permitted.
- Failing CI MUST be addressed before any other work continues on that branch.

## Governance

This constitution supersedes all informal practices and verbal agreements. It is the authoritative
source of engineering standards for Tour de Ridgewood.

- Amendments MUST be proposed via a pull request that updates this file, states the rationale, and
  increments the version following semantic versioning rules (MAJOR for breaking principle changes,
  MINOR for additions, PATCH for clarifications).
- Amendments MUST be approved by at least two team members before merging.
- All pull request reviews MUST verify compliance with the four Core Principles.
- Exceptions to any principle MUST be documented inline with a `// EXCEPTION(constitution):` comment
  and rationale, tracked in the project issue tracker, and resolved within the next sprint.
- Constitution compliance MUST be reviewed at each sprint retrospective.

**Version**: 1.0.0 | **Ratified**: 2026-04-25 | **Last Amended**: 2026-04-25

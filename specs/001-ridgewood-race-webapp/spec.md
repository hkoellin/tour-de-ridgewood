# Feature Specification: Tour de Ridgewood Web Application

**Feature Branch**: `001-ridgewood-race-webapp`  
**Created**: April 25, 2026  
**Status**: Draft  
**Input**: User description: "I want to build a web app that models the tour de france website, https://www.letour.fr/en/. I'd like the front end to look very similar. The Route and Teams sections are the crux of the project. I will design stages and construct teams that'll participate. For reference, this is not a bike race but a running race over the course of days (stages). There will be 8 stages, each being routes that start in and around Ridgewood Queens. I'd like to enable Strava users to hook up their accounts to participate and when they run the stage, upload their time to the results."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the Route (Priority: P1)

A visitor (or participant) opens the Tour de Ridgewood website and explores the race route. They can see all 8 stages listed with their names, dates, start/end points, and a map or route description. Clicking a stage reveals full details about that stage including distance, elevation profile, and any notable waypoints.

**Why this priority**: The Route section is the core of the race experience and the first thing any visitor or runner needs to understand. Without it, the site has no value.

**Independent Test**: Navigate to the Route section. All 8 stages are listed. Clicking any stage opens a detail page showing the stage map, start/end location, and key route information. Delivers a complete informational experience about the race course.

**Acceptance Scenarios**:

1. **Given** a visitor opens the home page, **When** they click the "Route" navigation item, **Then** they see a list of all 8 stages with stage number, date, start location, end location, and stage type (e.g., flat, hilly).
2. **Given** the route list is visible, **When** the visitor clicks on a specific stage, **Then** they are taken to a stage detail page that shows a map of the route, distance, elevation, and a written description.
3. **Given** the stage detail page is open, **When** the visitor returns to the route list, **Then** all 8 stages remain visible and navigable without data loss.

---

### User Story 2 - Browse Teams & Runners (Priority: P2)

A visitor navigates to the Teams section and sees all participating teams. Each team has a name, logo/color, and a roster of runners. Clicking a team shows the full roster. Clicking a runner shows their profile including which stages they've completed and their recorded times.

**Why this priority**: Teams are the second pillar of the race experience. Participants need to see their team membership and rivals' rosters. This is central to the social and competitive aspect of the event.

**Independent Test**: Navigate to the Teams section. All teams are displayed. Clicking a team shows the roster. Clicking a runner shows their profile and any completed stage results. Fully testable without Strava integration being active.

**Acceptance Scenarios**:

1. **Given** a visitor opens the Teams page, **When** the page loads, **Then** all teams are displayed with their name, visual identity, and runner count.
2. **Given** a team is displayed, **When** the visitor clicks on it, **Then** a team detail view shows all registered runners with their names.
3. **Given** a runner's profile is open, **When** the visitor views it, **Then** they can see the runner's name, team affiliation, and a table of their stage results (stage number, date, finishing time) where available.
4. **Given** a runner has not yet run any stages, **When** viewing their profile, **Then** the results table is empty with a "No results yet" message.

---

### User Story 3 - Connect Strava Account (Priority: P3)

A runner who wants to participate visits the site and connects their Strava account. After authenticating with Strava, they are recognized as a registered participant linked to a team. Their profile on the site is associated with their Strava identity.

**Why this priority**: Strava connectivity is the participation mechanism — without it, result submission is not possible. However, the rest of the site (route browsing, team viewing) works without it, so it is lower priority than core content.

**Independent Test**: A user clicks "Connect with Strava," completes the OAuth authorization flow on Strava's website, and is returned to the Tour de Ridgewood site as an authenticated participant. Their name appears in their assigned team's roster. Entirely testable as a standalone authentication flow.

**Acceptance Scenarios**:

1. **Given** a visitor is not logged in, **When** they click "Connect with Strava," **Then** they are redirected to Strava's authorization page.
2. **Given** the visitor completes Strava authorization, **When** they are redirected back to the site, **Then** their Strava profile name and avatar are displayed in the site header and they are recognized as a participant.
3. **Given** a connected participant navigates to the Teams section, **When** the page loads, **Then** their name is highlighted within their team's roster.
4. **Given** Strava authorization fails or is denied, **When** the user is returned to the site, **Then** a clear error message explains the issue and offers a way to try again.

---

### User Story 4 - Submit Stage Result (Priority: P4)

A connected Strava participant who has run a stage visits the site and submits their result for that stage. The system retrieves their activity from Strava (or they manually confirm the activity) and records their finishing time. The result appears in the overall standings and on the stage results page.

**Why this priority**: Result submission is the operational heart of the race. It depends on Strava connectivity (P3) and requires the Route section (P1) to be in place, making it necessarily downstream.

**Independent Test**: A logged-in participant opens a stage page, initiates result submission, confirms their Strava activity, and sees their time recorded in the results table. The stage leaderboard updates to reflect the new result.

**Acceptance Scenarios**:

1. **Given** a connected participant has run a stage and has a matching Strava activity, **When** they click "Submit Result" on the stage page, **Then** they are shown their Strava activities from that stage date to select from.
2. **Given** the participant selects their activity, **When** they confirm the submission, **Then** their elapsed time is saved and appears on the stage results leaderboard.
3. **Given** a result has been submitted, **When** any visitor views the stage results, **Then** the participant's name, team, and finishing time are visible in ranked order.
4. **Given** a participant attempts to submit a result for a stage they have already submitted, **When** they try to submit again, **Then** they are informed they have already submitted and offered the ability to update their result.
5. **Given** a participant has no Strava activity matching the stage date, **When** they attempt to submit, **Then** they receive a clear message that no matching activity was found.

---

### User Story 5 - View Overall Standings (Priority: P5)

Any visitor can see an overall general classification (GC) leaderboard showing all participants ranked by cumulative time across completed stages, mirroring the "maillot jaune" concept of the Tour de France.

**Why this priority**: The standings page gives the race meaning and narrative. It represents the competitive core but depends on results being submitted first.

**Independent Test**: Open the Rankings/Standings page. Participants who have submitted results for at least one stage are listed in order of cumulative time. Visitors with no login can view standings without restriction.

**Acceptance Scenarios**:

1. **Given** multiple participants have submitted results, **When** the standings page is viewed, **Then** participants are sorted by total cumulative time (ascending) across all stages.
2. **Given** a participant has not completed all stages, **When** the standings are viewed, **Then** they still appear on the leaderboard with their partial cumulative time and a "DNF" or incomplete indicator for missing stages.
3. **Given** the standings page is open, **When** the visitor clicks a participant's name, **Then** they are taken to that runner's profile with all submitted stage results.

---

### User Story 6 - Race Administrator Manages Content (Priority: P6)

The race organizer (administrator) can log in to an admin area to create and edit stages (name, date, route description, map), create and manage teams, and assign runners to teams. This does not require Strava.

**Why this priority**: Admin content management is an operational prerequisite for the public-facing site to have any data, but it is internal to the organizer and can be delivered as a final phase.

**Independent Test**: An administrator logs into the admin area, creates a new stage with all required details, and the stage immediately appears in the public Route section. Also creates a team, adds runner names, and the team appears in the Teams section.

**Acceptance Scenarios**:

1. **Given** an authenticated administrator opens the admin area, **When** they create a new stage with name, date, start/end location, distance, and route description, **Then** the stage is saved and visible in the public Route section.
2. **Given** an administrator opens the Teams management page, **When** they create a team and add runners by name (or Strava handle), **Then** the team appears in the public Teams section with its roster.
3. **Given** an administrator attempts to access the admin area without credentials, **When** accessing admin URLs, **Then** they are redirected to a login page and access is denied.

---

### Edge Cases

- What happens when a runner's Strava activity is recorded under a slightly different time window than the stage date (e.g., ran close to midnight)?
- How does the system handle a runner who is not pre-registered to a team but tries to connect their Strava account?
- What happens if Strava's API is temporarily unavailable when a participant tries to submit a result?
- How does the standings calculation handle ties (identical cumulative times)?
- What happens if a stage's date or route details are edited after results have already been submitted for it?
- What if a runner attempts to submit a result for a stage that has not yet occurred (future stage)?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST display a home page visually modeled after letour.fr, featuring a hero section, navigation bar with Route and Teams as primary sections, and a race countdown or current stage highlight.
- **FR-002**: The Route section MUST display all 8 race stages with stage number, name, date, start location, end location, and stage type.
- **FR-003**: Each stage MUST have a dedicated detail page showing a route map (embedded or static image), distance, elevation profile description, and stage description.
- **FR-004**: The Teams section MUST display all participating teams with visual identity (name, color, optional logo) and runner count.
- **FR-005**: Each team MUST have a detail page listing all registered runners with links to individual runner profiles.
- **FR-006**: Each runner profile MUST display the runner's name, team affiliation, Strava connection status, and a table of their submitted stage results.
- **FR-007**: The system MUST support Strava OAuth2 authentication so runners can connect their Strava accounts to their site profile.
- **FR-008**: Connected participants MUST be able to submit a stage result by selecting a matching Strava activity from their activity feed.
- **FR-009**: The system MUST prevent duplicate result submissions for the same participant and stage (one result per participant per stage).
- **FR-010**: The system MUST allow a connected participant to update a previously submitted result.
- **FR-011**: The Results section for each stage MUST display a ranked leaderboard of all submitted times for that stage.
- **FR-012**: The Overall Standings page MUST rank all participants by total cumulative time across all completed stages.
- **FR-013**: An administrator account MUST exist with the ability to create, edit, and delete stages.
- **FR-014**: An administrator MUST be able to create teams, assign team colors/logos, and add runners (by name or Strava handle) to teams.
- **FR-015**: The system MUST gracefully handle Strava API failures and communicate the issue to the user without losing submitted data.
- **FR-016**: All stage, team, and runner data MUST be persistent across sessions.

### Key Entities

- **Stage**: Represents one race stage. Key attributes: stage number (1–8), name, date, start location, end location, distance, elevation profile, route map reference, stage type (flat/hilly/etc.), description.
- **Team**: A group of runners. Key attributes: name, color/visual identity, logo (optional), list of runners.
- **Runner**: A participant in the race. Key attributes: name, team membership, Strava account linkage, list of submitted results.
- **Stage Result**: A runner's performance on a single stage. Key attributes: runner reference, stage reference, elapsed time, submission date, source Strava activity ID.
- **Overall Standing**: Derived from Stage Results. Represents a runner's cumulative time across all stages they have completed.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Any visitor can view the full 8-stage route and all team/runner information without creating an account — measured by zero authentication prompts on public-facing pages.
- **SC-002**: A runner can connect their Strava account and complete their first result submission in under 5 minutes from visiting the site for the first time.
- **SC-003**: Stage results and overall standings reflect submitted times within 60 seconds of a participant confirming their submission.
- **SC-004**: 100% of stage result submissions are correctly persisted and appear in both the stage leaderboard and the overall standings.
- **SC-005**: The site is navigable on both desktop and mobile devices — measured by all core sections (Route, Teams, Results, Standings) being fully functional on screens 375px wide and above.
- **SC-006**: An administrator can create a new stage and have it appear on the public site within 2 minutes of saving.
- **SC-007**: The visual design is immediately recognizable as inspired by the Tour de France website — measured by similarity in color palette, typography style, stage card layout, and header navigation structure.

---

## Assumptions

- The race organizer (one administrator) will pre-populate all stage data and team rosters before the race begins. There is no self-registration for teams — runners are assigned by the organizer.
- Runners must have an existing Strava account to participate in result submission. No alternative result entry method is required for v1.
- Strava activities used for result submission will be public or "followers only" — private activities may not be accessible via the API.
- Each stage runs on a specific date; a runner's eligible Strava activities for submission are filtered to activities recorded on that stage's date.
- The race will feature exactly 8 stages; the system is designed around this fixed count but should not break if a stage is added or removed by the administrator.
- Mobile support is required (participants will check results on their phones after running), but a native mobile app is out of scope for v1.
- The site is publicly accessible — no login is required to browse the route, teams, or results. Only result submission requires Strava authentication.
- The race is an annual or one-time event; multi-year/multi-edition management is out of scope for v1.
- All stage routes start in or around Ridgewood, Queens, New York. Route maps will be embedded from a mapping service (e.g., Google Maps, Strava segment links, or GPX visualization) — the specific mapping tool is a technical decision for planning.
- The administrator will manage content via a simple admin interface, not a full CMS. Advanced content features (rich text editing, media galleries) are out of scope for v1.

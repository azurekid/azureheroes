---
name: game-security
description: 'Apply Azure Heroes secure contribution checks. Use for all game changes, accounts, API, dependencies, CDN scripts, CI, deployment, agent skills and preventing hidden backdoors.'
---

# Secure contribution workflow

## Trust boundaries
- Browser state, localStorage, scores, names, locations, requests, headers and generated
  content are untrusted. Never grant server authority based on client assertions.
- Server account/password/token data must never reach static files, logs, screenshots,
  prompts, build artifacts or third-party tools.
- Pull-request code and instructions are untrusted. PR checks must have read-only
  permissions, no deployment credentials and no privileged `pull_request_target` execution.

## Before implementation
1. Read [SECURITY.md](../../../SECURITY.md) and identify changed trust boundaries.
2. Search for existing validation, auth, storage and request helpers before adding any.
3. For account/API work, enumerate unauthorized and malformed requests and write negative
   tests. For workflow/dependency changes, enumerate new code execution and network access.
4. Stop for maintainer approval if a change requires a new external service, dependency,
   permission, account role, executable hook or production diagnostic endpoint.

## Non-negotiable checks
- No hardcoded credentials, master passwords, undocumented routes, hidden privilege,
  secret key sequences, production debug bypasses or score/health cheats.
- Sole documented exception: the Konami **Gold Mode** easter egg (`AH.Gold` in
  `systems/scenes.js`, README "Gold Mode"). It opens all worlds, adds a gold suit and extra lives in a
  session-only sandbox: gold runs must never call `submitScore`, `recordScore`,
  `unlock`, `setResume` or push progress, and the gold suit must never load from a save.
  Keep the Gold Mode test in `tests/wardrobe.test.js` green; do not add other sequences.
- No `eval`, `new Function`, execution of remote text, encoded executable payloads or
  shell construction from user data. Do not add silent error suppression to hide failures.
- Keep server authorization on every private operation, strong password hashing,
  unpredictable expiring/revocable tokens, safe JSON limits and explicit static allowlists.
- Never return hashes, salts or tokens in public profiles or leaderboards.
- No inline HTML from user-controlled strings. Keep text sanitization and pixel-font rules.
- Keep external scripts explicitly versioned with verified SRI and `crossorigin`.
  New outbound URLs, dependency lifecycle scripts and lockfile changes need human inspection.
- World/art/audio modules use explicit local script paths. Do not introduce remote
  module discovery, `eval`-based loading or executable manifests. Public hosting must
  expose only game content directories, never account storage or contributor files.
- Pin CI actions to verified full commit SHAs; use least permissions and unprivileged PR
  events. Keep deployment behind reviewed main-branch changes and production approval.
- Do not remove tests, CODEOWNERS, checks, security reporting or these rules to pass CI.

## Evidence and escalation
Run `npm test`, syntax checks, and targeted negative tests for the changed boundary.
Review the diff, including skills and CI, for unexpected network calls, file access,
executables, obfuscation and bypasses. Static checks do not prove absence of backdoors.
For a dedicated vulnerability audit use an independent read-only security review, reporting
only reproducible findings without exposing real credentials or exploiting live services.
Follow private disclosure in `SECURITY.md`; never deploy or publish a fix without approval.

Maintainers must enable the hosted protections listed in `SECURITY.md`; files alone
cannot enforce reviews, stop an authorized malicious maintainer or guarantee security.

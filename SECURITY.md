# Security policy

## Report privately

Use this repository's GitHub **Security > Report a vulnerability** option if enabled.
If it is unavailable, contact the repository owner privately through an established
channel and ask for a secure reporting route. Do not open a public exploit issue,
post credentials, attack production accounts or upload player data.

Include affected code/revision, a minimal reproduction against a local throwaway
instance, expected and actual behavior, impact and any proposed fix. Do not use
real player accounts or live secrets in examples.

## Contribution safeguards

- Follow [AGENTS.md](AGENTS.md) and [game-security](.github/skills/game-security/SKILL.md).
- No backdoors, hidden admin routes, hardcoded passwords, undocumented privileged
  key combinations, production cheats, obfuscated executable payloads or unapproved
  telemetry/network destinations.
- Keep authorization server-side. Never expose password hashes, salts, account
  storage or session tokens through static hosting or public profile APIs.
- Changes to accounts, static serving, external scripts, dependencies, tests, skills
  and workflows require maintainer review, even if presented as a cosmetic change.
- CI actions are pinned to immutable commits. Verify upstream provenance when updating
  them. The existing external Phaser script is versioned and integrity-checked;
  update the URL and independently verified integrity value together.
- Untrusted PR validation has read-only permissions and no secrets. Never use
  `pull_request_target` to check out and run contributor code.
- Deployment is separate from PR validation. Never put production credentials in a
  fork, PR workflow, game asset, skill, screenshot or test fixture.
- `art/`, `audio/` and `worlds/` contain public browser code only. Keep accounts,
  local tooling, scratch scripts and private configuration outside these directories.
  Module loading uses explicit local scripts, never downloaded executable manifests.

## Maintainer setup required on GitHub

The following are **not enabled merely by committing these files**. Configure them in
repository settings before treating the workflow as enforced:

1. Protect `main` with a ruleset: require PRs, code-owner approval, passing
   **Game and skill checks (18)** and **Game and skill checks (22)**, resolved
   conversations, dismissal of stale approvals and approval after the latest push.
2. Block force pushes and deletion; restrict bypass rights. Do not allow the same
   contributor to bypass review of a sensitive change.
3. Enable private vulnerability reporting, secret scanning and push protection where
   available. Enable code scanning appropriate to JavaScript and review its alerts.
4. Restrict Actions to approved actions/workflows and read-only default token permissions.
   Keep secrets unavailable to fork PRs and never run untrusted PRs on privileged runners.
5. Require a production environment reviewer, restrict deployment branches to reviewed
   `main`, and keep cloud credentials scoped to only the intended application.
6. Maintain CODEOWNERS as the maintainer team grows. Review changes to protection,
   ownership, tests and agent guidance as carefully as runtime authentication changes.

## Production account data and contributor access

- Current player passwords are salted scrypt hashes, not plaintext or decryptable
  secrets. Hashes, salts and session-token hashes are still sensitive; do not
  distribute account stores to contributors or use real accounts in test fixtures.
- Repository access must not imply Azure data, SSH/console, role-assignment or
  production deployment access. Protect releases: deployed malicious code could
  misuse the app's legitimate identity even when storage is private.
- The [Table Storage infrastructure](infra/main.bicep) grants only the Web App's
  managed identity per-table data access. It provisions no developer data roles,
  storage keys or player-secret vault. Key Vault is not a user-account database.
- Follow the [Table Storage server integration and data handling guidance](docs/deployment-azure-web-app.md#table-storage-server-integration-and-data-handling)
  before deployment. Do not enable the new app with the existing JSON adapter
  or silently fall back to local/empty data when Azure access fails.

## Limits

Skills and tests are defense in depth, not a proof that code is safe or a sandbox for
arbitrary contributions. A malicious authorized maintainer or a bypassed review can
defeat repository-local safeguards. Review unexpected network calls, file access,
scripts, encoded strings and permission changes before running unfamiliar code locally.

Scores are submitted by a browser client; these checks do not establish authoritative
anti-cheat validation. Browser smoke tests and forced boss stuns do not certify security
or combat balance. Reassess trust boundaries whenever new online features are proposed.

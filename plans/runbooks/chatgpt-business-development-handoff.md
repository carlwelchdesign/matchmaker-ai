# ChatGPT Business development handoff

## Purpose

Move development of Argent / The Montecito Matchmaker into Jenny's ChatGPT
Business workspace without moving, duplicating, or weakening the local source
repository. The workspace change affects the authenticated ChatGPT identity and
available product controls; Git remains the durable source of truth.

## Project anchors

- Local project: `/Users/carl.welch/Documents/Github Projects/matchmaker-ai`
- GitHub: `git@github.com:carlwelchdesign/matchmaker-ai.git`
- Asana project: `1217038055360286`
- Candidate application review route: `http://localhost:3000/prototype`
- Approved candidate-facing visual system: light Sunrise with The Montecito
  Matchmaker identity and `A division of Argent` attribution
- Active implementation branch: `codex/ARG-613-interview-accessibility`
- Active ticket: `ARG-613` conversational intake implementation

The active branch is stacked on the previously verified interview-control and
candidate-analytics foundation. Do not rebase, squash, merge, or deploy it as
part of the account transition. Review its complete branch diff before any
later integration decision.

## Workspace transition

1. Accept Jenny's Business invitation and switch the ChatGPT desktop app to the
   invited workspace. Do not merge a personal ChatGPT workspace merely to move
   this repository.
2. Add the local project folder above to the desktop app and make it the primary
   folder for the project.
3. Start a new Codex chat in that local project. Use this runbook, `README.md`,
   the applicable file in `plans/tickets`, and linked decisions and risks as
   durable context; do not rely on a prior chat transcript as the source of
   truth.
4. Confirm the model and reasoning choices actually offered to the Business
   identity. Prefer GPT-5.6 Sol with High or Extra High reasoning for complex
   implementation and review; use Max or Ultra only when the task warrants the
   additional usage.
5. Re-authorize GitHub, Asana, Vercel, and other approved integrations if the
   Business workspace's admin policy requires it. Never create a paid account,
   subscription, credential, deployment, or production integration without an
   explicit task and purchase record.

## Product and data boundaries

- Keep the interview inside the existing `/prototype` Application flow.
- Preserve the approved Sunrise design; do not create a parallel application
  theme or redesign the public site.
- Use fictional data only. No real candidate information, AI/provider call,
  audio capture, persistence, submission, or matching decision is authorized.
- Keep the `candidate-interviewing` flag fail-closed. Accessibility automation
  is implementation evidence, not approval from accessibility, privacy,
  counsel, or representative users.
- Human-assistance copy remains explanatory. No person is contacted and no
  answer is sent by the local preview.
- Do not deploy unless Carl explicitly requests it. Track any later purchase or
  subscription so it can be reported to Jenny.

## Local runtime

Use Node `24.18.0` and pnpm `10.34.5`. The production-style web container is
served on port 3000:

```sh
POSTGRES_PORT=5434 docker compose up --build -d web
```

The production-style container intentionally keeps candidate interviewing off
without an approved flag configuration. For an enabled, provider-free local
interaction check, use a temporary development server and stop it after review:

```sh
pnpm --filter @argent/web exec next dev -p 3004
```

Then review `http://localhost:3004/prototype` using:

`Application -> Conversation -> Continue`

Expected controls include `Answer style`, `Need help?`, `Interview progress`,
`Prefer not to answer`, and the field-level `Approve`, `Keep private`, and
`Reject` choices.

## Verification spine

For a web-only interview increment:

```sh
pnpm --filter @argent/web test
pnpm --filter @argent/web typecheck
pnpm --filter @argent/web build
pnpm plans:check
pnpm format:check
git diff --check
```

Also verify the actual candidate interaction and console in a browser. Keep
ticket acceptance gates open when only automated or synthetic evidence exists.

## Current handoff state

- ARG-613's deterministic text, structured, hybrid, assistance, review, and
  candidate-controlled field-disposition paths exist locally.
- The accessibility increment groups related choices, announces question
  progress, and moves focus across help, question, review, pause, and completion
  transitions.
- Persistence, provider-backed generation, voice, and final accessibility,
  privacy, counsel, and user-research approval remain open.
- No deployment, provider activation, real candidate data, or purchase is part
  of this handoff.

# Repository instructions

## Supermemory

- This repository is `NovemberAI/helloNovember`.
- Use the project namespace `repo_hellonovember__d54daba8a3a029cb` for Supermemory searches and saves. Pass it explicitly as `namespace` to hosted MCP tools; the account default may refer to another project.
- Before work that depends on prior project decisions or history, search this namespace for relevant context. Check recalled information against the current files.
- Save durable architecture decisions, development commands, conventions, and useful debugging findings as focused memories after substantive work. Do not save credentials or secrets.
- Keep the server-provided `conversation_id` unchanged across memory calls in the same conversation.
- The local Codex integration supplies session-start recall, prompt recall, and end-of-turn capture. Credentials and hooks live outside this repository under `~/.codex`.
- Check local API connectivity with `node ~/.codex/supermemory/status.js` from the repository root. Verify hosted MCP connectivity separately with `who_am_i`.

## Documentation

- Use Context7 for current library, framework, SDK, API, CLI, and cloud-service documentation. Resolve the library ID first, then query one concept at a time.

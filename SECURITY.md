# Security policy

cold-read is an instruction layer for an AI agent. It reads documents that people sign, pay against or publish, so a flaw in the skill can become a flaw in those documents. Please report issues rather than work around them.

## How to report

Use GitHub private vulnerability reporting: open the repository's Security tab, click "Report a vulnerability", and fill in the form. Do not open a public issue for a security problem.

Include what you saw, how to reproduce it (with the model and agent runtime), and any workaround you know.

## Scope

The skill does not execute code on its own. It tells an agent to spawn readers and to run numeric scripts those readers return. Review any script before you let an agent run it in an environment that holds credentials.

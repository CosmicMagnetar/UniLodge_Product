# Contributing to UniLodge

Thank you for contributing to UniLodge. This document covers the branch strategy, commit conventions, code standards, and pull request process that all team members are expected to follow.

---

## Getting Started

```bash
git clone <repo-url>
cd unilodge
npm install
cp .env.example .env.local
# Populate .env.local with your credentials — see docs/SETUP_GUIDE.md
```

Configure your editor:

- Install the **ESLint** extension
- Install the **Prettier** extension
- Enable **Format on Save**

---

## Branch Strategy

All work happens on feature branches cut from `main`. Direct commits to `main` are not permitted.

```
main                  — stable, production-ready code
feature/<description> — new features and enhancements
fix/<description>     — bug fixes
docs/<description>    — documentation-only changes
refactor/<description>— code improvements without behaviour changes
```

**Creating a branch**

```bash
git checkout -b feature/your-feature-name
```

Keep branches short-lived. Once a PR is merged, delete the remote branch.

---

## Commit Message Format

UniLodge follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit message must follow this structure:

```
<type>(<scope>): <short description>
```

**Types**

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | New feature or user-facing behaviour             |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation changes only                       |
| `test`     | Adding or updating tests                         |
| `refactor` | Code restructure with no behaviour change        |
| `chore`    | Tooling, config, dependency updates              |
| `style`    | Formatting changes (whitespace, semicolons, etc) |

**Scopes** map to the relevant workspace or subsystem: `auth`, `booking`, `frontend`, `backend`, `ai`, `docs`, `config`.

**Examples**

```
feat(auth): add user registration endpoint
fix(booking): correct date validation logic
docs(api): update endpoint specifications
refactor(backend): extract booking service into separate module
```

Commit messages must be written in the imperative mood ("add" not "added") and kept under 72 characters where possible.

---

## Code Standards

| Area         | Standard                                      |
|--------------|-----------------------------------------------|
| Language     | TypeScript — strict mode enabled              |
| Formatting   | Prettier with 2-space indentation             |
| Linting      | ESLint with the TypeScript plugin             |
| Test coverage| Minimum 80% for all new code                  |
| Types        | No `any` — use proper types from `packages/shared` |

---

## Before Every Push

Run the following checks and ensure all pass before opening a pull request:

```bash
npm run lint --workspaces     # Check code style
npm run test --workspaces     # Run all tests
npm run build --workspaces    # Verify builds succeed
```

---

## Pull Request Process

1. Push your branch to the remote:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Open a pull request against `main` on GitHub.
3. Write a clear description explaining **what** the change does and **why**.
4. Link any related issues using `Closes #<issue-number>`.
5. Request a review from at least one other team member.
6. Address all review comments before merging.
7. Ensure all CI/CD checks pass.
8. Squash and merge — do not leave messy commit chains on `main`.

---

## Team Assignments

| Name              | GitHub Handle  | Area of Responsibility        |
|-------------------|----------------|-------------------------------|
| Krishna           | @krishna       | Project Management, AI Engine |
| Kavya             | @kavya         | Frontend                      |
| Aditya Rana       | @aditya-rana   | Backend                       |
| Yashkumar Nimje   | @yashkumar     | Documentation                 |
| Swagato Bauri     | @swagato       | Architecture and Diagrams     |

---

## Questions

Raise an issue on GitHub or ask in the team Slack channel. For documentation questions, check `/docs` first.

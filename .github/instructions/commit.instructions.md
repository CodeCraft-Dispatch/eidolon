---
description: Instructions to generate commit messages following the Conventional Commit format
---

# Commit Message Instructions for GitHub Copilot

All commit messages must follow the [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/):

## Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 1. Type
Use one of the following types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### 2. Scope (optional)
A scope may be provided to a commit's type to provide additional contextual information and should be placed in parentheses, e.g. `feat(parser): ...`.

### 3. Description
- Use the imperative, present tense: "change" not "changed" nor "changes"
- No period (.) at the end
- Clearly and concisely describe the change

### 4. Body (optional)
- Use to explain what and why vs. how
- Wrap lines at 72 characters
- Leave a blank line between the description and the body

### 5. Footer (optional)
- For breaking changes, start with `BREAKING CHANGE:` followed by an explanation
- For issues, reference them using `Closes #123`, `Fixes #456`, etc.

## Examples

```
feat(core): add support for Disruptor event batching

This introduces a new batching mechanism to improve throughput.

Closes #42
```

```
fix(parser): handle null input edge case

Previously, null input would throw an exception. Now it returns an empty result.

BREAKING CHANGE: parser now returns empty result for null input
```

```
docs(readme): update usage instructions
```

## Additional Guidelines
- Each commit should represent a single logical change.
- Use the body to explain "why" if the change is not obvious.
- Use footers for breaking changes and issue references.

---

# Contributing

This project is setup in such a way to try and remove as much manual configuration as possible. Everything, even down to installation of the runtime, is housed within the repo as a configuration file of sorts.

## Quickstart

Run `mise install`, `mise run setup`, and finally, `mise run test`.

Code away!

## Tech Stack

[Bun](https://bun.sh/), an all-in-one package manager, task runner, and runtime for Java/Typescript.
[TypeScript](https://www.typescriptlang.org/), a typed superset of Javascript.
[Zod](https://zod.dev/), a typescript validation library.
[Mise](https://mise.jdx.dev/), an oasis in a dessert of terrible environment managers.
[Google Apps Script](https://developers.google.com/apps-script), Google's answer to serverless for dummies.

## Getting started

1. Install Mise using any of the methods listed in the [official docs](https://mise.jdx.dev/getting-started.html)
2. Install development tools and dependencies using `mise install` then `mise run setup`
3. Make changes as necessary.
4. (Add and) Run tests using `mise run test`.

## Development Workflow

### Available Commands

All build and development tasks are defined in `mise.toml`. Run `mise tasks` to see a full list of tasks available along with their descriptions.

### Dependency Management

Dependencies are managed using Bun.

> [!WARNING]
> This application will be deployed to an environment without access to common APIs provided by Node and the "Browser" such as DOM.
> Always verify dependencies are supported in this before installing limited environment.

### Testing

The project uses the Bun test runner for all testing.

Run the full test suite:

```bash
mise run test
```

#### Writing Tests

Tests are colocated with source files in `__tests__` directories and should follow existing patterns and conventions for consistency.

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) to enable automated versioning and changelog generation.

#### Commit Message Format

For normal commits:

```string
<type>: <subject>

[optional body]
```

For commits with breaking changes:

```string
<type>: <subject>

[optional body]

[BREAKING CHANGE: description of changed behavior]
```

You can also just use an exclamation point (!) after the type without the breaking change line to denote a breaking change
if it's self-explanatory.

#### Commit Types

Below are some common commit types. This isn't an exhaustive list, but it should cover most scenarios:

- **feat**: New features for end users
- **fix**: Bug fixes for end users
- **docs**: Documentation changes
- **refactor**: Code restructuring
- **test**: Test additions or modifications

## Code Quality

- Formatting and linting is handled by [Biome](https://next.biomejs.dev/).
  - See [first-party extensions for live linting](https://next.biomejs.dev/guides/editors/first-party-extensions/).
  - See additional automations for VSCode development in the [.vscode directory](./.vscode/README.md).

### Pipelines

This project is stored in GitHub and utilizes the great automated pipeline system GitHub has to offer.

#### Quality Check

This workflow runs on every commit to or Merge Request with a destination of the "main" branch. It runs the linter and all unit tests.

#### Build Artifacts

This workflow runs whenever the Quality Check passes. It runs the logic to bundle the code up in prep for release.

Artifacts from this workflows are temporarily stored within GitHub so they can be used by later workflows.

#### Deploy

This workflow runs at the completion of all others. It uses [Semantic Release](https://semantic-release.org/) to determine whether to create a release based on the semantic commits
made since the last release.

It retrieves the previously bundled artifacts (most notably, the standalone minimized app code) and uploads them along with releasing a new version of the application.

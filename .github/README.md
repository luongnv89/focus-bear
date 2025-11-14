# CI/CD Configuration

This directory contains GitHub Actions workflows and CI/CD configuration for the FocusBear Chrome extension.

## GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to ensure code quality and functionality.

**Jobs:**

1. **Lint, Format, Test & Build** - Runs on Node.js 18.x and 20.x
   - ESLint code linting
   - Prettier format checking
   - Jest unit tests
   - Extension build validation
   - Uploads build artifacts (Node 20.x only)

2. **Code Coverage** - Generates test coverage reports
   - Runs tests with coverage enabled
   - Uploads coverage to Codecov

**Triggers:**
- Push to any branch
- Pull requests to any branch

## Pre-commit Hooks

The project uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) to enforce code quality before commits.

### What runs on commit:

1. **lint-staged** - Runs on staged files only:
   - `*.js` files:
     - ESLint with auto-fix
     - Prettier formatting
     - Jest tests for related files
   - `*.html`, `*.css` files:
     - Prettier formatting

2. **Build validation** - Ensures the extension builds successfully

### Setup

Pre-commit hooks are automatically installed when you run:

```bash
npm install
```

The `prepare` script in `package.json` runs `husky install` automatically.

### Bypassing hooks (not recommended)

In exceptional cases, you can bypass pre-commit hooks:

```bash
git commit --no-verify -m "your message"
```

**Note:** This is discouraged as it bypasses quality checks.

## Manual Quality Checks

Run these commands locally to check your code:

```bash
# Lint JavaScript files
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check code formatting
npm run format:check

# Format all files
npm run format

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Build extension
npm run build
```

## Configuration Files

- `.github/workflows/ci.yml` - GitHub Actions CI workflow
- `.husky/pre-commit` - Pre-commit hook script
- `package.json` - Contains lint-staged configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc.json` - Prettier configuration
- `jest.config.js` - Jest test configuration

## Troubleshooting

### Pre-commit hooks not running

If hooks aren't running, reinstall them:

```bash
npm run prepare
```

### CI workflow failing

1. Run all quality checks locally:
   ```bash
   npm run lint && npm run format:check && npm test && npm run build
   ```

2. Fix any issues reported

3. Commit and push again

### Husky permission errors

Make sure the hook files are executable:

```bash
chmod +x .husky/pre-commit
```

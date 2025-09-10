import { Given, When, Then } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';

Given('the use of GitHub Actions', function () {
  // Check for GitHub Actions workflow file
  if (!fs.existsSync(path.resolve('.github', 'workflows', 'ci.yml')) && !fs.existsSync(path.resolve('.github', 'workflows', 'main.yml'))) {
    throw new Error('GitHub Actions workflow file not found');
  }
});

When('I push code to the repository', function () {
  // Simulate a git push event
  // In real CI, this would trigger the workflow
  // Here, we just assert that a push could occur
  // (No-op for local test)
});

Then('the code is automatically built and tested', function () {
  // Inspect the ci.yml file for build and test steps
  const ciPath = path.resolve('.github', 'workflows', 'ci.yml');
  if (!fs.existsSync(ciPath)) {
    throw new Error('ci.yml workflow file not found');
  }
  const ciContent = fs.readFileSync(ciPath, 'utf-8');
  // Look for build and test commands in the workflow
  const hasBuild = /run:\s*npm run build/.test(ciContent);
  const hasTest = /run:\s*npm test/.test(ciContent);
  if (!hasBuild) {
    throw new Error('ci.yml does not contain a build step running "npm run build"');
  }
  if (!hasTest) {
    throw new Error('ci.yml does not contain a test step running "npm test"');
  }
});

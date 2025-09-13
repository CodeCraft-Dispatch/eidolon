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
  // In real CI, this would trigger the workflow
  // No-op for local test
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

Given('the use of vuejs', function () {
  // Check for Vue.js presence (system/App.vue)
  if (!fs.existsSync(path.resolve('system', 'src', 'App.vue'))) {
    throw new Error('Vue.js app not found in system/src/App.vue');
  }
});

Then('the system code is automatically built and tested', function () {
  // Inspect the ci.yml file for system build and test steps
  const ciPath = path.resolve('.github', 'workflows', 'ci.yml');
  if (!fs.existsSync(ciPath)) {
    throw new Error('ci.yml workflow file not found');
  }
  const ciContent = fs.readFileSync(ciPath, 'utf-8');
  // Look for system build and test commands in the workflow
  const hasSystemBuild = /working-directory:\s*\.\/system[\s\S]*run:\s*npm run build/.test(ciContent);
  const hasSystemTest = /working-directory:\s*\.\/system[\s\S]*run:\s*npm run test:unit/.test(ciContent);
  if (!hasSystemBuild) {
    throw new Error('ci.yml does not contain a system build step running "npm run build" in system/');
  }
  if (!hasSystemTest) {
    throw new Error('ci.yml does not contain a system test step running "npm run test:unit" in system/');
  }
});

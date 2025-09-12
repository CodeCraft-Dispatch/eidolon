import { Given, Then } from '@cucumber/cucumber';
import * as fs from 'fs';
import * as path from 'path';

Given('the use of git and github actions', function () {
  // Check for .git directory
  if (!fs.existsSync(path.resolve('.git'))) {
    throw new Error('.git directory not found. Is this a git repo?');
  }
  // Check for GitHub Actions workflow file
  if (!fs.existsSync(path.resolve('.github', 'workflows'))) {
    throw new Error('GitHub Actions workflows not found');
  }
});


Then('a pre-commit git hook should exist in the repository', function () {
  const hookPath = path.resolve('.hooks', 'pre-commit');
  if (!fs.existsSync(hookPath)) {
    throw new Error('pre-commit hook not found in .hooks/pre-commit');
  }
});


Given('the pre-commit hook is defined', function () {
  const hookPath = path.resolve('.hooks', 'pre-commit');
  if (!fs.existsSync(hookPath)) {
    throw new Error('pre-commit hook not found in .hooks/pre-commit');
  }
});


Then('the pre-commit hook should contain the required validation logic', function () {
  const hookPath = path.resolve('.hooks', 'pre-commit');
  if (!fs.existsSync(hookPath)) {
    throw new Error('pre-commit hook not found in .hooks/pre-commit');
  }
  const hookContent = fs.readFileSync(hookPath, 'utf-8');
  // Check for usage of 'act' to run GitHub Actions workflow
  if (!/act\s/.test(hookContent)) {
    throw new Error('pre-commit hook does not contain required act command to run GitHub Actions workflow');
  }
});

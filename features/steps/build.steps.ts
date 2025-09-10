import { Given, When, Then } from '@cucumber/cucumber';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

let buildOutput: string | undefined;

Given('the use of typescript', function () {
  // Check for tsconfig.json and src folder
  if (!fs.existsSync(path.resolve('tsconfig.json'))) {
    throw new Error('tsconfig.json not found');
  }
  if (!fs.existsSync(path.resolve('src'))) {
    throw new Error('src folder not found');
  }
});

When('I run `npm run build`', function () {
  buildOutput = execSync('npm run build', { encoding: 'utf-8' });
});

Then('I should see the compiled javascript files in the `dist` directory', function () {
  const distPath = path.resolve('dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('dist directory not found');
  }
  const files = fs.readdirSync(distPath);
  if (!files.some(f => f.endsWith('.js'))) {
    throw new Error('No compiled JavaScript files found in dist');
  }
});

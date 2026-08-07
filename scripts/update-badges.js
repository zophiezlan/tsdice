import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const COVERAGE_SUMMARY_PATH = join(ROOT, 'coverage', 'coverage-summary.json');
const BADGES_DIR = join(ROOT, 'badges');
const TESTS_BADGE_PATH = join(BADGES_DIR, 'tests.json');
const COVERAGE_BADGE_PATH = join(BADGES_DIR, 'coverage.json');

function runCoverage() {
  try {
    // Combine stderr with stdout so parser is robust across Vitest reporters/CI.
    return execSync('npm run test:coverage 2>&1', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const stdout = error?.stdout ? String(error.stdout) : '';
    const stderr = error?.stderr ? String(error.stderr) : '';

    if (stdout) {
      process.stdout.write(stdout);
    }
    if (stderr) {
      process.stderr.write(stderr);
    }

    throw new Error('Failed to run coverage for badge generation.', {
      cause: error,
    });
  }
}

function stripAnsi(text) {
  const ESC = String.fromCharCode(27);
  let result = '';

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === ESC && text[i + 1] === '[') {
      let j = i + 2;
      while (j < text.length && /[0-9;]/.test(text[j])) {
        j += 1;
      }

      if (j < text.length && text[j] === 'm') {
        i = j;
        continue;
      }
    }

    result += text[i];
  }

  return result;
}

function parseTestCount(output) {
  const normalized = stripAnsi(output).replace(/\r/g, '');
  const patterns = [
    /Tests\s+(\d+)\s+passed\s+\(\d+\)/i,
    /Tests\s+(\d+)\s+passed\b/i,
    /Tests\s+(\d+)\s*\|/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      return Number.parseInt(match[1], 10);
    }
  }

  if (!normalized.includes('Tests')) {
    throw new Error('Unable to parse total passed tests from Vitest output.');
  }

  throw new Error(
    'Unable to parse total passed tests from Vitest output format.'
  );
}

function parseLineCoverage() {
  const raw = readFileSync(COVERAGE_SUMMARY_PATH, 'utf8');
  const summary = JSON.parse(raw);
  const linePct = summary?.total?.lines?.pct;

  if (typeof linePct !== 'number') {
    throw new Error(
      'Unable to parse line coverage percentage from coverage-summary.json.'
    );
  }

  return Number(linePct.toFixed(2));
}

function colorForCoverage(pct) {
  if (pct >= 80) {
    return 'brightgreen';
  }
  if (pct >= 60) {
    return 'yellow';
  }
  if (pct >= 40) {
    return 'orange';
  }
  return 'red';
}

function writeBadge(path, label, message, color) {
  const payload = {
    schemaVersion: 1,
    label,
    message,
    color,
  };

  writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function main() {
  const coverageOutput = runCoverage();
  const testsPassed = parseTestCount(coverageOutput);
  const lineCoverage = parseLineCoverage();

  mkdirSync(BADGES_DIR, { recursive: true });

  writeBadge(
    TESTS_BADGE_PATH,
    'tests',
    `${testsPassed} passing`,
    'brightgreen'
  );
  writeBadge(
    COVERAGE_BADGE_PATH,
    'coverage',
    `${lineCoverage}%`,
    colorForCoverage(lineCoverage)
  );

  process.stdout.write(
    `Updated badges: tests=${testsPassed} passing, coverage=${lineCoverage}%\n`
  );
}

main();

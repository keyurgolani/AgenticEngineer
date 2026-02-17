/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Track critical issues
let criticalIssues = [];
let warnings = [];

console.log('\n\x1b[1m=== Environment Verification ===\x1b[0m\n');

// Node.js check
console.log('\x1b[36m> Checking Node.js...\x1b[0m');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (majorVersion >= 18) {
    console.log(`  \x1b[32m✓\x1b[0m OK (${nodeVersion})`);
  } else {
    console.log(`  \x1b[33m⚠\x1b[0m Found ${nodeVersion}, but v18.17.0+ recommended`);
    warnings.push('Node.js version is below recommended (v18.17.0+)');
  }
} catch (_e) {
  console.error('  \x1b[31m✗\x1b[0m Node.js check failed');
  criticalIssues.push('Node.js not found or check failed');
}

// Python check
console.log('\x1b[36m> Checking Python...\x1b[0m');
try {
  const pythonVersion = execSync('python3 --version').toString().trim();
  console.log(`  \x1b[32m✓\x1b[0m OK (${pythonVersion})`);
} catch (_e) {
  try {
    const pythonVersion = execSync('python --version').toString().trim();
    console.log(`  \x1b[32m✓\x1b[0m OK (${pythonVersion})`);
  } catch (_e2) {
    console.log('  \x1b[33m⚠\x1b[0m Python 3 not found (needed for later modules)');
    warnings.push('Python 3 not found - required for backend agent modules');
  }
}

// Docker check (optional)
console.log('\x1b[36m> Checking Docker...\x1b[0m');
try {
  const dockerVersion = execSync('docker --version').toString().trim();
  console.log(`  \x1b[32m✓\x1b[0m OK`);
} catch (_e) {
  console.log('  \x1b[33m⚠\x1b[0m Docker not found (optional - needed for local LLMs/Ollama)');
  warnings.push('Docker not installed - required for Day 16+ (local LLMs with Ollama)');
}

// API Keys check
console.log('\x1b[36m> Verifying API Keys...\x1b[0m');
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Helper to check if key exists and has a value (not just the key name)
function hasValidKey(content, keyName) {
  const regex = new RegExp(`^${keyName}=.+`, 'm');
  return regex.test(content);
}

const hasOpenAI = hasValidKey(envContent, 'OPENAI_API_KEY');
const hasAnthropic = hasValidKey(envContent, 'ANTHROPIC_API_KEY');
const hasTavily = hasValidKey(envContent, 'TAVILY_API_KEY');
const hasLangSmith = hasValidKey(envContent, 'LANGSMITH_API_KEY');

// OpenAI
if (hasOpenAI) {
  console.log('  - OpenAI: \x1b[32m✓ OK\x1b[0m');
} else {
  console.log('  - OpenAI: \x1b[31m✗ Missing\x1b[0m');
}

// Anthropic
if (hasAnthropic) {
  console.log('  - Anthropic: \x1b[32m✓ OK\x1b[0m');
} else {
  console.log('  - Anthropic: \x1b[31m✗ Missing\x1b[0m');
}

// Check if at least one LLM provider is configured
if (!hasOpenAI && !hasAnthropic) {
  criticalIssues.push('No LLM provider configured - need at least OpenAI OR Anthropic API key');
}

// Tavily (optional)
if (hasTavily) {
  console.log('  - Tavily: \x1b[32m✓ OK\x1b[0m');
} else {
  console.log('  - Tavily: \x1b[33m⚠ Missing (Optional)\x1b[0m');
  warnings.push('Tavily API key not set - needed for search-enabled agents');
}

// LangSmith (optional)
if (hasLangSmith) {
  console.log('  - LangSmith: \x1b[32m✓ OK\x1b[0m');
} else {
  console.log('  - LangSmith: \x1b[33m⚠ Missing (Optional)\x1b[0m');
  warnings.push('LangSmith API key not set - recommended for debugging agents');
}

// Summary
console.log('\n\x1b[1m=== Summary ===\x1b[0m\n');

if (criticalIssues.length > 0) {
  console.log('\x1b[31m✗ Critical Issues (must fix before proceeding):\x1b[0m');
  criticalIssues.forEach(issue => {
    console.log(`  • ${issue}`);
  });
  console.log('');
}

if (warnings.length > 0) {
  console.log('\x1b[33m⚠ Warnings (can proceed, but may affect some modules):\x1b[0m');
  warnings.forEach(warning => {
    console.log(`  • ${warning}`);
  });
  console.log('');
}

if (criticalIssues.length === 0) {
  console.log('\x1b[32m✓ Environment checks passed. Ready for Day 01!\x1b[0m\n');
  if (warnings.length > 0) {
    console.log('\x1b[90mNote: Address the warnings above when you reach modules that require those features.\x1b[0m\n');
  }
} else {
  console.log('\x1b[31m✗ Please fix the critical issues above before starting Day 01.\x1b[0m\n');
  process.exit(1);
}

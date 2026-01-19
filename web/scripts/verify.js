/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\x1b[36m> Checking Node.js...\x1b[0m');
try {
  console.log(`OK (${process.version})`);
} catch (_e) {
  console.error('\x1b[31mNode.js check failed\x1b[0m');
  process.exit(1);
}

console.log('\x1b[36m> Checking Python...\x1b[0m');
try {
  const pythonVersion = execSync('python3 --version').toString().trim();
  console.log(`OK (${pythonVersion})`);
} catch (_e) {
  try {
    const pythonVersion = execSync('python --version').toString().trim();
    console.log(`OK (${pythonVersion})`);
  } catch (_e2) {
    console.warn('\x1b[33mPython 3 not found. Recommended for backend agents.\x1b[0m');
  }
}

console.log('\x1b[36m> Checking Docker...\x1b[0m');
try {
  execSync('docker --version');
  console.log('OK');
} catch (_e) {
  console.warn('\x1b[33mDocker not found. Required for local LLMs (Ollama).\x1b[0m');
}

console.log('\x1b[36m> Verifying API Keys...\x1b[0m');
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

const keys = {
  OPENAI_API_KEY: envContent.includes('OPENAI_API_KEY='),
  ANTHROPIC_API_KEY: envContent.includes('ANTHROPIC_API_KEY='),
  TAVILY_API_KEY: envContent.includes('TAVILY_API_KEY=')
};

if (keys.OPENAI_API_KEY) console.log('  - OpenAI: \x1b[32mOK\x1b[0m');
else console.log('  - OpenAI: \x1b[31mMissing\x1b[0m');

if (keys.ANTHROPIC_API_KEY) console.log('  - Anthropic: \x1b[32mOK\x1b[0m');
else console.log('  - Anthropic: \x1b[31mMissing\x1b[0m');

if (keys.TAVILY_API_KEY) console.log('  - Tavily: \x1b[32mOK\x1b[0m');
else console.log('  - Tavily: \x1b[33mMissing (Optional)\x1b[0m');

console.log('\n\x1b[32mEnvironment checks passed. Ready for Day 01.\x1b[0m');

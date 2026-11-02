// Runs the exact Quality Gate code from the n8n Code node against synthetic drafts.
// Usage: node tests/quality_gate.test.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const gateSrc = fs.readFileSync(path.join(__dirname, '..', 'workflow', 'quality_gate.js'), 'utf8');

function runGate(sourceBody, drafts) {
  const jobs = drafts.map(d => ({ json: { run_id: 't', source_title: 't', source_type: 'test', channel: d.channel } }));
  const items = drafts.map(d => ({ json: { content: [{ type: 'text', text: d.text }], usage: { input_tokens: 1, output_tokens: 1 }, model: 'test' } }));
  const $ = name => ({
    'Plan Channel Jobs': { all: () => jobs },
    'Prepare Source': { first: () => ({ json: { source_body: sourceBody } }) }
  })[name];
  const $input = { all: () => items };
  return new Function('$', '$input', gateSrc)($, $input).map(r => r.json);
}

const source = 'We cut onboarding from 14 days to 6 days and support tickets fell by 30% across 1,200 accounts.';
const filler = ' Plain words that make the post long enough to pass the length rule.'.repeat(12);
let pass = 0;
function check(name, fn) { fn(); pass++; console.log('ok  ' + name); }

check('invented number is flagged by value', () => {
  const [r] = runGate(source, [{ channel: 'linkedin_post', text: 'Onboarding is now 40% faster.' + filler }]);
  assert.strictEqual(r.gate_passed, false);
  assert.match(r.gate_notes, /numbers not found in source: 40%/);
});

check('numbers that are in the source pass, commas ignored', () => {
  const [r] = runGate(source, [{ channel: 'linkedin_post', text: 'Tickets fell 30% across 1,200 accounts in 14 days.' + filler }]);
  assert.doesNotMatch(r.gate_notes, /numbers not found/);
});

check('[CHECK: ...] placeholder is flagged', () => {
  const [r] = runGate(source, [{ channel: 'linkedin_post', text: 'Result: [CHECK: real retention number].' + filler }]);
  assert.match(r.gate_notes, /\[CHECK: \.\.\.\] placeholders/);
});

check('quoting the phrase "[CHECK] note" is not a placeholder (v3 fix)', () => {
  const [r] = runGate(source, [{ channel: 'linkedin_post', text: 'The model wrote a [CHECK] note instead of guessing.' + filler }]);
  assert.doesNotMatch(r.gate_notes, /CHECK/);
});

check('X post over 280 characters is flagged with its length', () => {
  const long = 'a'.repeat(281);
  const thread = ['one', 'two', 'three', 'four', long].join('\n---\n');
  const [r] = runGate(source, [{ channel: 'x_thread', text: thread }]);
  assert.match(r.gate_notes, /post 5 is 281 chars/);
});

check('banned hype word is flagged', () => {
  const [r] = runGate(source, [{ channel: 'linkedin_post', text: 'This will revolutionize onboarding.' + filler }]);
  assert.match(r.gate_notes, /banned word: revolutioniz/);
});

console.log(pass + ' checks passed');

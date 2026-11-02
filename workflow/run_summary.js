const rows = $('Quality Gate').all().map(function (r) { return r.json; });
const job = $('Plan Channel Jobs').first().json;
function sum(k) { return rows.reduce(function (a, r) { return a + (r[k] || 0); }, 0); }
return [{ json: {
  run_id: job.run_id,
  source_title: job.source_title,
  brief_parsed: job.brief_parsed,
  brief_stop_reason: job.brief_stop_reason,
  drafts: rows.length,
  passed_gate: rows.filter(function (r) { return r.gate_passed; }).length,
  flagged: rows.filter(function (r) { return !r.gate_passed; }).map(function (r) { return r.channel + ': ' + r.gate_notes; }),
  brief_input_tokens: job.brief_input_tokens,
  brief_output_tokens: job.brief_output_tokens,
  brief_thinking_tokens: job.brief_thinking_tokens,
  draft_input_tokens: sum('input_tokens'),
  draft_output_tokens: sum('output_tokens'),
  draft_thinking_tokens: sum('thinking_tokens'),
  llm_calls: rows.length + 1
} }];

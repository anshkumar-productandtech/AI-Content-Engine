const drafts = $input.all();
const jobs = $('Plan Channel Jobs').all();
const src = $('Prepare Source').first().json;
const sourceText = (src.source_body || '').replace(/,/g, '').toLowerCase();
const banned = ['game-changer', 'game changer', 'revolutioniz', 'unlock', 'supercharge', 'delve', 'leverage', 'cutting-edge', 'seamless', 'fast-paced world'];

function textOf(j) {
  if (Array.isArray(j.content)) return j.content.map(function (c) { return c.text || ''; }).join('').trim();
  return String(j.merged_response || j.text || j.output || '').trim();
}
function wc(s) { return s.split(/\s+/).filter(Boolean).length; }

return drafts.map(function (d, i) {
  const job = jobs[i].json;
  const draft = textOf(d.json);
  const words = wc(draft);
  const notes = [];
  const lower = draft.toLowerCase();

  banned.forEach(function (b) { if (lower.indexOf(b) !== -1) notes.push('banned word: ' + b); });
  if (/\[check:/i.test(draft)) notes.push('has [CHECK: ...] placeholders to resolve');
  if (draft.indexOf('\u2014') !== -1) notes.push('contains em dash');

  const nums = (draft.match(/\d[\d,.]*%?/g) || []).map(function (n) { return n.replace(/,/g, '').replace(/[.]$/, ''); });
  const unknown = nums.filter(function (n) {
    const v = parseFloat(n);
    if (!isNaN(v) && v <= 10 && n.indexOf('%') === -1) return false;
    return sourceText.indexOf(n.toLowerCase()) === -1 && sourceText.indexOf(n.replace('%', '').toLowerCase()) === -1;
  });
  if (unknown.length) notes.push('numbers not found in source: ' + Array.from(new Set(unknown)).join(', '));

  if (job.channel === 'linkedin_post') {
    if (words < 120 || words > 270) notes.push('length ' + words + ' words (target 150-250)');
    const tags = (draft.match(/#\w+/g) || []).length;
    if (tags > 3) notes.push(tags + ' hashtags (max 3)');
    if (/https?:\/\//.test(draft)) notes.push('link in body');
    if (draft.split('\n')[0].split(/\s+/).length > 18) notes.push('hook line too long');
  }
  if (job.channel === 'x_thread') {
    const posts = draft.split(/\n\s*---\s*\n/).map(function (p) { return p.trim(); }).filter(Boolean);
    if (posts.length < 5 || posts.length > 8) notes.push(posts.length + ' posts (target 5-8)');
    posts.forEach(function (p, k) { if (p.length > 280) notes.push('post ' + (k + 1) + ' is ' + p.length + ' chars'); });
  }
  if (job.channel === 'newsletter_section') {
    if (!/^subject:/i.test(draft)) notes.push('missing Subject line');
    if (words < 160 || words > 330) notes.push('length ' + words + ' words (target 180-300)');
  }
  if (job.channel === 'short_video_script') {
    ['HOOK', 'SETUP', 'PAYOFF', 'CTA'].forEach(function (p) { if (draft.indexOf(p) === -1) notes.push('missing ' + p); });
    const spoken = draft.split('\n').filter(function (l) { return l.trim() && !/^\s*\[ON SCREEN/i.test(l) && !/^\s*\**(HOOK|SETUP|PAYOFF|CTA)/i.test(l); }).join(' ');
    const sw = wc(spoken);
    if (sw < 100 || sw > 185) notes.push('spoken length ' + sw + ' words (target 110-170)');
  }
  if (job.channel === 'seo_blog_draft') {
    if (!/^title:/im.test(draft)) notes.push('missing Title');
    const meta = (draft.match(/^meta description:\s*(.*)$/im) || [])[1] || '';
    if (!meta) notes.push('missing meta description');
    else if (meta.length > 160) notes.push('meta description ' + meta.length + ' chars');
    const h2 = (draft.match(/^## /gm) || []).length;
    if (h2 < 3) notes.push('only ' + h2 + ' H2 sections');
    if (words < 650 || words > 1200) notes.push('length ' + words + ' words (target 700-1100)');
  }

  return { json: {
    run_id: job.run_id,
    source_title: job.source_title,
    source_type: job.source_type,
    channel: job.channel,
    draft: draft,
    word_count: words,
    gate_passed: notes.length === 0,
    gate_notes: notes.length ? notes.join('; ') : 'passed',
    status: 'needs_review',
    final_text: '',
    input_tokens: (d.json.usage && d.json.usage.input_tokens) || 0,
    output_tokens: (d.json.usage && d.json.usage.output_tokens) || 0,
    thinking_tokens: (d.json.usage && d.json.usage.output_tokens_details && d.json.usage.output_tokens_details.thinking_tokens) || 0,
    model: d.json.model || ''
  } };
});
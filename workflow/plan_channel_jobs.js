const src = $('Prepare Source').first().json;
const res = $input.first().json;
const text = Array.isArray(res.content) ? res.content.map(function (c) { return c.text || ''; }).join('') : (res.text || '');
let brief;
let briefParsed = true;
try {
  brief = JSON.parse(text.replace(/^\s*\x60\x60\x60(json)?/i, '').replace(/\x60\x60\x60\s*$/, '').trim());
} catch (e) {
  brief = { raw_brief: text };
  briefParsed = false;
}
const briefStr = JSON.stringify(brief, null, 2);
const usage = res.usage || {};
const details = usage.output_tokens_details || {};

const rules = [
  'Use only facts, numbers and names that appear in the SOURCE or BRIEF. Never invent results, metrics, people or quotes.',
  'If a detail is needed but missing, write [CHECK: what is missing] instead of guessing.',
  'Write in this voice: ' + src.voice_notes,
  'Never use these words: game-changer, revolutionize, unlock, supercharge, delve, leverage, cutting-edge, seamless, in today\'s fast-paced world.',
  'Output only the deliverable. No preamble, no notes to the editor.'
].join('\n- ');

const channels = [
  { channel: 'linkedin_post', label: 'LinkedIn post', spec: 'A LinkedIn post of 150 to 250 words. Line 1 is a hook of at most 15 words built on a result, a surprise or a strong opinion. Then 2 lines of context. Then a short "What I built" or "What happened" section using → arrows. Then one PM-style lesson. End with one question that invites comments. At most 3 hashtags on the last line. No links in the body.' },
  { channel: 'x_thread', label: 'X thread', spec: 'An X thread of 5 to 8 posts. Separate posts with a line containing only ---. Each post must be under 270 characters. Post 1 is the hook and must stand alone. Last post sums up the lesson. No hashtags. Do not number the posts.' },
  { channel: 'newsletter_section', label: 'Newsletter section', spec: 'A newsletter section of 180 to 300 words. First line: "Subject: " followed by a subject line under 60 characters. Second line: a ## heading. Then short paragraphs, one concrete example from the source, and a one-line takeaway in bold at the end.' },
  { channel: 'short_video_script', label: 'Short video script', spec: 'A 45 to 60 second vertical video script, 110 to 170 spoken words. Use these labelled parts on their own lines: HOOK (0-3s), SETUP, PAYOFF, CTA. Under each part write the spoken line, and add [ON SCREEN: ...] cues on separate lines. The hook must work with the sound off.' },
  { channel: 'seo_blog_draft', label: 'SEO blog draft', spec: 'An SEO blog draft of 700 to 1100 words in markdown. First three lines exactly: "Title: ...", "Meta description: ..." (under 155 characters), "Target keyword: ..." (use the brief seo_keyword). Then the article with one # H1, at least three ## H2 sections, a short FAQ with 2 questions, and a conclusion. Use the target keyword in the H1 and in the first 100 words.' }
];

return channels.map(function (c) {
  return { json: {
    run_id: src.run_id,
    source_title: src.source_title,
    source_type: src.source_type,
    channel: c.channel,
    channel_label: c.label,
    brief_parsed: briefParsed,
    brief_stop_reason: res.stop_reason || '',
    brief_input_tokens: usage.input_tokens || 0,
    brief_output_tokens: usage.output_tokens || 0,
    brief_thinking_tokens: details.thinking_tokens || 0,
    system_prompt: 'You turn one long-form source into a single channel-ready draft. Rules:\n- ' + rules,
    user_prompt: 'CHANNEL: ' + c.label + '\nSPEC: ' + c.spec + '\n\nBRIEF:\n' + briefStr + '\n\nSOURCE (' + src.source_title + '):\n<source>\n' + src.source_body + '\n</source>\n\nWrite the ' + c.label + ' now.'
  } };
});

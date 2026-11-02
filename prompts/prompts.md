# Prompts

These are the exact prompts running in the workflow (v3, November 1, 2026).

## 1. Content brief (Claude Haiku 5.5, max 8,000 output tokens)

**System**

> You are a senior content strategist. You extract, you do not invent. If the source does not say something, it does not go in the brief.

**User**

```
SOURCE TITLE: {{ source_title }}

SOURCE:
<source>
{{ source_body }}
</source>

Read the source and return a content brief as JSON only, no prose, no code fences, with exactly these keys:
{"core_message": "one sentence", "audience": "who this is for", "key_points": [{"point": "...", "evidence": "detail from the source that supports it"}], "facts": ["every number, name or claim worth reusing, copied exactly as written in the source"], "quotable_lines": ["short lines from the source that work on their own"], "hook_angles": ["3 different opening angles"], "lesson": "the one non-obvious takeaway", "seo_keyword": "a realistic search phrase", "cta": "a natural next step for the reader"}
Use 4 to 6 key_points. Only include what the source supports.
```

Why 8,000 tokens: in v1 the budget was 2,000 and the model spent 1,210 of them on hidden reasoning, which cut the JSON off mid-sentence.

## 2. Channel drafts (Claude Sonnet 5.5, one call per channel, max 3,000 output tokens)

**System** (built in `workflow/plan_channel_jobs.js`)

```
You turn one long-form source into a single channel-ready draft. Rules:
- Use only facts, numbers and names that appear in the SOURCE or BRIEF. Never invent results, metrics, people or quotes.
- If a detail is needed but missing, write [CHECK: what is missing] instead of guessing.
- Write in this voice: {{ voice_notes }}
- Never use these words: game-changer, revolutionize, unlock, supercharge, delve, leverage, cutting-edge, seamless, in today's fast-paced world.
- Output only the deliverable. No preamble, no notes to the editor.
```

Default voice when the form field is empty:

> Plain, direct, first person. Short sentences. Specific numbers over adjectives. No hype words. Honest about trade-offs and what did not work. No emojis. No em dashes.

**User**

```
CHANNEL: {{ label }}
SPEC: {{ spec }}

BRIEF:
{{ brief JSON }}

SOURCE ({{ source_title }}):
<source>
{{ source_body }}
</source>

Write the {{ label }} now.
```

## 3. Channel specs

| Channel | Spec given to the model | What the gate enforces in code |
| --- | --- | --- |
| LinkedIn post | 150 to 250 words; hook of at most 15 words; 2 lines of context; "What I built / What happened" with → arrows; one PM lesson; end with a question; at most 3 hashtags; no links | 120 to 270 words, at most 3 hashtags, no links, first line at most 18 words |
| X thread | 5 to 8 posts separated by `---`; each under 270 characters; standalone hook; no hashtags; no numbering | 5 to 8 posts, each at most 280 characters |
| Newsletter section | 180 to 300 words; `Subject:` line under 60 characters; `##` heading; one concrete example; bold one-line takeaway | starts with `Subject:`, 160 to 330 words |
| Short video script | 45 to 60 seconds, 110 to 170 spoken words; HOOK (0-3s), SETUP, PAYOFF, CTA; `[ON SCREEN: ...]` cues | all four parts present, 100 to 185 spoken words |
| SEO blog draft | 700 to 1,100 words; Title, Meta description (under 155 characters), Target keyword lines; one H1; at least 3 H2s; 2-question FAQ; conclusion | title and meta present, meta at most 160 characters, at least 3 H2s, 650 to 1,200 words |

The prompt limits are deliberately tighter than the gate limits. The prompt aims; the gate catches what still misses.

## 4. Checks that apply to every draft

- Banned hype words (list above)
- Em dashes
- `[CHECK: ...]` placeholders left by the model (v3: matches only the colon form, so a draft that quotes the phrase "[CHECK] note" is not flagged)
- Every number above 10, and every percentage, must appear in the source text (commas ignored)

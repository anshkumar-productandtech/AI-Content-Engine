I built an AI content engine. Its most useful output was a draft that refused to finish.

The problem is simple. One strong long-form piece, a webinar, a podcast or a deep blog post, gets published once and dies. The LinkedIn post, the X thread, the newsletter section, the short video and the SEO article never get made, because each one is another rewrite.

So I built a workflow in n8n that takes one source and returns five channel drafts on an approval board. It accepts a blog URL, which Firecrawl scrapes to markdown, an audio file URL, which Whisper transcribes, or a pasted transcript. If the source is under 150 words, the run stops before any AI call. One Claude Haiku 5.5 call writes a fact-only brief. Then one Claude Sonnet 5.5 call per channel writes the drafts. A quality gate written in plain code checks every draft for length, format, hype words, and whether every number in the draft appears in the source. Every draft lands on the board as needs review. Nothing posts automatically.

What happened in testing

I ran the engine 5 times on November 1. Four full runs produced 20 drafts. Two runs used a 899-word article I wrote. Two used a 6,064-word public page from the GitLab handbook. The fifth run was a 28-second public-domain audio clip. Whisper transcribed it in about 2 seconds, it came to 67 words, and the guard stopped it with zero tokens spent. That is the behaviour I wanted.

Full runs took between 67 and 88 seconds from submit to five drafts on the board.

15 of 20 drafts passed the quality gate on the first try.

The number check never fired. Zero drafts contained a number that was not in the source. I still keep it, because the one time it matters is the one time you would not notice.

The character check did fire. The prompt told the model to keep each X post under 270 characters. One post came back at 281. Code caught it. That is the case for rules in code: the prompt is a request, the code is a guarantee.

The first version had a real bug. The brief call ran out of room. Claude Haiku spent 1,210 of its 2,000 output tokens on hidden reasoning, so the JSON brief was cut off mid-sentence. Nothing crashed. The SEO draft noticed its target keyword was missing and wrote a [CHECK] note instead of inventing one, and the gate flagged it. I raised the budget to 8,000 tokens and added logging for reasoning tokens and brief parsing. In version 2 the brief parsed cleanly on both sources.

On version 2, the only SEO flag was the best possible failure. Asked to describe results it did not have, the model wrote a [CHECK] note asking for real timing and pass-rate numbers instead of making them up.

What it costs

At Anthropic list prices, a run on the 899-word article cost about 12 cents. A run on the 6,064-word page cost about 28 cents, because each of the five draft calls sends the full source again: almost 92,000 input tokens. More than half of the output tokens on the draft calls were hidden reasoning, about 38% of the cost of a short run.

The next fix is prompt caching on the shared source, which should bring long runs down to about 16 cents.

The PM lesson

Put the rules you cannot afford to break in code, not in the prompt. Then design the failure state as carefully as the happy path. A draft that says "I need a real number here" is worth more than a draft that sounds finished.

The question I keep coming back to: would you let AI post for you, or only draft?

Why one good article should never be the end of the job

Most marketers I talk to have the same problem. They put real effort into one long piece of content: a webinar, a podcast episode, a founder interview, a deep blog post. Then it gets published once and dies. The LinkedIn post, the X thread, the newsletter blurb, the short video and the SEO version never get made, because each one is another hour of rewriting for a different format and a different reader.

So I built an AI content engine that does the repurposing step. You give it one long-form source. It gives you five channel-ready drafts and puts them on an approval board. A person still decides what goes out.

What it takes in

The engine accepts three kinds of input. A blog URL, which it scrapes into clean markdown with Firecrawl. An audio file URL, which it transcribes with OpenAI's Whisper model. Or a pasted transcript, which covers YouTube videos and podcasts that already have captions.

I deliberately left out direct YouTube downloading. It breaks often, it sits in a grey area of the platform's terms, and almost every video worth repurposing already has a transcript you can copy in a few seconds. Scope is a product decision, not a technical one.

How it works

The workflow runs in n8n and has five stages.

First, ingest. Whatever comes in becomes plain text. If the text is shorter than 150 words, the run stops. A source that short cannot be turned into five pieces without the model making things up, so the engine refuses instead of padding.

Second, the brief. One Claude call reads the whole source and returns a structured brief: the core message, the audience, four to six key points with the evidence for each, a list of facts copied exactly as written, quotable lines, three hook angles, one lesson and a search keyword. The brief prompt has one rule above all others: extract, do not invent.

Third, the drafts. The engine makes one call per channel instead of one giant call for everything. Each call gets its own spec. The LinkedIn post must be 150 to 250 words with a hook in the first line and a question at the end. The X thread must be five to eight posts, each under 270 characters. The newsletter section needs a subject line under 60 characters. The short video script needs a hook, setup, payoff and call to action with on-screen cues. The SEO draft needs a title, a meta description under 155 characters, at least three H2 sections and an FAQ. Splitting the calls costs a little more, but each format gets the model's full attention and one failed draft never takes the others down with it.

Fourth, the quality gate. This is the part I care about most. Before anything reaches a human, plain code checks every draft. Is it the right length for its channel? Does it follow the format? Does it use any of the hype words on the banned list? And the important one: does every number in the draft actually appear in the source? Language models are good at sounding specific. A made-up "40% faster" reads just as confidently as a real one. The gate does not judge quality. It catches the errors that would embarrass you.

Fifth, the approval board. Every draft lands in a table with its channel, word count, gate result, the notes explaining any failure, and the token count. Status starts as needs review. Nothing is published automatically.

The decisions that mattered

Brand voice is an input, not a prompt tweak. The form has a voice notes field. Leave it empty and the default voice applies: plain, direct, first person, short sentences, specific numbers over adjectives, honest about trade-offs, no hype. Fill it in and a different brand gets its own voice without touching the workflow.

Human in the loop is the default, not an option. Automatic posting would make a better demo and a worse product. The cost of one confidently wrong post is higher than the cost of a two-minute review.

Rules in code beat rules in prompts. I asked the model nicely to stay under 280 characters per post and to avoid inventing numbers. It mostly listens. Mostly is not good enough for something with your name on it, so every rule that can be checked by code is checked by code.

Cost is tracked from day one. Every draft records its input and output tokens, so the cost of one source becomes a number I can see, not a guess.

What I am measuring

Three things. How long a full run takes from submit to five drafts on the board. How many drafts pass the quality gate on the first try, and why the others fail. And how much of each draft a human still has to edit before it is ready to publish. If people rewrite most of a draft, the engine saved typing, not thinking. If they change a few lines, it saved real time.

Who this is for

Solo founders, small marketing teams and anyone who creates one strong piece a week and wants it to show up everywhere their audience is. It is not for teams that want to publish without reading. The point is to move a person from writing five things to reviewing five things.

# Personal Discovery Flow — Product Spec

## Overview

A **separate, end-to-end flow** for personal discovery: emotional, user-driven, and built around "aha moments" and progressive insight. This flow is distinct from the existing team/culture assessment flow.

**Core principles:**
- User chooses what to explore (curiosity + outcome framing)
- Insights surface progressively when possible
- First value = first possible insight from the model they chose
- After results: option to dive deeper (same model) or explore other models
- Reframe existing models (OCEAN, culture, values) to be personal/emotional; add new models
- Entire journey—including results—lives in this separate flow

---

## 1. Entry & Selection (Mix of Curiosity + Outcome)

### 1.1 Entry point
- Dedicated route, e.g. `/discover` or `/explore`
- Clear separation from "team assessment" / "culture mapping" (those stay as-is)
- Messaging: discovery, self-awareness, what moves you—not "assessment"

### 1.2 Selection screen: "What would you like to explore?"

**Framing: curiosity (B) + outcome (C).** Each option is a card/tile with:
- A curiosity hook: "What energizes me?" / "What drains me?"
- An outcome: "Feel more energized" / "Protect your energy"
- Optional: time estimate, e.g. "~5 min"

**Option set (to be refined):**

| Option label (curiosity + outcome)     | Maps to model(s)                    |
|----------------------------------------|-------------------------------------|
| What energizes me? / Feel more energized | Energy (new)                        |
| What drains me? / Protect your energy   | Energy (new)                        |
| How do I work best? / Work in flow      | OCEAN (reframed) + Culture (reframed) |
| What truly motivates me? / Align with what matters | Work values (reframed) + What Moves You (new) |
| How do I connect with others? / Better relationships | Attachment styles (new) + Love languages (new) + OCEAN (reframed) |
| How do I love? / Express love better | Love languages (new) + Relationship patterns (new) |
| How do I handle conflict? / Resolve disagreements better | Conflict style (new) + Communication style (new) |
| How do I make decisions? / Decide with confidence | Decision compass (new)              |
| What helps me grow? / Grow in the right direction | Growth (new) + Learning style (new) |
| Why do I get stressed? / Handle pressure better | Stress response (new)               |
| How do I understand my emotions? / Emotional awareness | Emotional intelligence (new) |

- User picks **one** to start (or we allow multiple and suggest "start with this one").
- Selection drives which model(s) they enter.

---

## 2. Model Layer: Reframed + New

### 2.1 Reframed existing models (personal/emotional)

- **OCEAN**  
  - Reframe: communication style, how you recharge, how you work with others, how you handle change.  
  - Language: "You thrive when…", "You feel most alive when…", "You prefer…"  
  - Still used for: communication preferences, work style, team collaboration—but presented as discovery, not "personality test".

- **Cultural dimensions**  
  - Reframe: how you like structure, hierarchy, ambiguity, time, recognition.  
  - Language: "You feel comfortable when…", "You work best in environments where…"

- **Work values**  
  - Reframe: what matters to you at work and in life, what gives meaning.  
  - Language: "You're motivated when…", "You feel fulfilled when…"

### 2.2 New models (to be designed)

**Core personal models:**
- **Energy**: what boosts vs. drains energy (activities, contexts, people, pace).
- **What Moves You**: deeper motivations, purpose, meaning (can overlap with work values but more personal).
- **Decision compass**: how you decide (head/heart, speed, risk, information).
- **Growth**: what conditions help you learn and grow.
- **Stress response**: how you react under pressure and what helps.

**Relationship & connection models:**
- **Attachment styles**: secure, anxious-preoccupied, dismissive-avoidant, fearful-avoidant (how you form emotional bonds, what you need in relationships).
- **Love languages**: words of affirmation, acts of service, receiving gifts, quality time, physical touch (how you give and receive love/affection).
- **Relationship patterns**: how you show up in relationships, what you need, communication style in intimate/close relationships.
- **Communication style**: how you express yourself, listen, handle conflict (beyond OCEAN, more relational).

**Additional personality/self-awareness models:**
- **Emotional intelligence**: awareness of your emotions, managing them, reading others' emotions.
- **Conflict style**: how you handle disagreements (collaborator, competitor, accommodator, avoider, compromiser).
- **Learning style**: how you process information (visual, auditory, kinesthetic, reading/writing).
- **Creativity style**: how you express creativity, what sparks it.
- **Leadership style** (personal): how you naturally lead or influence (not just work contexts).

Mapping from selection → model(s) will be explicit (e.g. "What energizes me?" → Energy model).

---

## 3. Assessment Experience (Progressive Insights)

### 3.1 In-model flow
- **Progressive reveal**: as soon as we can infer something useful, show it (e.g. "We're noticing a pattern…" or "Here’s something that might resonate…").
- **Not only one insight**: surface multiple insights when the model supports it (e.g. one energy booster + one drainer).
- **Question design**: short, emotional, concrete (scenarios, "when do you feel…", "what happens when…").

### 3.2 Example flow (e.g. Energy)
1. User chose "What drains me?" / "Protect your energy".
2. Short set of questions (e.g. 5–10) about situations, people, tasks, environment.
3. **During or right after**: first insight, e.g. "One thing that often drains people like you is constant context-switching. Here’s a simple way to protect yourself: …"
4. If we have more: "We also see that … might be draining. Want to explore that?"
5. **After assessment**: results step (see below) with option to "Dive deeper" (same model) or "Explore another area".

---

## 4. Results Page (Separate Flow, Emotional)

### 4.1 Principles
- **Separate flow**: its own layout, components, and URL structure (e.g. `/discover/results/[sessionId]` or per-model).
- **Emotional first**: narrative and "what this means for you" before any scores.
- **Progressive**: same idea as in-assessment—reveal insights in an order that builds understanding.
- **Charts/scores**: optional, secondary; only if they add to the story ("Here’s how this shows up in your pattern").

### 4.2 Results structure (per model)
1. **Headline insight**: one sentence that captures the main "aha" (e.g. "You protect your energy when you have clear boundaries.")
2. **What we noticed**: 2–3 short, personal insights (no jargon).
3. **What this means for you**: 1–2 practical implications (work, life, relationships).
4. **One thing to try**: single, concrete next step.
5. **Optional**: simple visual (e.g. one small chart or pattern) only if it supports the story.
6. **Explore more** (see below).

### 4.3 "Explore more" on results
- **Dive deeper (same model)**: e.g. "Explore other energy drainers" / "See your full energy profile."
- **Other models**: e.g. "You might also like: What energizes you?" / "How do you work best?" with clear outcome (Feel more energized / Work in flow).
- Both present on the same results page (e.g. two sections or two groups of cards).

---

## 5. User Journey (End-to-End)

```
[Landing / Discover]
        ↓
"What would you like to explore?" (selection: curiosity + outcome)
        ↓
[One model chosen] → Assessment (progressive insights when possible)
        ↓
[Results] First insight(s) + meaning + one thing to try
        ↓
Explore more: [Dive deeper in same model] + [Try another model]
        ↓
Loop: user picks "dive deeper" or "another model" → assessment → results → explore more
```

- No "ideal first model": the first model is the one the user chose.
- Sessions can be anonymous or linked to an account; we can later add "Your discovery journey" (list of completed models + key insights).

---

## 6. Visual Identity & Emotional Design

### 6.1 Core principles
- **Personal, not clinical**: warm, inviting, human—not assessment/test vibes.
- **Emotional resonance**: visuals should evoke feeling, not just convey information.
- **Progressive enhancement**: animations and visuals support the journey, don't distract.

### 6.2 Visual elements

**Animations (Framer Motion):**
- **Micro-interactions**: subtle hover effects, button presses, card selections.
- **Progress indicators**: animated progress bars/rings during assessment (not just static).
- **Transitions**: smooth page transitions, fade-ins for insights, staggered reveals for results.
- **Question flow**: questions slide/fade in smoothly, answers animate on selection.
- **Results reveal**: insights appear progressively with gentle animations (fade + slide, scale).
- **Loading states**: engaging loading animations (not just spinners—maybe abstract shapes, patterns).

**AI-generated imagery (for results pages):**
- **Personalized visuals**: generate images based on user's results (e.g., DALL-E, Midjourney, Stable Diffusion API).
- **Visual metaphors**: abstract or symbolic images that represent their insight (e.g., "You protect your energy with boundaries" → image of a calm, protected space).
- **Emotional resonance**: images that evoke the feeling of their insight (energized, calm, connected, etc.).
- **Consistency**: maintain visual style across generated images (prompt engineering for consistent aesthetic).
- **Fallbacks**: beautiful default illustrations if AI generation fails or is slow.

**Color & typography:**
- **Emotional color palette**: warm, inviting colors (not just blue/functional).
- **Gradients**: subtle gradients for depth and emotion.
- **Typography**: friendly, readable, human (not clinical/sans-serif only).
- **Spacing**: generous whitespace for breathing room.

**Illustrations & icons:**
- **Custom illustrations**: where AI images aren't used, custom illustrations (not stock photos).
- **Iconography**: consistent icon system that supports emotional messaging.
- **Abstract patterns**: subtle background patterns/textures for depth.

### 6.3 Implementation approach

**Framer Motion:**
- Install `framer-motion` package.
- Use for: page transitions, component animations, progress indicators, micro-interactions.
- Performance: use `layoutId` for shared element transitions, `AnimatePresence` for exit animations.
- Accessibility: respect `prefers-reduced-motion`.

**AI image generation:**
- **API options**: OpenAI DALL-E 3, Midjourney (via API if available), Stability AI (Stable Diffusion).
- **Workflow**: 
  1. User completes assessment → results calculated.
  2. Generate prompt based on their insight (e.g., "A calm, protected space with soft boundaries, warm light, peaceful atmosphere, abstract style").
  3. Call AI API → get image URL.
  4. Cache image (store URL with session/results) to avoid regenerating.
  5. Display on results page (with loading state → fade in when ready).
- **Prompt engineering**: create templates for each model/insight type to ensure consistent style.
- **Cost consideration**: cache aggressively, maybe generate on-demand (not pre-generate all combinations).
- **Fallback**: if API fails/timeout, use beautiful default illustration.

**Design system:**
- Define color palette (warm, emotional).
- Define animation timing/easing (smooth, natural).
- Define typography scale.
- Component library: animated cards, buttons, progress indicators, result cards.

---

## 7. Technical / Implementation Notes (High Level)

- **Routes**: e.g. `/discover`, `/discover/explore`, `/discover/[modelSlug]`, `/discover/[modelSlug]/results`, `/discover/results/[sessionId]`.
- **State**: which model(s), which questions answered, which insights already shown (for progressive reveal).
- **Content**: model definitions, question sets, insight rules, and copy live in CMS or structured content (to keep flow and wording easy to iterate).
- **Analytics**: selection choices, model completion, "dive deeper" vs. "other model" clicks—to refine options and ordering.

---

## 8. Out of Scope for This Flow

- Team dashboard, team invites, culture mapping, candidate fit (unchanged; separate flows).
- Replacing the current assessment/results UX; this is an additional, separate experience.

---

## 9. Next Steps (Suggested)

1. **Model expansion**: Finalize full list of models (relationship models, attachment, love languages, etc.) and map to selection options.
2. **Content**: Define 2–3 models in detail (e.g. Energy + Attachment styles + one reframed, e.g. OCEAN) with questions and insight rules.
3. **Selection screen**: Final list of options (curiosity + outcome) and mapping to models.
4. **Visual identity**: 
   - Design system (colors, typography, spacing).
   - Framer Motion animation specs (what animates, how, timing).
   - AI image generation strategy (which API, prompt templates, fallbacks).
5. **Progressive insight**: Logic for when to show in-assessment vs. post-assessment insights.
6. **UI**: Wireframes/mockups for selection, assessment, and results (with animations and AI images).
7. **Build**: Implement selection → one model (e.g. Energy) → results (with animations + AI images) → explore more, then add more models.

This spec is the single source of truth for the personal discovery flow and the separate results experience.

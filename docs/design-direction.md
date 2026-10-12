# NovemberAI — Explorer × Spec

Source: the user's Claude Design project, inspected through Aside on October 12, 2026:
https://claude.ai/design/p/39e4c1e0-b2e3-442f-a4c1-25e610af159e

## Priority: the seven latest user prompts

The recent conversation asks, in order, to:

1. Center hands-free mode, voice execution, and full browser execution, showing them as embedded mockups. Approval is secondary.
2. Show pendant and desk-stand hardware, Meta glasses and Apple Watch SDKs, wider margins, and emphasize progress and conversation.
3. Show two-way speech and local, stateful memory. Waveforms must keep moving while the assistant works and speaks.
4. Explore creative, modern, technical mockups.
5. Make proactive updates distinctive: signed YouTube/Twitter deals, view milestones, and other web events, beyond calendars and email.
6. Keep the product branded NovemberAI; do not switch to INDU.
7. Show multiple mockups.

The immediately preceding typography feedback also aligns with the two selected references: technical, professional, thin, elegant type. Older approval-led proposals are superseded by these prompts.

## What comes from each reference

- **Site B Explorer:** centered headline, Sora typography, light navy/blue palette, original mascot, voice orb, three example tasks, five capability tabs, pendant/desk toggle, roadmap.
- **Site A Spec:** subtle vertical grid, IBM Plex Mono labels, section numbering, Voice/Plan/Browser columns, interactive six-stage timeline, runtime specifications, terminal-style access form.
- **Combined:** Explorer's visual breathing room with Spec's visible explanation of execution. Product demos are illustrative, not live browser automation. Multiple scenarios and four capability mockups demonstrate the product in the one combined site requested here.

## Assets and content

- `public/assets/november-mascot.png` is the original user-provided mascot from the shared design (`uploads/indu.png`). The original asset filename is not product branding.
- Fonts are self-hosted Sora (300/400/600) and IBM Plex Mono (400), downloaded from Google Fonts. Both are SIL Open Font License fonts; licenses are included with the assets.
- Hardware is an inline SVG concept illustration, labeled as such; no production hardware photo was provided.
- Timeline dates and beta size are retained from the selected mockups, with a visible note that the roadmap may evolve. Confirm before a real launch.
- Pricing is omitted because no price has been confirmed.
- The waitlist is a UI preview. It validates input and explicitly states that nothing is sent or saved. Connect an actual signup service before using it for registration.
- Sound plays only after the visitor explicitly chooses the audio or replay control. No microphone permissions or audio recording.

## Behavior

The main demo starts idle. Three choices on the right start six-turn spoken conversations, with alternating user and November transcripts, active-speaker waveforms, and inline browser actions inside one workspace. The chosen scenario stops at completion and never cycles to another. Pause/continue, replay, show-full-conversation, and opt-in audio controls are available. Reduced-motion preference shows the complete selected conversation without timed animation. All choices are keyboard buttons; feature tabs retain arrow/Home/End navigation. On phones, the choices sit above the transcript. Hardware buttons update the concept illustration and specifications.

## October 12 review revisions

- Headline: “Just Talk to it, November Handles the rest”.
- Subheadline: “A voice that works WITH you. It clicks, browses, and acts without you staring at a screen. Talking you through every step. Remembering and reminding you what makes you, you.”
- Removed the metadata strip above the hero. Increased small arrows and muted-text contrast, and separated the email field and button with a 12px gap and an independent focus outline.
- Merged hands-free and voice execution. The four tabs are Hands-free execution, Full browser, Memory, and Progress & alerts.
- Replaced career-fair examples with Walmart groceries and Airtable brand-deal tracking. Progress demonstrates YouTube view milestones and signed YouTube/X partnerships, with spoken replays.
- The pendant body is a droplet connected to a continuous necklace by a metal ring. The desk version is a larger droplet resting on a low base.
- Checked responsive widths of 320, 390, 768, and 1440px without horizontal page overflow, plus hardware toggles, scenario completion, progress replay, and signup spacing.


## Conversation review

The user asked to replace the three-column Voice/Plan/Browser demo with one or at most two stable views, following the interaction pattern on https://www.tryclean.ai/ (inspected through Aside). The result uses one conversation workspace with browser results inline and the three scenario choices on the right. Both speakers have animated voice waves and readable transcripts, including follow-up questions and corrections. The private-beta badge above the headline is removed. Other page sections retain the previous design.

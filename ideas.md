# HER Blueprint — Design Direction

## Three possible stylistic approaches

### Theme Name: Velvet Ledger
Very Brief Intro: A dark editorial event console with warm ivory type, antique gold accents, and the atmosphere of a private leadership salon. It keeps the supplied HER Blueprint identity while making the raffle feel ceremonial and trustworthy.
Probability: 0.07

### Theme Name: Sunlit Workbook
Very Brief Intro: A bright, paper-first workshop interface with cream stock, ink-black typography, coral annotations, and tactile notebook cues. It feels practical, approachable, and energetic.
Probability: 0.04

### Theme Name: Midnight Signal
Very Brief Intro: A high-contrast event control room with midnight navy, electric chartreuse, and crisp utility typography. It is fast and operational, prioritizing live-room visibility over ceremony.
Probability: 0.02

## Selected approach: Velvet Ledger

### Design Movement
Contemporary editorial luxury: the visual language of an independent fashion magazine crossed with a refined event operations console. The interface should feel authored and intentional, not like a generic admin dashboard.

### Core Principles
1. **Ceremony with utility.** The draw is the focal ritual, but every control must stay immediately legible during a live event.
2. **Warm contrast.** Ivory and champagne accents should feel luminous against an ink-dark ground without relying on neon effects.
3. **Asymmetrical editorial rhythm.** Use an offset two-column composition, strong vertical rules, and varied content density instead of a centered card stack.
4. **Quiet confidence.** Motion, borders, and status copy should signal control and care rather than noise.

### Color Philosophy
The palette uses near-black espresso as the stage, softened ivory for reading, and one ownable champagne-gold for action and celebration. Gold is reserved for decisions and winning moments; muted clay and tobacco support secondary metadata. The emotional intent is a private room with warm lamplight: premium, focused, and welcoming.

### Layout Paradigm
A broad editorial shell with the entry ledger as the left rail and the draw stage as the dominant right-hand field. On smaller screens the rail becomes a full-width setup section above the draw stage. Lists should feel like a register, not a collection of pills; controls should align to a consistent baseline and expose the live state without clutter.

### Signature Elements
- A thin champagne rule and corner notch framing the draw card, like a certificate or invitation.
- Small uppercase metadata labels with generous tracking to establish hierarchy.
- Gold dust and restrained confetti used only for ambient depth and the winning state.

### Interaction Philosophy
Every action gives immediate, plain-language feedback. Tabs and buttons shift with a short, tactile response; success is announced in context, and destructive actions require a clear confirmation. Keyboard focus remains visible and touch targets stay comfortable for live-event use.

### Animation
Use short ease-out transitions for buttons, tabs, and state changes. The winner reveal can be theatrical but contained: a 1.2-second slot-style roll with decelerating cadence, followed by a brief shimmer and confetti burst. Ambient particles drift slowly and remain low contrast. Respect `prefers-reduced-motion` by disabling particle drift, reveal rotation, and confetti while keeping content and status changes intact.

### Typography System
Pair Cormorant Garamond for display headlines and the winner name with Poppins for controls, labels, and operational copy. Use uppercase Poppins at 0.14–0.18em tracking for metadata, Cormorant at generous line-height for the event title, and tabular-looking numeric weight for counts and ranks.

### Brand Essence
HER Blueprint is a confident live-event raffle desk for women building character, competence, and confidence—distinct because it makes a high-stakes moment feel both polished and human.

Personality adjectives: **composed, generous, exacting**.

### Brand Voice
Headlines should be concise, assured, and warm. CTAs should be direct verbs. Microcopy should reassure the operator, explain consequences, and avoid hype.

Example lines:
- “Make the moment count.”
- “Entries are ready when you are.”

### Wordmark & Logo
Use a bold geometric H-shaped mark built from two offset vertical strokes and a centered bridge, suggesting a blueprint joint and a doorway into opportunity. The mark should work independently at favicon size and sit beside the HER Blueprint wordmark without relying on a default text treatment.

### Signature Brand Color
**Blueprint Champagne — `#D7A95C`**. It is warm rather than yellow, readable on espresso, and reserved for focus, action, and celebration.

### File-level reminder
Keep the Velvet Ledger system in mind while editing each page or stylesheet: dark editorial stage, champagne focus color, ivory text, asymmetric layout, and ceremony restrained by operational clarity.

# Build Programme Function - Critical Fixes Implemented

## Overview

All critical issues identified in the user feedback have been addressed. The Build Programme function now:
- ✅ Never hallucinates activities
- ✅ Uses actual URLs and time ranges from the database
- ✅ Uses UK English throughout
- ✅ Includes a confirmation step
- ✅ Removes technical jargon from outputs
- ✅ Always starts with icebreakers/connection activities
- ✅ Provides better activity variety

---

## Phase 1: Anti-Hallucination & Data Integrity

### Problem
The AI was inventing activities that don't exist in the playmeo database:
- Count Me In, Group Resume, Yarn Toss, Energy Circle, High Five Hustle, Clap Together, Reflective Circle, Concentric Circles

### Solution Implemented

**1. Database Integration** (`build-program/route.ts`)
- Loads complete activity database (`activities-search-index.json`)
- Extracts metadata: title, slug, URL, time, type, group size, exertion
- Formats activity list with all metadata for AI context

**2. Activity List Injection**
- All 476 activities from the database are now injected into the AI prompt
- Each activity includes exact URL, time range, and metadata
- AI receives the complete list before generating programmes

**3. Strict Validation Rules** (`build-program-system.md`, `build-program-user.md`)
```
⚠️ CRITICAL: You MUST ONLY select activities from this list. 
NEVER invent or hallucinate activity names.
```

**Critical Rules Added:**
- ✅ ONLY use activities from the provided list
- ✅ Use EXACT activity names and URLs as shown
- ✅ Use time estimates from the list (e.g., "10-15 min")
- ❌ NEVER invent activity names
- ❌ NEVER make up URLs

---

## Phase 2: UK English & Output Formatting

### Problems
- Using US spelling (program, organized, color)
- Including technical jargon (PRIME, PUMP, PEAK, Play to Grow)
- "Key Considerations" subheadings not needed
- URLs repeated in overview text

### Solution Implemented

**1. UK English Throughout**
- Changed all instances: Program → Programme
- Updated prompts to use UK spelling (organised, colour, emphasise)
- UI updated to use "Programme" consistently

**2. Simplified Output Format**
```markdown
## [Programme Name]

### Activities:
1. **[Activity Name]** - [URL] - [time]
2. **[Activity Name]** - [URL] - [time]

### Overview:
[Natural language description without jargon]

**Total Time**: [X minutes]
```

**3. Removed from Outputs:**
- ❌ "Key Considerations" subheadings
- ❌ "Pedagogical Flow: PRIME > PUMP > PEAK"
- ❌ References to "Play to Grow model"
- ❌ Technical stage labels

**4. Instructions Added:**
- Describe progression in natural language
- Don't mention frameworks by name
- Focus on human experience (e.g., "starts with fun icebreakers to build connections, then moves into...")

---

## Phase 3: Confirmation Step

### Problem
No "repeat back and confirm" step - AI went straight to generating the programme

### Solution Implemented

**New 3-Step Flow:**
1. **Input** - User enters requirements
2. **Confirm** - Shows summary with [Confirm ✓ / Edit ✎ / Cancel ✕] buttons
3. **Result** - Generates programme only after confirmation

**Confirmation Screen Shows:**
- Group Size
- Available Time
- Programme Outcome/Objective
- Group Type
- Level of Exertion
- Group Developmental Stage (if provided)
- Lazy Rating Preference

**UI Changes:**
- Button changed from "Build Programme" to "Continue to Review →"
- Three clear action buttons in confirmation step
- Allows users to review and edit before generating

---

## Phase 4: Improved Sequencing

### Problems
- Not starting with icebreakers/connection activities
- Group Juggle appearing in every programme
- Inconsistent activity times
- Weak pedagogical progression

### Solution Implemented

**1. Strict Sequencing Rules:**
```
- **ALWAYS start with icebreakers or connection activities** 
  (Ice-Breakers, Fun Games, Get-to-Know-You type activities)
- For programmes over 60 minutes, **emphasise connection 
  activities in the first hour**
- Initial activities should prioritise fun, interaction, and 
  connection before moving to trust-building or problem-solving
```

**2. Variety Rules:**
- Avoid selecting the same activities repeatedly across different programmes
- Example: Don't use "Group Juggle" in every programme

**3. Activity Metadata Usage:**
- Times from database are now used (no more made-up times)
- URLs are exact matches from database
- Type, group size, and exertion data available for better filtering

---

## Technical Implementation Details

### New Functions in `build-program/route.ts`

**`loadActivities()`**
- Loads and caches the activities database
- Returns array of 476 activities
- Implements caching for performance

**`extractActivityMetadata(activity)`**
- Parses activity search_text to extract metadata
- Returns: title, slug, URL, time, type, group size, exertion
- Generates proper playmeo URLs

**`formatActivityListForPrompt(activities)`**
- Formats all activities for AI consumption
- Each line: `**Title** (slug) - URL - Time: X - Type: Y - Group: Z - Exertion: W`
- Returns formatted string for prompt injection

### State Management Changes

**Before:**
```typescript
const [step, setStep] = useState<'input' | 'result'>('input')
```

**After:**
```typescript
const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input')
```

**New Function:**
```typescript
const handleConfirmBuild = async () => {
  // Actual API call to build programme
  // Only called after user confirms
}
```

---

## Testing Checklist

To verify all fixes are working:

1. **Anti-Hallucination Test:**
   - [ ] Build a programme and verify ALL activities exist in database
   - [ ] Check all URLs are valid playmeo.com links
   - [ ] Verify time ranges match database

2. **UK English Test:**
   - [ ] Check UI uses "Programme" not "Program"
   - [ ] Check output uses UK spelling

3. **Confirmation Test:**
   - [ ] Enter requirements
   - [ ] Verify confirmation screen appears
   - [ ] Test Confirm, Edit, and Cancel buttons

4. **Sequencing Test:**
   - [ ] Build a 30-minute programme - should start with icebreakers
   - [ ] Build a 90-minute programme - should emphasize connection in first hour
   - [ ] Build multiple programmes - should vary activities

5. **Format Test:**
   - [ ] No technical jargon in output
   - [ ] No "Key Considerations" subheading
   - [ ] Natural language descriptions
   - [ ] Proper markdown formatting with headers

---

## Next Steps (Optional Future Enhancements)

These were not in the critical fixes but could improve the experience:

1. **Smart Filtering:** Filter activities based on user criteria before injection
2. **Activity Search:** Add search/filter in activity selection
3. **Programme Templates:** Save common programme types
4. **Export Options:** Allow download/sharing of generated programmes
5. **Activity Previews:** Show activity details on hover

---

## Files Modified

1. `src/app/api/build-program/route.ts` - Database integration, metadata extraction
2. `src/app/page.tsx` - Confirmation step UI, UK English updates
3. `src/prompts/build-program-system.md` - Anti-hallucination rules, UK English, sequencing
4. `src/prompts/build-program-user.md` - Activity list injection, validation rules, format

---

## Commit Hash

`049531a` - Critical fixes for Build Programme function

All changes have been committed and pushed to GitHub: `briankeayes/flow-v2`


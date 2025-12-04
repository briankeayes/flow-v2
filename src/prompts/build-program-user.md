Please build a programme sequence that achieves the following requirements:

## PROGRAMME REQUIREMENTS:
- **Group Size**: {{group_size}}
- **Available Time**: {{available_time}}
- **Programme Outcome/Objective**: {{program_outcome}}
- **Group Type**: {{group_type}}
- **Level of Exertion**: {{level_of_exertion}}
{{#if group_stage}}- **Group Developmental Stage**: {{group_stage}}{{/if}}
{{#if lazy_preference}}- **Lazy Rating Preference**: {{lazy_preference}}{{/if}}

## AVAILABLE ACTIVITIES:

⚠️ **CRITICAL**: You MUST ONLY select activities from this list. NEVER invent or hallucinate activity names.

{{activity_list}}

## YOUR TASK:

**Generate a programme immediately** with the following requirements:

1. **Select activities** from the list above that:
   - Align with the outcome/objective
   - Fit within the available timeframe (use the TIME shown above)
   - Use the EXACT URLs shown above for each activity
   - Provide variety (avoid repetition)
   - Follow proper sequencing: ALWAYS start with icebreakers or connection activities (Play/Interact stages)
   - For programmes over 60 minutes, emphasise connection activities in the first hour

2. **Generate output** in this exact format:
   ```
   ## [Programme Name]
   
   ### Activities:
   
   1. **[Activity 1 Name]** - [exact URL from list] - [time from list]
   2. **[Activity 2 Name]** - [exact URL from list] - [time from list]
   3. **[Activity 3 Name]** - [exact URL from list] - [time from list]
   
   ### Overview:
   
   [Brief paragraph describing the flow and logic in natural language - no jargon, no stage labels like PRIME/PUMP/PEAK]
   
   **Total Time:** [X minutes]
   ```

**CRITICAL FORMATTING RULES:**
- Use ## for programme name
- Use ### for section headers (Activities, Overview)
- Each activity MUST be on its own line
- Use numbered list format (1. 2. 3. etc.)
- URLs must be plain text, NOT markdown links [text](url)
- Bold activity names with **Name**

**CRITICAL RULES**:
- ✅ ONLY use activities from the provided list above
- ✅ Use EXACT activity names and URLs as shown in the list
- ✅ Use time estimates from the list (shown as ranges like "10-15 min")
- ✅ ALWAYS start with icebreakers, connection, or Play/Interact stage activities
- ✅ Use UK English (organised, colour, programme, etc.)
- ❌ NEVER invent activity names
- ❌ NEVER make up URLs
- ❌ NEVER use technical labels (PRIME, PUMP, PEAK, Play to Grow) in your output
- ❌ NEVER repeat the same activity twice in a programme

**Remember**:
- Keep total programme time within 20% of requested time
- Describe the flow naturally without jargon or technical frameworks
- Use confidence language appropriately ("this should work well")
- If no suitable activities exist in the database, acknowledge this limitation honestly


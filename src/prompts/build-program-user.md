Please build a program sequence that achieves the following requirements:

## PROGRAM REQUIREMENTS:
- **Group Size**: {{group_size}}
- **Available Time**: {{available_time}}
- **Program Outcome/Objective**: {{program_outcome}}
- **Group Type**: {{group_type}}
- **Level of Exertion**: {{level_of_exertion}}
{{#if group_stage}}- **Group Developmental Stage**: {{group_stage}}{{/if}}
{{#if lazy_preference}}- **Lazy Rating Preference**: {{lazy_preference}}{{/if}}

## YOUR TASK:

**Generate a program immediately** with the following requirements:

1. **Select activities** that:
   - Align with the outcome/objective
   - Fit within the available timeframe
   - Default to lazy ratings 1-3 (unless specified otherwise)
   - Provide variety (avoid repetition)
   - Follow pedagogical progression (Play to Grow and PLAN > PRIME > PUMP > PEAK)

2. **Generate output** in this format:
   ```
   [Program Name]
   
   [Activity 1 Name] [URL] [time]
   [Activity 2 Name] [URL] [time]
   [Activity 3 Name] [URL] [time]
   ...
   
   [Brief paragraph describing logic, total time and pedagogical flow]
   ```

Remember to:
- Never repeat the same activity twice
- Prioritize fun, interaction and connection in initial activities
- Keep total program time within 20% of requested time
- Make pedagogical progression implicit rather than explicit
- Use confidence language appropriately ("this should work well")
- Acknowledge if no suitable activities exist in the database


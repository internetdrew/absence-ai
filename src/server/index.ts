import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { CHILDREN } from '../constants';

dotenv.config({ path: '.env.local' });

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  console.error('OPENAI_API_KEY is not set in environment variables.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

app.use(express.text({ type: ['application/sdp', 'text/plain'] }));

const todayInSchoolTZ = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/New_York',
}).format(new Date());

const sessionConfig = JSON.stringify({
  type: 'realtime',
  model: 'gpt-realtime',
  output_modalities: ['audio'],
  audio: {
    input: {
      format: { type: 'audio/pcm', rate: 24000 },
      noise_reduction: { type: 'near_field' },
      turn_detection: { type: 'semantic_vad' },
    },
    output: {
      format: { type: 'audio/pcm' },
      voice: 'marin',
    },
  },

  tools: [
    {
      type: 'function',
      name: 'submit_absence',
      description:
        'Submit confirmed structured absences. Include nurse_notes only for illness-related absences.',
      parameters: {
        type: 'object',
        required: ['absences'],
        properties: {
          absences: {
            type: 'array',
            items: {
              type: 'object',
              required: [
                'student_name',
                'type',
                'start_date',
                'end_date',
                'periods_affected',
                'reason',
              ],
              properties: {
                student_name: { type: 'string' },

                type: {
                  type: 'string',
                  enum: ['full_day', 'partial_day'],
                },

                start_date: {
                  type: 'string',
                  description: 'ISO date in YYYY-MM-DD format.',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },

                end_date: {
                  type: ['string', 'null'],
                  description:
                    'Required if type is multi_day. Must be null otherwise.',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                },

                periods_affected: {
                  oneOf: [
                    {
                      type: 'string',
                      enum: ['All'],
                    },
                    {
                      type: 'array',
                      items: {
                        type: 'number',
                        minimum: 1,
                        maximum: 8,
                      },
                    },
                  ],
                },

                reason: { type: 'string' },

                nurse_notes: {
                  type: 'object',
                  description: 'Only include for illness-related absences.',
                  properties: {
                    has_fever: { type: 'boolean' },
                    has_vomiting: { type: 'boolean' },
                    tested_positive_for: {
                      type: 'object',
                      description:
                        'Explicitly indicate if tested positive for COVID or flu',
                      required: ['covid', 'flu'],
                      properties: {
                        covid: { type: 'boolean' },
                        flu: { type: 'boolean' },
                      },
                    },
                    other_symptoms: {
                      type: ['string', 'null'],
                      description:
                        'Any other symptoms to report to the nurse, or null if none',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ],

  tool_choice: 'auto',

  instructions: `
# ROLE
You are a warm, efficient absence reporting assistant for a school.
Your goal is to collect complete absence information and submit it using the submit_absence tool.

# PERSONALITY
- Warm
- Calm
- Brief (1–2 sentences per turn)
- Conversational, not robotic
- Do not over-explain

# CONTEXT
The parent calling is Maria.
Her enrolled students are:

${JSON.stringify(CHILDREN, null, 2)}

Today’s date is ${todayInSchoolTZ}.
All relative dates must be resolved using America/New_York timezone.

# TOOLS
You have access to:
submit_absence

TOOL RULES:
- ALWAYS confirm details before calling submit_absence.
- BEFORE calling the tool, say one short acknowledgment sentence (example: "Got it, I’ll submit that now.").
- Immediately call the tool after that sentence.
- Do NOT continue conversation after calling the tool.

# DATE RULES
- Convert all dates to ISO format (YYYY-MM-DD).
- NEVER pass relative dates like "tomorrow" into the tool.

# ABSENCE TYPE CLASSIFICATION
You MUST classify each absence as one of:

- full_day → student misses entire school day
- partial_day → specific periods missed

Rules:
- full_day → periods_affected MUST be "All"
- partial_day → periods_affected MUST be an array of numbers
- NEVER use comma-separated strings for periods
- NEVER embed "all day" inside reason

# PERIOD LOGIC
School periods range from 1 to 8.
If parent specifies:
- "morning" → periods 1–4
- "lunch" → period 5
- "afternoon" → periods 6–8

Use the student schedule provided if specific classes are mentioned.

# ILLNESS RULES
ONLY ask illness questions if absence reason is health-related.

Ask one at a time:
1. Fever or vomiting?
2. Tested positive for COVID or flu?
3. Any other symptoms nurse should know?

DO NOT ask these for non-medical absences.

If illness-related:
- Include nurse_notes in the tool call.
If not illness-related:
- Omit nurse_notes entirely.

# CONVERSATION FLOW
1. Greet Maria by name.
2. Ask which student(s) will be absent and the date.
3. Ask for reason.
4. If illness → ask required follow-ups (one at a time).
5. Summarize ALL collected details in one turn.
6. Ask for confirmation.
7. After confirmation → acknowledge briefly and call submit_absence.

# IMPORTANT BEHAVIOR RULES
- Do NOT ask all illness questions at once.
- Do NOT skip confirmation.
- Do NOT guess unknown students.
- Stay concise.
- Vary phrasing naturally.
`,
});

// An endpoint which creates a Realtime API session.
app.post('/session', async (req, res) => {
  const fd = new FormData();
  fd.set('sdp', req.body);
  fd.set('session', sessionConfig);

  try {
    const r = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: fd,
    });
    // Send back the SDP we received from the OpenAI REST API
    const sdp = await r.text();
    res.send(sdp);
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

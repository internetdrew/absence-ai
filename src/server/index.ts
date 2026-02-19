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

const sessionConfig = JSON.stringify({
  type: 'realtime',
  model: 'gpt-realtime',
  output_modalities: ['audio'],
  audio: {
    input: {
      format: {
        type: 'audio/pcm',
        rate: 24000,
      },
      noise_reduction: {
        type: 'near_field',
      },
      turn_detection: {
        type: 'semantic_vad',
      },
    },
    output: {
      format: {
        type: 'audio/pcm',
      },
      voice: 'marin',
    },
  },
  tools: [
    {
      type: 'function',
      name: 'submit_absence',
      description:
        'Submit absences once all details are confirmed. Include nurse_notes for any illness-related absences.',
      parameters: {
        type: 'object',
        properties: {
          absences: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                student_name: { type: 'string' },
                date: { type: 'string' },
                reason: { type: 'string' },
                nurse_notes: {
                  type: 'object',
                  description: 'Only include for illness-related absences.',
                  properties: {
                    has_fever: { type: 'boolean' },
                    has_vomiting: { type: 'boolean' },
                    tested_positive_for: {
                      type: 'string',
                      description: 'e.g. "COVID", "flu", or null if neither',
                    },
                    other_symptoms: {
                      type: 'string',
                      description:
                        'Any other symptoms or diagnoses to report to the nurse, e.g. "strep throat"',
                    },
                  },
                },
              },
              required: ['student_name', 'date', 'reason'],
            },
          },
        },
        required: ['absences'],
      },
    },
  ],
  tool_choice: 'auto',
  instructions: `
# Role & Objective
You are a warm, efficient absence reporting assistant for a school.
Your goal is to collect all required information to report student absences and pass it to the system.

# Personality & Tone
- Warm, brief, and conversational.
- 1–2 sentences per turn. Do not over-explain.
- Vary your phrasing — do not repeat the same sentence twice.

# Context
The parent calling is Maria. She has the following students enrolled:
${JSON.stringify(CHILDREN, null, 2)}

# Conversation Flow
Follow these steps in order. Do not skip ahead.

1. GREET: Greet Maria by name. Ask which student(s) will be absent and the date.
2. REASON: Ask for the reason for each absence.
3. ILLNESS CHECK: IF the reason is illness/sickness/not feeling well (any health-related reason), ask the following — one at a time, not all at once:
   - Do they have a fever or have they been vomiting?
   - Have they tested positive for COVID or the flu?
   - Are there any other symptoms the nurse should know about (e.g. strep, rash, stomach bug)?
   Only ask these if the absence is health-related. Skip entirely for non-medical reasons like appointments or family matters.
4. CONFIRM: Briefly summarize what you've collected and confirm it's correct.
5. SUBMIT: Once confirmed, call the submit_absence function.

# Tools
- Before calling submit_absence, say something like "Got it, let me get that submitted for you." Then call the tool immediately.

# Rules
- DO NOT ask all illness questions at once — ask them one at a time conversationally.
- DO NOT assume language. Start in English unless the parent uses another language.
- IF a parent mentions a class or period, reference the student's schedule for teacher name and time.
- ALWAYS confirm details before submitting.
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

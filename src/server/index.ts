import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

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
  instructions:
    'You are a helpful assistant for a school absence reporting system. Help parents report student absences. Be brief and conversational.',
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

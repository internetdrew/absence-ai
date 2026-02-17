# Agent Guide

## Purpose

This repo is a small demo UI for a school absence reporting flow. It is a Vite + React + TypeScript app with a simple UI and planned voice/chat features.

## Key paths

- src/App.tsx: main page layout
- src/components/Navbar.tsx: demo drawer and student schedules
- src/components/ui/: shared UI primitives
- src/server/: place server helpers if/when added

## Realtime and WebRTC guidance

Preferred path: WebRTC via the unified interface.

- Browser creates SDP offer and POSTs to our server endpoint (/session).
- Server combines SDP with session config and calls https://api.openai.com/v1/realtime/calls using OPENAI_API_KEY.
- Server returns the SDP answer to the browser.
- Use WebRTC data channel for events.

If using ephemeral keys:

- Server creates a client secret via https://api.openai.com/v1/realtime/client_secrets.
- Browser uses the ephemeral key to POST SDP to https://api.openai.com/v1/realtime/calls.

## Security rules

- Never expose standard OpenAI API keys in the browser.
- Only use OPENAI_API_KEY on the server.
- If you need client config, use VITE\_ prefixed env vars, but keep secrets server-only.

## Local dev

- npm install
- npm run dev
- If adding a server, document how to run it alongside the Vite dev server.

## Testing and verification

- Run npm run build if you changed UI composition significantly.
- Manually verify WebRTC flow in the browser when touching voice or realtime code.

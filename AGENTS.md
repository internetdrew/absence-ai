# Agent Guide

## Purpose

This repo is a small demo UI for a school absence reporting flow. It is a Vite + React + TypeScript app with a simple UI and planned voice/chat features.

## Key paths

- src/App.tsx: main page layout
- src/components/Navbar.tsx: demo drawer and student schedules
- src/components/ui/: shared UI primitives
- src/server/: place server helpers if/when added

## Realtime and WebRTC guidance

Always use the OpenAI developer documentation MCP server if you need to work with the OpenAI API, ChatGPT Apps SDK, Codex,… without me having to explicitly ask.

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

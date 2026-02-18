# Absence AI

## The Problem

Reporting a single student absence often triggers a chain of manual processes — notifying teachers, updating attendance systems, logging details — which can take up to 15 minutes of staff time per student. For schools managing hundreds of students, this adds up quickly and pulls staff away from more pressing tasks.

## Solution

Absence AI demonstrates how a Realtime LLM agent can handle the entire absence workflow automatically. Staff can receive absence information via voice or a quick interface, and the system processes, confirms, and logs the absence across relevant systems — reducing human interaction time to virtually zero.

## Features

- Realtime voice intake: Parents/guardians can report absences verbally.

- Automated confirmation: LLM agent verifies student details, absence reason, and date(s).

- System integration simulation: Demonstrates automated updates to attendance records, notifications, and logs.

- Instant record generation: Produces structured absence records without manual data entry.

- Minimal staff intervention: Designed to test workflows that reduce staff time dramatically.

## Screenshots

## Quick Start

1. Clone the repo:

   ```bash
   git clone https://github.com/internetdrew/absence-ai.git
   cd absence-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

## Tech Stack

- Frontend: React + Tailwind CSS + shadcn/ui

- Realtime API: OpenAI Realtime (WebRTC)

- Voice handling: Browser microphone + WebRTC streaming

- Backend: Node.js (optional for session handling)

## Project Structure

## License

MIT License

## Agent notes

See AGENTS.md for repo-specific guidance and Realtime/WebRTC conventions.

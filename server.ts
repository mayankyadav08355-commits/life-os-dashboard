/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// 1. Short advice diagnostic coach
app.post('/api/analyze', async (req, res) => {
  const { appState } = req.body;
  if (!appState) {
    return res.status(400).json({ error: 'Missing app state payload' });
  }

  try {
    const routineDetails = appState.routine.map((r: any) => 
      `- [${r.status.toUpperCase()}] ${r.timeSlot}: ${r.title} ${r.timestamp ? `(Done at ${r.timestamp})` : ''}`
    ).join('\n');

    const skillDetails = appState.skills.map((s: any) => 
      `- ${s.name}: Logged ${s.dailyLoggedMinutes} mins out of target ${s.dailyTargetMinutes} mins today (Streak: ${s.streak}d)`
    ).join('\n');

    const goalDetails = appState.goals.map((g: any) => 
      `- [${g.completed ? 'COMPLETED' : 'IN PROGRESS'}] ${g.title} (${g.progress}% progress)`
    ).join('\n');

    const prompt = `
You are a highly discipline-minded and spiritual Personal Growth Coach for an ambitious individual in life.
Analyze their performance metrics today:

STUDY/CODING SCHEDULE MODE: ${appState.jobMode ? 'Job Aligned (Evening focus coding)' : 'Standard Full Practice'}

DAILY ROUTINE STATUS LOG:
${routineDetails}

ACTIVE SKILL WORK COMPLETED:
${skillDetails}

WEEKLY HIGHER GOALS STATE:
${goalDetails}

Evaluate their productivity, focus and alignment. Give a highly motivating, crisp diagnostic advice paragraph.
State 1 actionable highlight (something they tracked well) and 1 constructive warning (which block they are slipping on, e.g. Spiritual pooja, morning gym, coding practice or sleep, etc.).
Keep the language professional, encouraging, crisp and under 150 words. Do NOT speak of code files, keys, or technical lingo. Give human advice.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    res.json({ text: response.text || 'Keep pushing boundaries!' });
  } catch (error: any) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Communication error with Gemini backend: ' + error.message });
  }
});

// 2. Comprehensive deep report compiles
app.post('/api/deep-report', async (req, res) => {
  const { state } = req.body;
  if (!state) {
    return res.status(400).json({ error: 'Missing full evaluation state' });
  }

  try {
    const routineDetails = state.routine.map((r: any) => 
      `- [${r.status.toUpperCase()}] ${r.timeSlot}: ${r.title}`
    ).join('\n');

    const skillDetails = state.skills.map((s: any) => 
      `- ${s.name}: Logged ${s.dailyLoggedMinutes}m today against target ${s.dailyTargetMinutes}m`
    ).join('\n');

    const goalDetails = state.goals.map((g: any) => 
      `- [${g.completed ? 'FINISHED' : 'PENDING'}] ${g.title} (Progress: ${g.progress}%)`
    ).join('\n');

    const prompt = `
Generate a highly polished, professional formatted "WEEKLY RE-ALIGNMENT INTELLIGENCE AUDIT" for this user.
Use clear markdown headings. Frame it like an elite productivity report.

CURRENT DISCIPLINE INDEX SCORE: ${state.disciplineScore}%
JOB ALIGNED MODE: ${state.jobMode ? 'ENABLED' : 'DISABLED'}

ROUTINE CODES:
${routineDetails}

SKILLS LOG:
${skillDetails}

GOALS TRACKS:
${goalDetails}

Include the following sections clearly:
1. ### Performance Executive Summary
Provide a supportive but strictly objective assessment of their active grit.

2. ### Active Strengths
Name their highest commitment area based on logged states (e.g. Early waking, fitness or project blocks).

3. ### Primary Vulnerabilities (Habit Leaks)
Identify precisely which habits or time blocks are being missed or squeezed out (e.g., if spiritual routines are skipped or if deep study is neglected due to office hours).

4. ### Realignment Blueprint Suggestions
Give 3 concrete, non-cliché suggestions to realign focus next week. (e.g. preparing workout packs overnight, strict visual cues for naam jap, or setting offline intervals).

Speak in an objective, refined, encouraging tone. Keep the review tight, extremely scannable, and actionable. Do not output code segments.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Gemini report error:', error);
    res.status(500).json({ error: 'Analytical services currently loaded or key unavailable.' });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC HOOKUPS
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeOS server compiled successfully on port ${PORT}`);
  });
}

startServer();

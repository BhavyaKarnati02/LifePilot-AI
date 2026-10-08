# LifePilot AI — Amazon Developer Challenge 2026

Agentic personal goal-management web app: any user goal becomes a personalized plan with outcomes, milestones and actionable tasks; progress is persisted, memory informs the agent, and changed circumstances trigger replanning.

## Included
- Universal AI planning for arbitrary goals
- Outcomes, milestones and structured task details
- Task completion + progress/activity tracking
- AI replanning
- Agent chat using goals + memory + conversation
- Persistent memory
- Supabase auth: signup, login, logout, forgot password, reset password
- Supabase RLS database
- AWS Bedrock Converse API integration

## Run
1. Copy `.env.example` to `.env.local` and fill in Supabase + AWS values.
2. Run `supabase.sql` in Supabase SQL Editor.
3. Add `http://localhost:3000/auth/callback` to Supabase Auth redirect URLs.
4. Run `npm install` then `npm run dev`.
5. Open `http://localhost:3000`.

Never commit `.env.local` or credentials.

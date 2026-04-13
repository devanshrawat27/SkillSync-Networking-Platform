# SkillSync - Networking Platform

SkillSync is a full-stack student networking platform focused on helping students and developers connect, collaborate, and build projects together.

## Features

### Student Profiles
- Create a professional profile with education, skills, interests, and portfolio links
- Add coding profile links such as GitHub, LeetCode, and Codeforces
- Upload a profile photo and control its visibility

### Team Formation
- Discover teammates by skill, academic year, department, and domain
- Send connection requests and build project teams
- Browse public projects and request to join them

### Mentor Connect
- Enable mentor mode on your profile
- Add expertise, mentor bio, and years of experience
- Browse mentor profiles from the discovery flow

### Collaboration
- Share posts and project updates
- Use in-app messaging and notifications
- Create projects and manage team requests

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion

### Backend
- Supabase Auth
- Supabase Database
- Supabase Realtime
- Supabase Storage

## Project Structure

```text
src/
  components/
  hooks/
  integrations/
  lib/
  pages/
public/
supabase/
  migrations/
```

## Run Locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:8080`.

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Team

- Mentor: Ms. Stuti Bhatt
- Contributors: Devansh Rawat, Anuj Kumar, Anuj Dobhal, Shalini Uniyal

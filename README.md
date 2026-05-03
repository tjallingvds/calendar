# Writing Suite

A minimal personal writing site: a public list of essays, individual essay pages with voting and email signup, and an authenticated dashboard with a Notion-style editor for writing posts and a list of email subscribers.

## Features

- **Public essays** at `/` and `/blog/:id`, with topic filtering, upvotes, and an email signup form
- **Notion-style editor** for writing — rich text blocks, headings, lists, quotes, links, drag-and-drop image uploads, and inline citations rendered as numbered footnotes
- **Subscribers list** showing everyone who signed up
- **Theme support** to group essays by topic
- **Image uploads** stored in the database, served from `/api/images/:id`
- **Citations** that render as superscript numbers in the post body and as a "Notes" section at the bottom of the essay

## Stack

- **Frontend**: React + TypeScript + Vite, Tailwind, shadcn/ui
- **Editor**: Tiptap (ProseMirror)
- **Backend**: Express + TypeScript
- **Database**: SQLite locally (`calendar.db`), PostgreSQL in production via `DATABASE_URL`
- **Deploy**: Railway

## Getting Started

```bash
npm install
npm run dev:all   # backend on :3001, frontend on :5173
```

Open http://localhost:5173. To access the writing dashboard, click `[login]` in the top-right and use the password from your `.env` (see `env.example`).

## Building

```bash
npm run build
```

Frontend output goes to `dist/`. The Express server in production serves the built frontend and the API from one process (`npm start`).

## Writing posts

In the dashboard:

1. Open the **Writing** tab
2. Click **New Post** and give it a URL slug (e.g. `building-in-public`)
3. Write the excerpt — this is what shows on the homepage
4. Use the rich editor for the full content. Toolbar buttons cover headings, lists, quotes, links, images, and citations
5. Drop or paste images directly into the editor — they upload automatically
6. To add a citation, select text and click the citation button, then enter the source. On the public page it renders as a superscript number with a footnotes list at the bottom

Old posts written in the previous markdown format keep rendering correctly — the public renderer detects format automatically.

## Database safety

The init code uses `CREATE TABLE IF NOT EXISTS` only — existing posts and subscribers on Railway are never modified by deploys.

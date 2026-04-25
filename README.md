# ELimuCore

A Vercel-ready Next.js starter for rebuilding the ELimuCore education portal with Supabase as the backend.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase for database, auth, and storage
- Vercel for hosting

## What is included

- A polished homepage based on your posted UI direction
- A searchable `/resources` library page
- Dynamic resource detail pages
- Supabase server and browser clients
- A starter SQL schema in [supabase/migrations/202604220001_initial_content_schema.sql](/C:/Users/Eric/Documents/CBE%20platform/supabase/migrations/202604220001_initial_content_schema.sql)
- A safe import script for content you own or are licensed to use

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env.local
```

3. Fill in:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Run the SQL in Supabase:

- Open the Supabase SQL editor
- Paste [supabase/migrations/202604220001_initial_content_schema.sql](/C:/Users/Eric/Documents/CBE%20platform/supabase/migrations/202604220001_initial_content_schema.sql)
- Execute it

5. Start the app:

```bash
npm run dev
```

## Importing content you own

Edit [data/authorized-materials.sample.json](/C:/Users/Eric/Documents/CBE%20platform/data/authorized-materials.sample.json) or point the script to your own manifest:

```bash
npm run import:materials
```

The script upserts records into the `resources` table. Upload the actual files separately into the `resource-files` bucket in Supabase Storage, then attach those paths in `resource_files`.

## Deploying to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add these environment variables in the Vercel project settings:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

4. Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel for the public site right now. Keep that key only for local/admin import scripts until we add protected server-side admin flows.
5. Deploy. Next.js is zero-config on Vercel.

## About scraping kcseonline.co.ke

Technically, you can crawl publicly accessible HTML pages for research or migration planning, but republishing their actual materials is a rights question, not just a technical one.

- Safe: auditing public categories, titles, and URL structure
- Needs permission: downloading and rehosting their PDFs, lesson plans, notes, or premium materials

See [docs/content-import-policy.md](/C:/Users/Eric/Documents/CBE%20platform/docs/content-import-policy.md) before attempting any bulk migration.

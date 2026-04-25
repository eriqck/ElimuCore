# Content import guidance

This project is ready for bulk imports, but only for materials you own, have licensed, or have written permission to republish.

## Safe migration paths

- Import your own PDFs, notes, and exam packs from local storage into Supabase Storage.
- Import metadata from spreadsheets, CSV files, or JSON manifests into the `resources` table.
- Audit public page titles and category structures from another site to inform your taxonomy and IA.

## Red lines

- Do not copy premium, member-only, or copyrighted downloads from another site without permission.
- Do not hotlink third-party files into your new platform as if they are your own hosted assets.
- Do not assume that because a page is public, the files on that page are licensed for republication.

## Best approach for this project

1. Launch the new frontend and backend structure first.
2. Import only content you control or are licensed to use.
3. If you want legacy material from another publisher, get written permission and then migrate it with the included import script.

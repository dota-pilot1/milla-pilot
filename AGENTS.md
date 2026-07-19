# Project Instructions (GPT / Codex / Agents)

Read `/docs/design-system.md` (visual language — color, spacing, typography, status colors) and `/docs/frontend-conventions.md` (build rules — core principle, FSD placement, primitive contracts, interaction, screen templates, AI work checks) first, and follow them.

This project adopts only the **AI-readable design-system operating model** inspired by Astryx. Do not install or migrate to Astryx/StyleX unless the user explicitly asks for a separate experiment.

- Use shadcn/ui **new-york** style, Tailwind **semantic tokens only** (no raw palette like `bg-emerald-500`), CVA variants, and lucide-react icons.
- Put pure UI primitives in `src/shared/ui`.
- Put domain display components in `src/entities/{domain}/ui`.
- Put user action flows in `src/features/{feature}/ui`.
- Pages (`app/**/page.tsx`) compose existing components; avoid long inline UI logic.
- **Do not** create page-specific button/input/select/table styles when a shared primitive exists — build or reuse the primitive.
- Keep spacing comfortable, not cramped: page `py-8`, cards `p-5 rounded-xl`, sections `space-y-6`, grids `gap-5`, form fields `space-y-4`.
- Merge classes with `cn()` (`@/shared/lib/utils`).
- After UI work, search for leftover repeated primitive styling such as raw `<select>`, `<textarea>`, `<table>`, `const field`, or `const label` in feature/page files.

## Agent operations

- **Restarting and testing the backend server is the user's job.** By default, do NOT start the server. After code changes, hand off with "please restart and verify".
- **Exception — only when you (the agent) need to verify something yourself** (e.g. concurrency, live endpoint checks), start it temporarily. As soon as that verification is done, **shut it down again so port 4301 is free** — so the user can restart and test their own way.
- Never leave the server running; never collide with the user's manual `./gradlew bootRun`.

Structure: Spring(DDD) shared backend + `donation-admin-tauri` (admin CRUD) + `donation-platform-front` (web, Next.js). Admin management lives in Tauri; donor-facing output lives in web.

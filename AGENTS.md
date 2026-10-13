<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Internal app pages live under src/routes/_authenticated (client-only gate, redirects to /login); data is read with the browser client + React Query options in src/lib/datos.ts so RLS applies per user.
- User admin (create user, change role) goes through server functions in src/lib/usuarios.functions.ts that verify the supervisor role before using the admin client; roles are never writable from the browser.
- Machine traffic-light status is derived from the worst component state, not stored, so it can never drift.

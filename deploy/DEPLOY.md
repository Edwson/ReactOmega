# Deploy ReactOmega → https://edwson.com/ReactOmega/

`ReactOmega-cpanel.zip` is a **fully static** build of the new ReactOmega playground
(31 live components). No Node server, no database — it's plain HTML/CSS/JS that Apache
serves directly. The Inter font is **self-hosted inside the build**, so the page makes
**zero external requests** at runtime.

The zip already has everything wired for the `/ReactOmega/` sub-path (asset URLs, links,
a tuned `.htaccess`). Just upload and extract.

---

## Upload via cPanel File Manager (5 steps)

1. **cPanel → File Manager →** open `public_html`.
2. **Back up the old version (optional):** rename the existing `ReactOmega` folder to
   `ReactOmega_old` (right-click → Rename). You can delete it once the new one works.
3. **Create a fresh folder** named exactly `ReactOmega` inside `public_html`, and open it.
4. **Upload** `ReactOmega-cpanel.zip` into that folder (Upload button).
5. **Extract** it (right-click the zip → *Extract*, target = the same `ReactOmega` folder),
   then **delete the zip**.

> **Important — the `.htaccess`:** the zip contains a hidden `.htaccess` file. cPanel
> extracts it fine, but to *see* it click **Settings (top-right) → "Show Hidden Files
> (dotfiles)" → Save**. If after extraction there's no `.htaccess` in the folder, your
> host stripped it — just create one and paste the contents from the `.htaccess` already
> in this build (it sets caching + the 404 page; the site still works without it).

After extraction `public_html/ReactOmega/` should contain:

```
index.html        ← the landing page
components/        ← the gallery (components/index.html)
404.html
_next/            ← hashed JS/CSS + self-hosted fonts
.htaccess
```

---

## Verify

- Open **https://edwson.com/ReactOmega/** → the ReactΩ landing page (Inter wordmark,
  "Motion · Interaction · Physics").
- Open **https://edwson.com/ReactOmega/components/** → the live gallery, all 31 demos.
- Hard-refresh once (**Cmd/Ctrl + Shift + R**) so the browser drops any cached old build.

---

## Rebuilding in the future

This zip was built from `ReactOmega_Neo/web`. To regenerate after changing components:

```bash
cd ReactOmega_Neo/web
npm install        # first time only
npm run build      # emits web/out/  (static, basePath /ReactOmega already set)
```

Then zip the **contents** of `web/out/` (not the `out` folder itself) and upload as above.
The `basePath: '/ReactOmega'` only applies to production builds, so `npm run dev` still runs
at `http://localhost:3000` (or `:3001`) unchanged.

> If you ever move it to a different path or to the domain root, change `basePath` in
> `web/next.config.mjs` (set it to `''` for the root) and rebuild.

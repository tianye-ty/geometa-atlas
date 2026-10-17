# GeoMeta Atlas

A browser-local GeoGuessr study map built with React, TypeScript, Vite, MapLibre and OpenStreetMap.

## Publish with GitHub Pages — no terminal required

1. Extract `GeoMeta-Atlas-GitHub.zip` and open the `geometa-atlas` folder.
2. On GitHub, create a **Public** repository named `geometa-atlas`, using the default `main` branch. A README can be initialized if you need the **Add file** menu.
3. Open the repository, choose **Add file → Upload files**.
4. Upload the CONTENTS of the extracted folder, not the ZIP and not the outer folder. `package.json`, `src`, and `public` must be at the repository root.
5. IMPORTANT on macOS: press **Command + Shift + .** in Finder to show hidden files. Include `.github` and `.gitignore`. `.github/workflows/deploy.yml` is the automatic publishing workflow.
6. Click **Commit changes**.
7. Open **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
8. Open **Actions → Deploy GeoMeta Atlas → Run workflow → Run workflow**. If the initial upload run failed before Pages was enabled, this starts a fresh run.
9. Wait for the green check mark. Open **Settings → Pages → Visit site**.

Expected URL: `https://YOUR-USERNAME.github.io/geometa-atlas/`.

If `.github` did not upload: choose **Add file → Create new file**, enter `.github/workflows/deploy.yml` as the filename, paste the contents of the included workflow file, and click **Commit changes**. You can also use the separately provided `GeoMeta-deploy.yml` download as the text to copy.

Future commits to `main` automatically publish changes. Adding personal notes in the website does NOT require a new deployment.

## Move your notes safely

- On the old website: **Settings & backups → Export personal notes**.
- On the new website: **Settings & backups → Import personal notes**.
- Export and import your local Guide library separately through **Guide editor**.
- Do not upload these personal backups into your public repository.
- Notes and local guides live in browser IndexedDB, not GitHub. Changing website origin, browser or device does not transfer them. Back up regularly.

## Included version

Exported from source commit `18499879b583c401c810449aa0be3bf2404f2ebe`, plus independent GitHub deployment configuration.
Includes world wrapping, map scope modes, country hover previews, search, multi-photo notes and France/Spain subdivisions.
Portugal mainland/Madeira/Azores separation and Enter-to-save have NOT been implemented in this version.

## Local development (optional)

Install Node.js 24 and pnpm 11.25.0, then run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Production build: `pnpm build`. The generated website is in `dist/`.
The relative Vite base (`./`) supports a GitHub Pages repository subpath without hard-coding your username.

## Data and licensing

This export contains no personal browser notes, credentials, hosting account configuration or Git history. `public/guides.json` is the empty public custom-guide library.
Retain the France and Spain license files in `public/`, OpenStreetMap attribution, and per-image credits. Built-in external reference samples remain linked to their original sources; this is not a full mirror of Plonk It or GeoTips. Do not redistribute content without appropriate rights.
Map tiles and linked images need internet; external services have their own availability and usage policies.

## Verification limits

The exported project was locally built. The GitHub Actions workflow is supplied but cannot be verified in your GitHub account until you upload it and enable Pages.

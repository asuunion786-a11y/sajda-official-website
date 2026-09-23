# SAJDA Website — with Admin Panel

A public website for SAJDA (Jamia Nooriyya), with a password-protected admin panel at `/admin` that controls all content: About, Activities, Programs, Achievements, Publications, and Contact details. The public site has no login and updates as soon as the admin saves changes.

## What's inside

```
sajda-site/
├── server.js            the backend (Node.js + Express)
├── package.json
├── data/content.json    all site content lives here (auto-updated by admin panel)
├── public/
│   ├── index.html       the public website
│   ├── admin.html       the admin panel (at yourdomain.com/admin)
│   ├── style.css
│   └── assets/logo.png  the Sajda logo
└── README.md            (this file)
```

## 1. Run it locally (to try it out)

You need [Node.js](https://nodejs.org/) installed (version 18 or newer).

```bash
cd sajda-site
npm install
ADMIN_PASSWORD=choose-a-strong-password npm start
```

Then open:
- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin (username `admin`, password whatever you set above)

## 2. Deploying it for real (so the public can visit it)

You need two things: hosting to run the server, and a domain (e.g. `sajda.org`) pointing at it. **Render (render.com)** is the recommended starting point — free tier available, deploys straight from GitHub, and needs no server management. Railway (railway.app) or a VPS (DigitalOcean, Hostinger, etc.) work too if you want more control later.

General steps (Render, as an example):
1. Put this folder in a GitHub repository (Render deploys from GitHub).
2. On Render: New → Web Service → connect your repo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables (Render → Environment tab):
   - `ADMIN_USERNAME` — the admin login name (default `admin`)
   - `ADMIN_PASSWORD` — a strong password you choose
   - `JWT_SECRET` — any long random string (this signs the admin login session)
6. Deploy. Render gives you a URL like `sajda.onrender.com`.
7. Buy a domain (e.g. from Namecheap or GoDaddy) and point it at that URL by following your host's "custom domain" instructions.

**Important:** always set `ADMIN_PASSWORD` and `JWT_SECRET` as environment variables on your host. Never leave the defaults in place on a live site.

## 3. Using the admin panel

Go to `yourdomain.com/admin`, log in, and you'll see tabs for each section:
- **About** — the union's name, institution, current term, and its story
- **Activities / Programs** — add, edit, or remove entries; each has a title and description
- **Achievements** — add entries with a year, title, and description
- **Publications** — add a title, an optional cover image URL, and an optional link
- **Contact** — phone, email, address

Click **Save** on each tab after editing. Changes go live immediately — anyone opening the public site will see the update (they may need to refresh if they already had the page open).

## 4. A note on content

The About section, phone number, and email currently on the site are the real details already provided. The Activities, Programs, Achievements, and Publications lists start empty — add Sajda's actual programs and history through the admin panel so the public site only shows verified, real information.

## 5. Backing up your content

`data/content.json` holds everything the admin panel saves. It's good practice to back this file up periodically (most hosts also keep their own backups, but it's a small file — copying it now and then costs nothing).

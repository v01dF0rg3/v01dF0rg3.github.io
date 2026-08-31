# v01df0rg3.github.io

A privacy-first terminal portfolio for v01df0rg3.

The interface behaves like a small zsh-inspired filesystem. Visitors can use
commands such as ls, cd, cat, help, history, git log, and fastfetch to move
through projects and Markdown posts.

## Local development

Use Node.js 22 (the version used by the deployment workflow).

    npm install
    npm run dev

The development site runs at http://localhost:3000
Visit the live build at https://v01df0rg3.github.io/

## Content

Editable content lives in:

    content/
    ├── about.txt
    ├── now.txt
    ├── contact.txt
    ├── blog/
    │   ├── boot-sequence.md
    │   ├── session-sentinel-build-log.md
    │   └── terminal-interface.md
    └── projects/
        ├── session-sentinel.md
        └── terminal-portfolio.md

The profile README source is available from the virtual filesystem at
`links/profile-readme.url`.

The static RSS feed is available at `https://v01df0rg3.github.io/feed.xml`.

The welcome screen includes a loopable background track at a restrained 12% volume.
Use the `sound` control in the top bar to mute or resume it; the preference stays
local to the current browser. The track is bundled at
`public/audio/terminal-loop.mp3`; browsers that block autoplay start it after the
first interaction.

Register additional files in app/content.ts so they appear in the virtual
filesystem.

## Deployment

Pushes to main are built as a static export and deployed through GitHub Pages.
The workflow publishes dist/client.

No analytics, API keys, contact form, email address, or private user information
is included.

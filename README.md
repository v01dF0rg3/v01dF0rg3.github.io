# v01df0rg3.github.io

A privacy-first terminal portfolio for v01df0rg3.

The interface behaves like a small zsh-inspired filesystem. Visitors can use
commands such as ls, cd, cat, help, history, and fastfetch to move through
projects and Markdown posts.

## Local development

Use Node.js 22 (the version used by the deployment workflow).

    npm install
    npm run dev

The development site runs at http://localhost:3000.

## Content

Editable content lives in:

    content/
    ├── about.txt
    ├── contact.txt
    ├── blog/
    │   └── boot-sequence.md
    └── projects/
        └── terminal-portfolio.md

Register additional files in app/content.ts so they appear in the virtual
filesystem.

## Deployment

Pushes to main are built as a static export and deployed through GitHub Pages.
The workflow publishes dist/client.

No analytics, API keys, contact form, email address, or private user information
is included.

import about from '../content/about.txt?raw';
import contact from '../content/contact.txt?raw';
import now from '../content/now.txt?raw';
import userFlag from '../content/user.txt?raw';
import hiddenHash from '../content/.hash?raw';
import rootFlag from '../content/root.txt?raw';
import bootSequence from '../content/blog/boot-sequence.md?raw';
import sessionSentinelBuildLog from '../content/blog/session-sentinel-build-log.md?raw';
import terminalInterface from '../content/blog/terminal-interface.md?raw';
import sessionSentinel from '../content/projects/session-sentinel.md?raw';
import terminalPortfolio from '../content/projects/terminal-portfolio.md?raw';

export const HOME = '/home/v01df0rg3';
export const ROOT = '/root';

export type FileFormat = 'text' | 'markdown' | 'link';

export type FileEntry = {
  type: 'file';
  format: FileFormat;
  content: string;
  description: string;
};

export type DirectoryEntry = {
  type: 'directory';
  children: string[];
};

export const directories: Record<string, DirectoryEntry> = {
  '/': { type: 'directory', children: ['home/', 'root/'] },
  '/home': { type: 'directory', children: ['v01df0rg3/'] },
  [HOME]: {
    type: 'directory',
    children: [
      'about.txt',
      'now.txt',
      'projects/',
      'blog/',
      'contact.txt',
      'links/',
      'user.txt',
      '.hash',
    ],
  },
  [`${HOME}/projects`]: {
    type: 'directory',
    children: ['README.md', 'session-sentinel.md', 'terminal-portfolio.md'],
  },
  [`${HOME}/blog`]: {
    type: 'directory',
    children: [
      'README.md',
      'boot-sequence.md',
      'session-sentinel-build-log.md',
      'terminal-interface.md',
    ],
  },
  [`${HOME}/links`]: {
    type: 'directory',
    children: ['feed.url', 'github.url', 'profile-readme.url'],
  },
  [ROOT]: {
    type: 'directory',
    children: ['root.txt'],
  },
};

export const files: Record<string, FileEntry> = {
  [`${HOME}/about.txt`]: {
    type: 'file',
    format: 'text',
    content: about,
    description: 'about this space',
  },
  [`${HOME}/contact.txt`]: {
    type: 'file',
    format: 'text',
    content: contact,
    description: 'public contact route',
  },
  [`${HOME}/now.txt`]: {
    type: 'file',
    format: 'text',
    content: now,
    description: 'current focus and next steps',
  },
  [`${HOME}/user.txt`]: {
    type: 'file',
    format: 'text',
    content: userFlag,
    description: 'user flag and a hidden-machine clue',
  },
  [`${HOME}/.hash`]: {
    type: 'file',
    format: 'text',
    content: hiddenHash,
    description: 'hidden MD5 challenge hash',
  },
  [`${HOME}/projects/README.md`]: {
    type: 'file',
    format: 'markdown',
    content:
      '# projects\n\nPublic builds and experiments from the `v01df0rg3` lab.\n\n- `session-sentinel.md` — a privacy-first browser session cleanup extension\n- `terminal-portfolio.md` — this terminal interface\n\nUse `cat <file>` to inspect a project.',
    description: 'project directory guide',
  },
  [`${HOME}/projects/session-sentinel.md`]: {
    type: 'file',
    format: 'markdown',
    content: sessionSentinel,
    description: 'privacy-first Chrome session cleanup extension',
  },
  [`${HOME}/projects/terminal-portfolio.md`]: {
    type: 'file',
    format: 'markdown',
    content: terminalPortfolio,
    description: 'this terminal portfolio',
  },
  [`${HOME}/blog/README.md`]: {
    type: 'file',
    format: 'markdown',
    content:
      '# blog\n\nNotes are stored as Markdown files.\n\n- `session-sentinel-build-log.md` — building an honest logout tool\n- `terminal-interface.md` — why this portfolio behaves like a shell\n- `boot-sequence.md` — the first entry\n\nUse `cat <post>.md` to read one.\n\nThe feed is linked at `links/feed.url`.',
    description: 'blog directory guide',
  },
  [`${HOME}/blog/boot-sequence.md`]: {
    type: 'file',
    format: 'markdown',
    content: bootSequence,
    description: 'the first entry',
  },
  [`${HOME}/blog/session-sentinel-build-log.md`]: {
    type: 'file',
    format: 'markdown',
    content: sessionSentinelBuildLog,
    description: 'building an honest logout tool',
  },
  [`${HOME}/blog/terminal-interface.md`]: {
    type: 'file',
    format: 'markdown',
    content: terminalInterface,
    description: 'why this portfolio behaves like a shell',
  },
  [`${HOME}/links/github.url`]: {
    type: 'file',
    format: 'link',
    content: 'https://github.com/v01dF0rg3',
    description: 'GitHub profile',
  },
  [`${HOME}/links/profile-readme.url`]: {
    type: 'file',
    format: 'link',
    content: 'https://github.com/v01dF0rg3/v01dF0rg3',
    description: 'profile README source',
  },
  [`${HOME}/links/feed.url`]: {
    type: 'file',
    format: 'link',
    content: 'https://v01df0rg3.github.io/feed.xml',
    description: 'RSS feed for blog notes',
  },
  [`${ROOT}/root.txt`]: {
    type: 'file',
    format: 'text',
    content: rootFlag,
    description: 'root flag and congratulations',
  },
};

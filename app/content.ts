import about from '../content/about.txt?raw';
import contact from '../content/contact.txt?raw';
import bootSequence from '../content/blog/boot-sequence.md?raw';
import terminalPortfolio from '../content/projects/terminal-portfolio.md?raw';

export const HOME = '/home/v01df0rg3';

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
  '/': { type: 'directory', children: ['home/'] },
  '/home': { type: 'directory', children: ['v01df0rg3/'] },
  [HOME]: {
    type: 'directory',
    children: ['about.txt', 'projects/', 'blog/', 'contact.txt', 'links/'],
  },
  [`${HOME}/projects`]: {
    type: 'directory',
    children: ['README.md', 'terminal-portfolio.md'],
  },
  [`${HOME}/blog`]: {
    type: 'directory',
    children: ['README.md', 'boot-sequence.md'],
  },
  [`${HOME}/links`]: {
    type: 'directory',
    children: ['github.url'],
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
  [`${HOME}/projects/README.md`]: {
    type: 'file',
    format: 'markdown',
    content:
      '# projects\n\nExperiments and things built by `v01df0rg3`.\n\nUse `cat <file>` to inspect a project.',
    description: 'project directory guide',
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
      '# blog\n\nNotes are stored as Markdown files.\n\nUse `cat <post>.md` to read one.',
    description: 'blog directory guide',
  },
  [`${HOME}/blog/boot-sequence.md`]: {
    type: 'file',
    format: 'markdown',
    content: bootSequence,
    description: 'the first entry',
  },
  [`${HOME}/links/github.url`]: {
    type: 'file',
    format: 'link',
    content: 'https://github.com/v01dF0rg3',
    description: 'GitHub profile',
  },
};

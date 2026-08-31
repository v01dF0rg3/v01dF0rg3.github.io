'use client';

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { HOME, directories, files, type FileEntry } from './content';

type HelpEntry = {
  command: string;
  description: string;
};

type ListingItem = {
  name: string;
  path: string;
  directory: boolean;
  size: number;
};

type OutputBlock =
  | { kind: 'fastfetch' }
  | { kind: 'welcome' }
  | { kind: 'text'; text: string; tone?: 'normal' | 'muted' | 'error' | 'success' }
  | { kind: 'markdown'; source: string }
  | { kind: 'listing'; items: ListingItem[]; long: boolean }
  | { kind: 'help'; entries: HelpEntry[] }
  | { kind: 'link'; href: string; label: string };

type TranscriptEntry = {
  id: number;
  cwd: string;
  input?: string;
  blocks: OutputBlock[];
};

const COMMAND_HELP: HelpEntry[] = [
  { command: 'help [command]', description: 'show the command index' },
  { command: 'ls [-la] [path]', description: 'list directory contents' },
  { command: 'cd [path]', description: 'change directory' },
  { command: 'cat <file>', description: 'read a text or Markdown file' },
  { command: 'pwd', description: 'print the current directory' },
  { command: 'tree [path]', description: 'draw the virtual filesystem' },
  { command: 'whoami', description: 'print the active user' },
  { command: 'fastfetch', description: 'show the system card' },
  { command: 'history', description: 'show commands from this session' },
  { command: 'open github', description: 'open the GitHub profile' },
  { command: 'date', description: 'print the current UTC time' },
  { command: 'clear', description: 'clear the terminal output' },
];

const COMMANDS = [
  'cat',
  'cd',
  'clear',
  'coffee',
  'date',
  'echo',
  'exit',
  'fastfetch',
  'github',
  'help',
  'history',
  'id',
  'ls',
  'man',
  'neofetch',
  'open',
  'pwd',
  'theme',
  'tree',
  'uname',
  'whoami',
];

const INITIAL_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: 0,
    cwd: HOME,
    input: 'fastfetch',
    blocks: [{ kind: 'fastfetch' }],
  },
  {
    id: 1,
    cwd: HOME,
    blocks: [{ kind: 'welcome' }],
  },
];

const STATIC_BLACK_HOLE = [
  '        .                                  .        ',
  '                         .                          ',
  '              .      .,:;+xXx+;:,.                 ',
  '                  .;+X#x+=;;;=x#X+;.                ',
  '               .:+##x;.       .;x##+:.              ',
  '            .,:x#X=.             .=X#x:,.           ',
  '       ..,:;+X##+                   +##X+;:,..       ',
  '  .,:;=+xX##Xx;.                     .;xX##Xx+=;:,. ',
  ';=xX####Xx+=:.          .   .          .:=+xX####Xx=',
  '###Xx+=;:..          .         .          ..:;=+xX##',
  '                     .         .                     ',
  '###Xx+=;:..          .         .          ..:;=+xX##',
  ';=xX####Xx+=:.          .   .          .:=+xX####Xx=',
  '  .,:;=+xX##Xx;.                     .;xX##Xx+=;:,. ',
  '       ..,:;+X##+                   +##X+;:,..       ',
  '            .,:x#X=.             .=X#x:,.           ',
  '               .:+##x;.       .;x##+:.              ',
  '                  .;+X#x+=;;;=x#X+;.                ',
  '              .      .,:;+xXx+;:,.                 ',
  '                         .                          ',
  '        .                                  .        ',
  '                                                    ',
].join('\n');

function tokenize(value: string) {
  const matches = value.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? [];
  return matches.map((token) => {
    const quoted =
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"));
    return quoted ? token.slice(1, -1) : token;
  });
}

function normalizePath(rawPath: string, cwd: string) {
  const requested = rawPath.trim() || HOME;
  let expanded = requested;

  if (requested === '~') {
    expanded = HOME;
  } else if (requested.startsWith('~/')) {
    expanded = HOME + requested.slice(1);
  } else if (!requested.startsWith('/')) {
    expanded = cwd + '/' + requested;
  }

  const segments: string[] = [];
  for (const segment of expanded.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..') {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }

  return '/' + segments.join('/');
}

function parentPath(path: string) {
  if (path === '/') {
    return '/';
  }
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

function displayPath(path: string) {
  if (path === HOME) {
    return '~';
  }
  if (path.startsWith(HOME + '/')) {
    return '~' + path.slice(HOME.length);
  }
  return path;
}

function basename(path: string) {
  return path.split('/').filter(Boolean).at(-1) ?? '/';
}

function listingFor(path: string, long = false, showAll = false): OutputBlock {
  const directory = directories[path];
  const names = showAll ? ['.', '..', ...directory.children] : directory.children;
  const items = names.map((name) => {
    const isSpecial = name === '.' || name === '..';
    const isDirectory = isSpecial || name.endsWith('/');
    const childPath =
      name === '.'
        ? path
        : name === '..'
          ? parentPath(path)
          : normalizePath(name.replace(/\/$/, ''), path);
    const file = files[childPath];

    return {
      name,
      path: childPath,
      directory: isDirectory,
      size: file?.content.length ?? 0,
    };
  });

  return { kind: 'listing', items, long };
}

function landingFor(path: string): OutputBlock[] {
  if (path === HOME) {
    return [
      { kind: 'text', text: files[HOME + '/about.txt'].content },
      { kind: 'text', text: 'Try: ls   or   cd projects', tone: 'muted' },
    ];
  }

  if (path === HOME + '/projects') {
    return [
      { kind: 'markdown', source: files[path + '/README.md'].content },
      listingFor(path),
    ];
  }

  if (path === HOME + '/blog') {
    return [
      { kind: 'markdown', source: files[path + '/README.md'].content },
      listingFor(path),
    ];
  }

  return [listingFor(path)];
}

function treeFor(path: string) {
  const lines = [basename(path)];

  function visit(directoryPath: string, prefix: string) {
    const children = directories[directoryPath]?.children ?? [];
    children.forEach((name, index) => {
      const last = index === children.length - 1;
      const cleanName = name.replace(/\/$/, '');
      const childPath = normalizePath(cleanName, directoryPath);
      lines.push(prefix + (last ? '└── ' : '├── ') + name);
      if (directories[childPath]) {
        visit(childPath, prefix + (last ? '    ' : '│   '));
      }
    });
  }

  visit(path, '');
  return lines.join('\n');
}

function formatUptime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return hours + ':' + minutes + ':' + seconds;
}

function InlineMarkdown({ text }: { text: string }) {
  const codeMarker = String.fromCharCode(96);
  const codeParts = text.split(codeMarker);

  return (
    <>
      {codeParts.map((part, codeIndex) => {
        if (codeIndex % 2 === 1) {
          return <code key={codeIndex}>{part}</code>;
        }

        const linkParts = part.split(/(\[[^\]]+\]\(https:\/\/[^)]+\))/g);
        return linkParts.map((linkPart, linkIndex) => {
          const link = linkPart.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
          if (link) {
            return (
              <a
                key={codeIndex + '-' + linkIndex}
                href={link[2]}
                target="_blank"
                rel="noreferrer"
              >
                {link[1]}
              </a>
            );
          }

          const boldParts = linkPart.split(/(\*\*[^*]+\*\*)/g);
          return (
            <Fragment key={codeIndex + '-' + linkIndex}>
              {boldParts.map((boldPart, boldIndex) =>
                boldPart.startsWith('**') && boldPart.endsWith('**') ? (
                  <strong key={boldIndex}>{boldPart.slice(2, -2)}</strong>
                ) : (
                  <Fragment key={boldIndex}>{boldPart}</Fragment>
                ),
              )}
            </Fragment>
          );
        });
      })}
    </>
  );
}

function MarkdownOutput({ source }: { source: string }) {
  const lines = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/\r/g, '')
    .split('\n');
  const blocks: React.ReactNode[] = [];
  const codeMarker = String.fromCharCode(96).repeat(3);
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith(codeMarker)) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith(codeMarker)) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre className="md-codeblock" key={'code-' + index}>
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Level = ('h' + heading[1].length) as 'h1' | 'h2' | 'h3';
      blocks.push(
        <Level key={'heading-' + index}>
          <InlineMarkdown text={heading[2]} />
        </Level>,
      );
      index += 1;
      continue;
    }

    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith('- ')) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push(
        <ul key={'list-' + index}>
          {items.map((item) => (
            <li key={item}>
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote key={'quote-' + index}>
          <InlineMarkdown text={line.slice(2)} />
        </blockquote>,
      );
      index += 1;
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,3})\s/.test(lines[index]) &&
      !lines[index].startsWith('- ') &&
      !lines[index].startsWith('> ') &&
      !lines[index].trim().startsWith(codeMarker)
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p key={'paragraph-' + index}>
        <InlineMarkdown text={paragraph.join(' ')} />
      </p>,
    );
  }

  return <div className="markdown-output">{blocks}</div>;
}

function Prompt({ cwd }: { cwd: string }) {
  return (
    <>
      <span className="prompt-user">v01df0rg3@void</span>
      <span className="prompt-path">{displayPath(cwd)}</span>
      <span className="prompt-symbol">%</span>
    </>
  );
}

function AsciiBlackHole() {
  const frameRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const columns = 54;
    const rows = 22;
    const centerX = (columns - 1) / 2;
    const centerY = (rows - 1) / 2;
    const glyphs = ' .,:;+=xX#@';

    function seeded(index: number) {
      const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
      return value - Math.floor(value);
    }

    const particles = Array.from({ length: 260 }, (_, index) => ({
      radius: 7 + seeded(index) * 18,
      angle: seeded(index + 410) * Math.PI * 2,
      speed: 0.2 + seeded(index + 820) * 0.46,
      drift: (seeded(index + 1230) - 0.5) * 1.7,
      light: 0.36 + seeded(index + 1640) * 0.64,
    }));

    const stars = Array.from({ length: 32 }, (_, index) => ({
      x: Math.floor(seeded(index + 2200) * columns),
      y: Math.floor(seeded(index + 2500) * rows),
      phase: seeded(index + 2800) * Math.PI * 2,
    }));

    let animationTimer = 0;
    const startedAt = performance.now();

    function draw(now: number) {
      const elapsed = (now - startedAt) / 1000;
      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => 0),
      );

      function put(x: number, y: number, light: number) {
        const px = Math.round(x);
        const py = Math.round(y);
        if (px < 0 || px >= columns || py < 0 || py >= rows) {
          return;
        }
        grid[py][px] = Math.max(grid[py][px], Math.min(1, light));
      }

      stars.forEach((star) => {
        const pulse = 0.12 + Math.max(0, Math.sin(elapsed * 1.4 + star.phase)) * 0.2;
        put(star.x, star.y, pulse);
      });

      const foreground: Array<{ x: number; y: number; light: number }> = [];

      particles.forEach((particle, index) => {
        const orbit =
          particle.angle +
          elapsed * particle.speed * (12 / Math.sqrt(particle.radius));
        const depth = Math.sin(orbit);
        const x = centerX + Math.cos(orbit) * particle.radius;
        const y =
          centerY +
          depth * particle.radius * 0.2 +
          particle.drift * (0.35 + particle.radius / 27);
        const innerGlow = 1 - Math.min(1, (particle.radius - 7) / 18);
        const shimmer = 0.78 + Math.sin(elapsed * 2 + index) * 0.12;
        const light = particle.light * (0.52 + innerGlow * 0.48) * shimmer;

        if (depth > 0.08) {
          foreground.push({ x, y, light: light * 1.12 });
        } else {
          put(x, y, light * 0.7);
        }
      });

      for (let index = 0; index < 150; index += 1) {
        const angle = (index / 150) * Math.PI * 2 + elapsed * 0.12;
        const wobble = Math.sin(angle * 3 + elapsed) * 0.22;
        put(
          centerX + Math.cos(angle) * (7.4 + wobble),
          centerY + Math.sin(angle) * (4.15 + wobble * 0.5),
          0.6 + Math.sin(angle + elapsed) * 0.22,
        );
      }

      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const core =
            Math.pow((x - centerX) / 6.1, 2) +
            Math.pow((y - centerY) / 2.85, 2);
          if (core < 1) {
            grid[y][x] = 0;
          }
        }
      }

      foreground.forEach((particle) => {
        put(particle.x, particle.y, particle.light);
      });

      const frame = grid
        .map((row) =>
          row
            .map((light) => {
              const glyphIndex = Math.min(
                glyphs.length - 1,
                Math.floor(light * glyphs.length),
              );
              return glyphs[glyphIndex];
            })
            .join(''),
        )
        .join('\n');

      if (frameRef.current) {
        frameRef.current.textContent = frame;
      }
    }

    draw(startedAt);
    animationTimer = window.setInterval(() => draw(performance.now()), 72);

    return () => window.clearInterval(animationTimer);
  }, []);

  return (
    <figure className="ascii-black-hole">
      <pre
        ref={frameRef}
        aria-label="Animated ASCII black hole with a rotating accretion disk"
      >
        {STATIC_BLACK_HOLE}
      </pre>
    </figure>
  );
}

function Fastfetch({ uptime }: { uptime: string }) {
  return (
    <div className="fastfetch">
      <AsciiBlackHole />
      <div className="fastfetch__details">
        <p className="fastfetch__title">v01df0rg3@void</p>
        <p>
          <b>OS</b>
          <span>Void Web</span>
        </p>
        <p>
          <b>Host</b>
          <span>github-pages</span>
        </p>
        <p>
          <b>Kernel</b>
          <span>static</span>
        </p>
        <p>
          <b>Uptime</b>
          <span>{uptime}</span>
        </p>
        <p>
          <b>Shell</b>
          <span>zsh-web</span>
        </p>
        <p>
          <b>Theme</b>
          <span>void</span>
        </p>
        <p>
          <b>Render</b>
          <span>ASCII / 14 fps</span>
        </p>
        <div className="swatches" aria-label="terminal color palette">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [cwd, setCwd] = useState(HOME);
  const [previousDirectory, setPreviousDirectory] = useState(HOME);
  const [input, setInput] = useState('');
  const [transcript, setTranscript] =
    useState<TranscriptEntry[]>(INITIAL_TRANSCRIPT);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [uptime, setUptime] = useState('00:00:00');
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);
  const sessionStart = useRef(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setUptime(formatUptime(Math.floor((Date.now() - sessionStart.current) / 1000)));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [transcript]);

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }

    const syncRoute = () => {
      const nextPath = decodeURIComponent(window.location.hash.slice(1));
      if (directories[nextPath]) {
        setCwd(nextPath);
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  function appendEntry(entryCwd: string, command: string | undefined, blocks: OutputBlock[]) {
    setTranscript((current) => [
      ...current,
      {
        id: nextId.current++,
        cwd: entryCwd,
        input: command,
        blocks,
      },
    ]);
  }

  function updateRoute(path: string) {
    const nextHash = '#' + encodeURIComponent(path).replaceAll('%2F', '/');
    window.history.pushState({ path }, '', nextHash);
  }

  function readFile(file: FileEntry): OutputBlock {
    if (file.format === 'markdown') {
      return { kind: 'markdown', source: file.content };
    }
    if (file.format === 'link') {
      return { kind: 'link', href: file.content, label: file.content };
    }
    return { kind: 'text', text: file.content.trimEnd() };
  }

  function runCommand(rawCommand: string) {
    const commandText = rawCommand.trim();
    if (!commandText) {
      appendEntry(cwd, '', []);
      return;
    }

    const tokens = tokenize(commandText);
    const command = tokens[0].toLowerCase();
    const args = tokens.slice(1);
    const nextLog = [...commandLog, commandText];
    setCommandLog(nextLog);
    setHistoryIndex(-1);

    if (command === 'clear' || command === 'cls') {
      setTranscript([]);
      return;
    }

    const blocks: OutputBlock[] = [];

    if (command === 'help' || command === 'man') {
      if (args[0]) {
        const requested = args.join(' ').toLowerCase();
        const match = COMMAND_HELP.filter(
          (entry) => entry.command.split(' ')[0] === requested,
        );
        blocks.push(
          match.length
            ? { kind: 'help', entries: match }
            : {
                kind: 'text',
                text: 'help: no entry for ' + requested,
                tone: 'error',
              },
        );
      } else {
        blocks.push({ kind: 'help', entries: COMMAND_HELP });
        blocks.push({
          kind: 'text',
          text: 'Tip: use Tab to complete commands and paths.',
          tone: 'muted',
        });
      }
    } else if (command === 'pwd') {
      blocks.push({ kind: 'text', text: cwd });
    } else if (command === 'whoami') {
      blocks.push({ kind: 'text', text: 'v01df0rg3', tone: 'success' });
    } else if (command === 'id') {
      blocks.push({
        kind: 'text',
        text: 'uid=1000(v01df0rg3) gid=1000(v01df0rg3) groups=1000(v01df0rg3)',
      });
    } else if (command === 'uname') {
      blocks.push({ kind: 'text', text: 'VoidWeb 1.0 static github-pages' });
    } else if (command === 'date') {
      blocks.push({ kind: 'text', text: new Date().toISOString() });
    } else if (command === 'echo') {
      blocks.push({ kind: 'text', text: args.join(' ') });
    } else if (command === 'theme') {
      blocks.push({
        kind: 'text',
        text: 'void — near-black / terminal-green / cyan / violet',
      });
    } else if (command === 'history') {
      blocks.push({
        kind: 'text',
        text: nextLog
          .map((entry, index) => String(index + 1).padStart(4, ' ') + '  ' + entry)
          .join('\n'),
      });
    } else if (command === 'fastfetch' || command === 'neofetch') {
      blocks.push({ kind: 'fastfetch' });
    } else if (command === 'ls') {
      const flagArgs = args.filter((arg) => arg.startsWith('-'));
      const pathArgs = args.filter((arg) => !arg.startsWith('-'));
      const invalidFlag = flagArgs.find((flag) => !/^-[al]+$/.test(flag));

      if (invalidFlag) {
        blocks.push({
          kind: 'text',
          text: 'ls: invalid option: ' + invalidFlag,
          tone: 'error',
        });
      } else if (pathArgs.length > 1) {
        blocks.push({
          kind: 'text',
          text: 'ls: only one path is supported',
          tone: 'error',
        });
      } else {
        const target = normalizePath(pathArgs[0] ?? '.', cwd);
        const directory = directories[target];
        const file = files[target];
        if (directory) {
          const flags = flagArgs.join('');
          blocks.push(listingFor(target, flags.includes('l'), flags.includes('a')));
        } else if (file) {
          blocks.push({
            kind: 'listing',
            long: flagArgs.join('').includes('l'),
            items: [
              {
                name: basename(target),
                path: target,
                directory: false,
                size: file.content.length,
              },
            ],
          });
        } else {
          blocks.push({
            kind: 'text',
            text: 'ls: ' + (pathArgs[0] ?? '.') + ': no such file or directory',
            tone: 'error',
          });
        }
      }
    } else if (command === 'cd') {
      if (args.length > 1) {
        blocks.push({ kind: 'text', text: 'cd: too many arguments', tone: 'error' });
      } else {
        const target =
          args[0] === '-'
            ? previousDirectory
            : normalizePath(args[0] ?? HOME, cwd);
        if (directories[target]) {
          setPreviousDirectory(cwd);
          setCwd(target);
          updateRoute(target);
          blocks.push(...landingFor(target));
        } else if (files[target]) {
          blocks.push({
            kind: 'text',
            text: 'cd: ' + (args[0] ?? '') + ': not a directory',
            tone: 'error',
          });
        } else {
          blocks.push({
            kind: 'text',
            text: 'cd: ' + (args[0] ?? '') + ': no such file or directory',
            tone: 'error',
          });
        }
      }
    } else if (command === 'cat') {
      if (!args.length) {
        blocks.push({ kind: 'text', text: 'cat: missing file operand', tone: 'error' });
      } else {
        args.forEach((arg, index) => {
          const target = normalizePath(arg, cwd);
          const file = files[target];
          if (args.length > 1) {
            blocks.push({
              kind: 'text',
              text: (index ? '\n' : '') + '==> ' + arg + ' <==',
              tone: 'muted',
            });
          }
          if (file) {
            blocks.push(readFile(file));
          } else if (directories[target]) {
            blocks.push({
              kind: 'text',
              text: 'cat: ' + arg + ': is a directory',
              tone: 'error',
            });
          } else {
            blocks.push({
              kind: 'text',
              text: 'cat: ' + arg + ': no such file',
              tone: 'error',
            });
          }
        });
      }
    } else if (command === 'tree') {
      const target = normalizePath(args[0] ?? '.', cwd);
      if (directories[target]) {
        blocks.push({ kind: 'text', text: treeFor(target) });
      } else if (files[target]) {
        blocks.push({ kind: 'text', text: basename(target) });
      } else {
        blocks.push({
          kind: 'text',
          text: 'tree: ' + (args[0] ?? '.') + ': no such directory',
          tone: 'error',
        });
      }
    } else if (command === 'open' || command === 'github') {
      const target = command === 'github' ? 'github' : args[0]?.toLowerCase();
      if (target === 'github') {
        const href = 'https://github.com/v01dF0rg3';
        const opened = window.open(href, '_blank', 'noopener,noreferrer');
        if (opened) {
          opened.opener = null;
        }
        blocks.push({ kind: 'link', href, label: 'opening github.com/v01dF0rg3' });
      } else {
        blocks.push({
          kind: 'text',
          text: 'open: available target: github',
          tone: 'error',
        });
      }
    } else if (command === 'coffee') {
      blocks.push({
        kind: 'text',
        text: 'brewing... error: coffee device not found',
        tone: 'muted',
      });
    } else if (command === 'sudo') {
      blocks.push({
        kind: 'text',
        text: 'v01df0rg3 is not in the sudoers file. This incident will not be reported.',
        tone: 'error',
      });
    } else if (command === 'rm') {
      blocks.push({
        kind: 'text',
        text: 'rm: virtual filesystem is read-only; nothing was removed',
        tone: 'success',
      });
    } else if (command === 'exit') {
      blocks.push({
        kind: 'text',
        text: 'logout denied: this tab has nowhere better to be',
        tone: 'muted',
      });
    } else {
      blocks.push({
        kind: 'text',
        text: 'zsh: command not found: ' + tokens[0],
        tone: 'error',
      });
    }

    appendEntry(cwd, commandText, blocks);
  }

  function completeInput() {
    const hasWhitespace = /\s/.test(input);
    const pieces = input.split(/\s+/);
    const finalPiece = pieces.at(-1) ?? '';

    if (!hasWhitespace) {
      const matches = COMMANDS.filter((command) => command.startsWith(finalPiece));
      if (matches.length === 1) {
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        appendEntry(cwd, undefined, [
          { kind: 'text', text: matches.join('   '), tone: 'muted' },
        ]);
      }
      return;
    }

    const activeCommand = pieces[0];
    const childNames = directories[cwd]?.children ?? [];
    const matches = childNames.filter((name) => {
      if (activeCommand === 'cd' && !name.endsWith('/')) {
        return false;
      }
      if (activeCommand === 'cat' && name.endsWith('/')) {
        return false;
      }
      return name.startsWith(finalPiece);
    });

    if (matches.length === 1) {
      setInput(input.slice(0, input.length - finalPiece.length) + matches[0]);
    } else if (matches.length > 1) {
      appendEntry(cwd, undefined, [
        { kind: 'text', text: matches.join('   '), tone: 'muted' },
      ]);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!commandLog.length) {
        return;
      }
      const nextIndex =
        historyIndex === -1 ? commandLog.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(commandLog[nextIndex]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === -1) {
        return;
      }
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandLog.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(commandLog[nextIndex]);
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      completeInput();
    } else if (event.key.toLowerCase() === 'l' && event.ctrlKey) {
      event.preventDefault();
      runCommand('clear');
    } else if (event.key.toLowerCase() === 'c' && event.ctrlKey) {
      event.preventDefault();
      appendEntry(cwd, input, [{ kind: 'text', text: '^C', tone: 'muted' }]);
      setInput('');
      setHistoryIndex(-1);
    } else if (event.key === 'Escape') {
      setInput('');
      setHistoryIndex(-1);
    }
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input;
    setInput('');
    runCommand(command);
  }

  function focusInput(event: MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest('a, button')) {
      inputRef.current?.focus();
    }
  }

  function renderBlock(block: OutputBlock, key: string) {
    if (block.kind === 'fastfetch') {
      return <Fastfetch key={key} uptime={uptime} />;
    }

    if (block.kind === 'welcome') {
      return (
        <div className="welcome" key={key}>
          <p>Welcome to the terminal.</p>
          <p className="output--muted">
            Type <span className="accent">help</span> to see available commands.
          </p>
        </div>
      );
    }

    if (block.kind === 'text') {
      return (
        <pre className={'output-text output--' + (block.tone ?? 'normal')} key={key}>
          {block.text}
        </pre>
      );
    }

    if (block.kind === 'markdown') {
      return <MarkdownOutput key={key} source={block.source} />;
    }

    if (block.kind === 'help') {
      return (
        <div className="help-grid" key={key}>
          {block.entries.map((entry) => (
            <Fragment key={entry.command}>
              <span className="help-command">{entry.command}</span>
              <span className="output--muted">{entry.description}</span>
            </Fragment>
          ))}
        </div>
      );
    }

    if (block.kind === 'listing') {
      return (
        <div
          className={'file-list' + (block.long ? ' file-list--long' : '')}
          key={key}
        >
          {block.items.map((item) => (
            <button
              className={item.directory ? 'file file--directory' : 'file'}
              key={item.path + item.name}
              onClick={() =>
                runCommand(
                  item.directory
                    ? 'cd ' + item.path
                    : 'cat ' + item.path,
                )
              }
              type="button"
              title={item.directory ? 'Open directory' : 'Read file'}
            >
              {block.long && (
                <>
                  <span className="file__mode">
                    {item.directory ? 'dr-xr-xr-x' : '-r--r--r--'}
                  </span>
                  <span className="file__size">{String(item.size).padStart(4, ' ')}</span>
                </>
              )}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      );
    }

    return (
      <a
        className="terminal-link"
        href={block.href}
        key={key}
        target="_blank"
        rel="noreferrer"
      >
        {block.label} ↗
      </a>
    );
  }

  return (
    <main
      className="terminal"
      aria-label="v01df0rg3 terminal portfolio"
      onClick={focusInput}
    >
      <div className="terminal__topline" aria-hidden="true">
        <span>v01df0rg3@void</span>
        <span>
          zsh-web <i className="online-dot" /> online
        </span>
      </div>

      <section className="terminal__scroll" aria-live="polite">
        {transcript.map((entry) => (
          <div className="transcript-entry" key={entry.id}>
            {entry.input !== undefined && (
              <div className="prompt-line">
                <Prompt cwd={entry.cwd} />
                <span className="command-text">{entry.input}</span>
              </div>
            )}
            <div className="command-output">
              {entry.blocks.map((block, index) =>
                renderBlock(block, entry.id + '-' + index),
              )}
            </div>
          </div>
        ))}

        <form className="prompt-line prompt-line--active" onSubmit={submitCommand}>
          <Prompt cwd={cwd} />
          <label className="sr-only" htmlFor="terminal-command">
            Terminal command
          </label>
          <input
            ref={inputRef}
            id="terminal-command"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setHistoryIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="terminal-hint"
          />
        </form>
        <p className="sr-only" id="terminal-hint">
          Type help for commands. Use the up and down arrow keys for command history.
        </p>
        <div ref={endRef} />
      </section>

      <nav className="quick-commands" aria-label="Quick terminal commands">
        {['help', 'ls', 'cd ..', 'clear', 'fastfetch'].map((command) => (
          <button key={command} type="button" onClick={() => runCommand(command)}>
            {command}
          </button>
        ))}
      </nav>
    </main>
  );
}

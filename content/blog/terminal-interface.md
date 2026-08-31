# why this portfolio is a terminal

`status: online`

I wanted the portfolio to feel like a place you can explore, not another page of
cards competing for attention. A shell gives the work a simple grammar: list a
directory, change location, read a file, follow a link.

The interface is a static React export with an allowlisted command parser. It
looks like a shell, but commands never reach a real machine. Paths resolve inside
a small virtual filesystem, and the URL hash remembers the current directory.

That keeps the experience playful without collecting anything. The animated
ASCII gravity well is the welcome signal; the writing and projects are the files
behind it.

Try the short route:

```text
ls
cd projects
cat session-sentinel.md
```

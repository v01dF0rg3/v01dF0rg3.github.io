# session-sentinel: an honest logout tool

`status: public build`

[open the repository](https://github.com/v01dF0rg3/session-sentinel)

Most “log out everywhere” buttons hide an important distinction: clearing data in
this browser is not the same thing as ending a session on a server. Session
Sentinel is built around making that distinction visible.

## The useful part

Every run reports what actually happened: a server-side sign-out, local data
clearing, or a failed step. It does not turn an incomplete cleanup into a green
checkmark.

The extension also waits for setup before automatic triggers can fire. That keeps
browser-close, inactivity, and screen-lock cleanup explicit instead of surprising.

## The constraint

Observed site data stays on the machine. There is no account, telemetry, or
analytics destination. The project is a small JavaScript experiment in making a
security tool more honest about its limits.

`language: JavaScript`
`license: MIT`

// Shared helpers for the launch-team skill: zellij pane discovery and input
// injection. Mirrors the proven approach in multi-agent-ff15-vscode
// (src/features/ff15-missions/transport.ts): target a specific pane by id with
// `action write-chars --pane-id` / `action send-keys --pane-id Enter`, which
// delivers text into another pane WITHOUT stealing focus.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const PROMPT_INPUT_DELAY_MS = 500;

// Synchronous sleep so the write-chars -> Enter sequence is paced the same way
// the reference implementation paces it, without turning everything async.
export function sleepSync(ms) {
  const shared = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(shared, 0, 0, ms);
}

export function runZellij(args) {
  const r = spawnSync('zellij', args, { encoding: 'utf8' });
  return {
    status: r.status ?? 1,
    stdout: r.stdout ?? '',
    stderr: r.stderr ?? '',
    error: r.error,
  };
}

export function zellijOnPath() {
  const probe = process.platform === 'win32'
    ? spawnSync('where', ['zellij'], { stdio: 'ignore' })
    : spawnSync('which', ['zellij'], { stdio: 'ignore' });
  return probe.status === 0;
}

// The session this skill operates in. Every pane targeted by id must live in the
// same session; we capture it once at launch and reuse it everywhere.
export function currentSession() {
  return process.env.ZELLIJ_SESSION_NAME || null;
}

// Normalize an agent id to the form used for pane names / title matching.
export function normalizeAgentId(id) {
  return String(id || '').trim().toLowerCase();
}

// zellij reports a pane id either as a string ("terminal_9") or a bare number.
function toPaneId(pane) {
  if (typeof pane.id === 'string' && pane.id.length > 0) return pane.id;
  if (typeof pane.id === 'number') return `terminal_${pane.id}`;
  return null;
}

function paneCommand(pane) {
  if (typeof pane.pane_command === 'string' && pane.pane_command.length > 0) return pane.pane_command;
  if (typeof pane.terminal_command === 'string' && pane.terminal_command.length > 0) return pane.terminal_command;
  return '';
}

export function listPanes(session) {
  const r = runZellij(['--session', session, 'action', 'list-panes', '--json']);
  if (r.status !== 0) {
    throw new Error(`zellij list-panes failed: ${r.stderr.trim() || r.error?.message || 'unknown error'}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(r.stdout);
  } catch {
    throw new Error('Could not parse zellij pane metadata (list-panes --json).');
  }
  if (!Array.isArray(parsed)) throw new Error('Unexpected zellij pane metadata shape.');
  return parsed.filter((p) => p && typeof p === 'object');
}

function isLivePane(pane) {
  return !(pane.exited || pane.is_plugin || pane.is_selectable === false);
}

// Normalize a pane-id hint to the same shape listPanes/toPaneId produce, so a
// bare number captured from `new-pane` still matches a "terminal_N" pane.
function normalizePaneIdHint(hint) {
  if (!hint) return null;
  return /^\d+$/.test(hint) ? `terminal_${hint}` : hint;
}

// zellij decorates the displayed pane title (e.g. a leading spinner glyph for a
// running command: "⠐ orchestrator"). Match on the agent id robustly: strip any
// leading non-alphanumeric decoration, then accept an exact or token match.
function titleMatches(title, target) {
  const t = String(title || '').toLowerCase();
  const cleaned = t.replace(/^[^a-z0-9]+/, '').trim();
  if (cleaned === target) return true;
  const escaped = target.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9-])${escaped}([^a-z0-9-]|$)`).test(t);
}

// Resolve the pane id for an agent. Prefer a cached hint (fast, survives across
// calls); fall back to matching the pane name/title we launched the agent with.
export function resolvePaneId(session, agentId, hintPaneId) {
  const target = normalizeAgentId(agentId);
  const hint = normalizePaneIdHint(hintPaneId);
  const panes = listPanes(session);

  if (hint && panes.some((p) => toPaneId(p) === hint)) {
    return hint;
  }

  for (const pane of panes) {
    if (!isLivePane(pane)) continue;
    const cmd = paneCommand(pane).toLowerCase();
    if (titleMatches(pane.title, target) || cmd.includes(`--name ${target}`)) {
      const id = toPaneId(pane);
      if (id) return id;
    }
  }
  return null;
}

// Deliver text into a pane's input the way a human would: type the whole block,
// pause so the prompt registers it, then press Enter. Mirrors transport.ts.
export function sendToPane(session, paneId, text) {
  const write = runZellij(['--session', session, 'action', 'write-chars', '--pane-id', paneId, text]);
  if (write.status !== 0) {
    throw new Error(`zellij write-chars failed: ${write.stderr.trim() || write.error?.message || 'unknown error'}`);
  }
  sleepSync(PROMPT_INPUT_DELAY_MS);
  const enter = runZellij(['--session', session, 'action', 'send-keys', '--pane-id', paneId, 'Enter']);
  if (enter.status !== 0) {
    throw new Error(`zellij send-keys Enter failed: ${enter.stderr.trim() || enter.error?.message || 'unknown error'}`);
  }
  sleepSync(PROMPT_INPUT_DELAY_MS);
}

export function readRoster(teamDir) {
  const file = path.join(teamDir, 'roster.json');
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function writeRoster(teamDir, roster) {
  fs.writeFileSync(path.join(teamDir, 'roster.json'), JSON.stringify(roster, null, 2), 'utf8');
}

export function appendLog(teamDir, entry) {
  try {
    fs.appendFileSync(
      path.join(teamDir, 'log.jsonl'),
      JSON.stringify({ ts: new Date().toISOString(), ...entry }) + '\n',
      'utf8',
    );
  } catch {
    // logging is best-effort; never fail a delivery because the log write failed
  }
}

// Compose the text that lands in a teammate's prompt. The prefix tells the
// receiving agent who it is from so it can reply to the right teammate.
export function formatMessage({ fromId, fromRole, message }) {
  const who = fromRole ? `${fromId} — ${fromRole}` : fromId;
  return `[team message from ${who}]\n${message}`;
}

// Send `message` from one agent to another (or to all teammates). Resolves the
// recipient pane id, refreshing the roster hint when it has gone stale.
export function deliverMessage({ teamDir, fromId, toId, message }) {
  const roster = readRoster(teamDir);
  const session = roster.session || currentSession();
  if (!session) throw new Error('No zellij session recorded for this team and none in the environment.');

  const fromEntry = roster.agents.find((a) => a.id === normalizeAgentId(fromId));
  const fromRole = fromEntry?.role || '';
  const text = formatMessage({ fromId: normalizeAgentId(fromId), fromRole, message });

  const recipients = normalizeAgentId(toId) === 'all'
    ? roster.agents.filter((a) => a.id !== normalizeAgentId(fromId))
    : roster.agents.filter((a) => a.id === normalizeAgentId(toId));

  if (recipients.length === 0) {
    throw new Error(`No recipient matched "${toId}". Known agents: ${roster.agents.map((a) => a.id).join(', ')}`);
  }

  const results = [];
  let rosterDirty = false;
  for (const agent of recipients) {
    const paneId = resolvePaneId(session, agent.id, agent.paneId);
    if (!paneId) {
      results.push({ to: agent.id, ok: false, reason: 'pane not found (agent may have exited)' });
      appendLog(teamDir, { event: 'send', from: normalizeAgentId(fromId), to: agent.id, ok: false });
      continue;
    }
    if (paneId !== agent.paneId) {
      agent.paneId = paneId; // refresh stale hint
      rosterDirty = true;
    }
    sendToPane(session, paneId, text);
    results.push({ to: agent.id, ok: true, paneId });
    appendLog(teamDir, { event: 'send', from: normalizeAgentId(fromId), to: agent.id, ok: true });
  }
  if (rosterDirty) writeRoster(teamDir, roster);
  return results;
}

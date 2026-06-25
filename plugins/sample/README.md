# sample plugin

Starter plugin for [`atman-marketplace`](https://github.com/atman-33/atman-marketplace).
Use it as a template when adding new plugins.

## Contents

| Folder / file       | Type            | Notes                                                      |
| ------------------- | --------------- | ---------------------------------------------------------- |
| `commands/add-docs.md`              | Slash command | Adds JSDoc comments to a given file.     |
| `skills/commit-helper/SKILL.md`     | Agent skill   | Drafts Conventional Commits messages.    |
| `hooks/hooks.json`                  | Hooks         | Beeps on `Stop` / `Notification` events. |
| `agents/`                           | Sub-agents    | Empty (add `.md` files here).            |
| `.mcp.json`                         | MCP           | Not included (add at plugin root).      |

## Hooks: Windows vs WSL

The committed `hooks/hooks.json` targets **native Windows** using
`powershell -NoProfile`. WSL/Linux equivalents are provided below — swap them in
if you run Claude Code inside WSL.

### Windows (default)

```json
{
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "powershell -NoProfile -Command [console]::beep(800,200)"
        }
      ]
    }
  ],
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "powershell -NoProfile -Command [console]::beep(600,150)"
        }
      ]
    }
  ]
}
```

### WSL / Linux

```json
{
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "printf '\\a'"
        }
      ]
    }
  ],
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "printf '\\a'"
        }
      ]
    }
  ]
}
```

If `paplay` and a sound theme are available, you may instead use
`paplay /usr/share/sounds/freedesktop/stereo/complete.oga`.

## Customizing

Rename the plugin directory and update:

1. `plugins/<new-name>/.claude-plugin/plugin.json` → `name` field
2. `.claude-plugin/marketplace.json` → entry in the `plugins` array

Add asset folders (`commands/`, `agents/`, `hooks/`, `.mcp.json`, `skills/`)
as needed.
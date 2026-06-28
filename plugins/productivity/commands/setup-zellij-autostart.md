---
name: setup-zellij-autostart
description: Configure PowerShell, WSL bash, and WSL zsh profiles to automatically launch Zellij on startup.
allowed-tools: PowerShell Bash Read Write Edit
---

## Task

Configure each shell profile to automatically launch Zellij terminal multiplexer on startup
for PowerShell and WSL environments (bash / zsh).

## Steps

### 1. Check Zellij installation (per environment)

**PowerShell:**
Run `Get-Command zellij -ErrorAction SilentlyContinue`. If not found, show a warning and skip
(continue setting up the other environments).

**WSL:**
Run `wsl -- which zellij`. If not found, show a warning and skip.

Installation guidance:
- Windows (PowerShell): `winget install zellij` or `cargo install zellij`
- WSL: `cargo install zellij` or see the official site (https://zellij.dev)

---

### 2. Configure PowerShell profiles

Process the following **two profiles** independently.

#### 2-A. PowerShell 7 profile

1. Get the profile path from `$PROFILE`.
2. If the file does not exist, create it along with its parent directory.
3. Read the file and check whether it contains `ZELLIJ` or `Auto-start Zellij`.
   If found, mark as "already configured" and skip.
4. If not found, append the following at the end of the file:

   ```powershell
   # Auto-start Zellij
   if (-not $env:ZELLIJ) {
       $cwd = (Get-Location).Path
       zellij options --default-shell pwsh --default-cwd $cwd
   }
   ```

   > **Why `--default-cwd`?**
   > On Windows, Zellij does not inherit the CWD from the launching shell, so new
   > panes open in the user home directory. `--default-cwd` sets the working
   > directory for the Zellij session directly, without altering the shell command.
   > (`pwsh` = PowerShell 7 executable name on Windows)

#### 2-B. Windows PowerShell profile

1. Build the profile path without hardcoding the username:

   ```powershell
   $winPSProfile = Join-Path ([Environment]::GetFolderPath("MyDocuments")) "WindowsPowerShell\Microsoft.PowerShell_profile.ps1"
   ```

2. If the parent directory (`WindowsPowerShell\`) does not exist, create it with `New-Item -ItemType Directory -Force`.
3. If the file does not exist, create it.
4. Read the file and check whether it contains `ZELLIJ` or `Auto-start Zellij`.
   If found, mark as "already configured" and skip.
5. If not found, append the following at the end of the file:

   ```powershell
   # Auto-start Zellij
   if (-not $env:ZELLIJ) {
       $cwd = (Get-Location).Path
       zellij options --default-shell powershell --default-cwd $cwd
   }
   ```

   > **Why `--default-cwd`?**
   > Same reason as 2-A. (`powershell` = Windows PowerShell 5.x executable name)

> Note: On systems where OneDrive redirects the Documents folder, `GetFolderPath("MyDocuments")` returns the OneDrive path. This is expected and correct.

---

### 3. Configure WSL bash profile

1. Run `wsl -- test -f ~/.bashrc && echo exists` to check whether `~/.bashrc` exists.
2. Run `wsl -- grep -q "ZELLIJ" ~/.bashrc` to check for duplicates.
   If already present, skip.
3. If not present, append the following:

   ```bash
   # Auto-start Zellij
   if [[ -z "$ZELLIJ" ]]; then
       zellij
   fi
   ```

   Append command:
   ```
   wsl -- bash -c 'printf "\n# Auto-start Zellij\nif [[ -z \"\$ZELLIJ\" ]]; then\n    zellij\nfi\n" >> ~/.bashrc'
   ```

---

### 4. Configure WSL zsh profile (only if zsh is installed)

1. Run `wsl -- which zsh` to check whether zsh is available. If not found, skip.
2. Run `wsl -- test -f ~/.zshrc && echo exists` to check whether `~/.zshrc` exists.
3. Run `wsl -- grep -q "ZELLIJ" ~/.zshrc` to check for duplicates.
   If already present, skip.
4. If not present, append the following:

   ```zsh
   # Auto-start Zellij
   if [[ -z "$ZELLIJ" ]]; then
       zellij
   fi
   ```

   Append command:
   ```
   wsl -- zsh -c 'printf "\n# Auto-start Zellij\nif [[ -z \"\$ZELLIJ\" ]]; then\n    zellij\nfi\n" >> ~/.zshrc'
   ```

---

### 5. Report results (follow the Output Format below)

## Output Format

```
## Zellij Auto-start Setup

| Environment        | Status                                              | Profile Path |
|--------------------|-----------------------------------------------------|--------------|
| PowerShell 7       | <Added / Already configured (skipped) / Skipped>   | <$PROFILE path> |
| Windows PowerShell | <Added / Already configured (skipped) / Skipped>   | <Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1> |
| WSL bash           | <Added / Already configured (skipped) / Skipped>   | ~/.bashrc |
| WSL zsh            | <Added / Already configured (skipped) / zsh not installed> | ~/.zshrc |

### Actions taken
- <bulleted list of what was actually done>

### Next steps
- Open each shell in a new session and verify that Zellij starts automatically.
- If you are already inside a Zellij session, nested launches are suppressed via the `$ZELLIJ` variable.
```

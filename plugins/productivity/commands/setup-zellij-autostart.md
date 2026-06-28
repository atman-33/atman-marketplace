---
name: setup-zellij-autostart
description: Configure PowerShell, WSL bash, and WSL zsh profiles to automatically launch Zellij on startup.
allowed-tools: PowerShell Bash Read Write Edit
---

## タスク

PowerShell および WSL 環境 (bash / zsh) の起動時に Zellij ターミナルマルチプレクサを
自動起動するよう、各シェルのプロファイルを設定します。

## ステップ

### 1. Zellij のインストール確認（環境別）

**PowerShell 側:**
`Get-Command zellij -ErrorAction SilentlyContinue` を実行し、Zellij が見つからなければ
警告のみ表示してスキップ（他の環境の設定は続行）。

**WSL 側:**
`wsl -- which zellij` を実行し、見つからなければ警告のみ表示してスキップ。

インストール方法の案内:
- Windows (PowerShell): `winget install zellij` または `cargo install zellij`
- WSL: `cargo install zellij` または公式サイト (https://zellij.dev) 参照

---

### 2. PowerShell プロファイルの設定

1. PowerShell で `$PROFILE` のパスを取得する。
2. ファイルが存在しない場合は、親ディレクトリごと新規作成する。
3. Read でファイルを読み込み、`ZELLIJ` または `Auto-start Zellij` が含まれていれば
   「設定済み」として追加をスキップする。
4. 含まれていなければ末尾に以下を追記する：

   ```powershell
   # Auto-start Zellij
   if (-not $env:ZELLIJ) {
       zellij
   }
   ```

---

### 3. WSL bash プロファイルの設定

1. `wsl -- test -f ~/.bashrc && echo exists` で `~/.bashrc` の存在を確認する。
2. `wsl -- grep -q "ZELLIJ" ~/.bashrc` で重複確認する。
   すでに含まれていればスキップ。
3. 含まれていなければ以下を追記する：

   ```bash
   # Auto-start Zellij
   if [[ -z "$ZELLIJ" ]]; then
       zellij
   fi
   ```

   追記コマンド:
   ```
   wsl -- bash -c 'printf "\n# Auto-start Zellij\nif [[ -z \"\$ZELLIJ\" ]]; then\n    zellij\nfi\n" >> ~/.bashrc'
   ```

---

### 4. WSL zsh プロファイルの設定（zsh が存在する場合のみ）

1. `wsl -- which zsh` で zsh の有無を確認する。存在しない場合はスキップ。
2. `wsl -- test -f ~/.zshrc && echo exists` で `~/.zshrc` の存在を確認する。
3. `wsl -- grep -q "ZELLIJ" ~/.zshrc` で重複確認する。
   すでに含まれていればスキップ。
4. 含まれていなければ以下を追記する：

   ```zsh
   # Auto-start Zellij
   if [[ -z "$ZELLIJ" ]]; then
       zellij
   fi
   ```

   追記コマンド:
   ```
   wsl -- zsh -c 'printf "\n# Auto-start Zellij\nif [[ -z \"\$ZELLIJ\" ]]; then\n    zellij\nfi\n" >> ~/.zshrc'
   ```

---

### 5. 結果を報告（下記「出力フォーマット」に従う）

## 出力フォーマット

```
## Zellij 自動起動設定

| 環境       | 状態                                          | プロファイルパス |
|------------|-----------------------------------------------|------------------|
| PowerShell | <追加完了 / 設定済み（スキップ） / スキップ>  | <$PROFILE のパス> |
| WSL bash   | <追加完了 / 設定済み（スキップ） / スキップ>  | ~/.bashrc        |
| WSL zsh    | <追加完了 / 設定済み（スキップ） / zsh 未インストール> | ~/.zshrc |

### 実行内容
- <実際に行った操作の箇条書き>

### 次のステップ
- 各シェルを新しいセッションで開き、Zellij が自動起動することを確認してください。
- すでに Zellij セッション内にいる場合は入れ子起動が抑制されます（`$ZELLIJ` 変数で制御）。
```

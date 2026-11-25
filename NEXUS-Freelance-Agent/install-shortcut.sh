#!/usr/bin/env bash
# Adds a "NEXUS" launcher to the desktop / applications menu (Linux) or Desktop (macOS).
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "$(uname)" = "Darwin" ]; then
  ln -sf "$DIR/NEXUS.command" "$HOME/Desktop/NEXUS.command" && echo "Shortcut added to Desktop"
else
  mkdir -p "$HOME/.local/share/applications"
  cat > "$HOME/.local/share/applications/nexus.desktop" <<EOD
[Desktop Entry]
Name=NEXUS Freelance Agent
Exec=$DIR/start.sh
Terminal=true
Type=Application
Categories=Office;
EOD
  cp "$HOME/.local/share/applications/nexus.desktop" "$HOME/Desktop/" 2>/dev/null
  echo "Launcher added (applications menu + Desktop)"
fi

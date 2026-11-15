#!/usr/bin/env bash
# Releases opsbuf web on the Mac mini from a green main build: the backend (gradle installDist) and the built frontend
# replace ~/Apps/opsbuf-web, and the LaunchAgent pl.opsbuf.web restarts. nginx serves it at https://opsbuf.local.
# Run by opsbuf CI after "Frontend build" and "Backend build". The data in ~/Apps/opsbuf-web/data stays.
set -euo pipefail
app=$HOME/Apps/opsbuf-web
port=7480
label=pl.opsbuf.web

mkdir -p "$app/data" "$HOME/Apps/logs"
rsync -a --delete backend/build/install/ptx-web-backend/ "$app/backend/"
rsync -a --delete frontend/dist/frontend/browser/ "$app/web/"
sed -e "s|__HOME__|$HOME|g" -e "s|__PORT__|$port|g" -e "s|__JAVA_HOME__|$JAVA_HOME|g" deploy/$label.plist > "$HOME/Library/LaunchAgents/$label.plist"

domain="gui/$(id -u)"
launchctl bootout "$domain/$label" 2> /dev/null && sleep 1 || true
launchctl bootstrap "$domain" "$HOME/Library/LaunchAgents/$label.plist"
for _ in $(seq 1 60); do
  curl -fsS -o /dev/null "http://127.0.0.1:$port/" && { echo "released $(git rev-parse --short HEAD): https://opsbuf.local"; exit 0; }
  sleep 0.5
done
echo "opsbuf web did not answer on port $port. Read ~/Apps/logs/opsbuf-web-error.log" >&2
exit 1

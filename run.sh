#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd "$SCRIPT_DIR" || exit 1

mkdir -p logs

function log() {
	local msg="$1"
	local logfile
	logfile="$SCRIPT_DIR/logs/run.txt"
	echo "[*][start_api] $msg"
	echo "[$(date '+%F %H:%M')][*][start_api] $msg" >> "$logfile"
	tail -n 20 "$logfile" > "$logfile".tmp
	mv "$logfile".tmp "$logfile"
}

if [ "$HOME" == "" ]
then
	log "Error: \$HOME is not set"
	exit 1
fi
export NVM_DIR="$HOME/.nvm"
if ! [ -s "$NVM_DIR/nvm.sh" ]
then
	log "Error: nvm.sh not found. Did you install nvm?"
	exit 1
fi
# shellcheck disable=SC1090
source "$NVM_DIR/nvm.sh"

screen -ls | grep chillerbot-api && { log "api server already running"; exit 1; }

npm install
screen -AmdS chillerbot-api bash -c 'node chillerbot-api-srv.js'

log "started chillerbot api server"

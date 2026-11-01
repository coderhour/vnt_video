#!/usr/bin/env bash
# Step 7 in one command: render, loudnorm to -14 LUFS, poster.
#   render.sh <slug> <poster_seconds>
# Renders queue for one of 2 slots (flock), so parallel builders never need a `ps` check.
# Ends with videos/<slug>/render.done or render.failed; the log is videos/<slug>/render.log.
set -uo pipefail
slug=$1; poster=${2:-30}
root=$(cd "$(dirname "$0")/../../../.." && pwd)
out=$root/videos/$slug
mkdir -p "$out"; rm -f "$out/render.done" "$out/render.failed"
exec >"$out/render.log" 2>&1
trap '[ -f "$out/render.done" ] || touch "$out/render.failed"' EXIT
set -e

locks=/tmp/vnt-render-locks; mkdir -p "$locks"
echo "waiting for a render slot $(date +%T)"
while :; do  # ponytail: poll 2 slot locks, a semaphore if more slots ever matter
  exec 9>"$locks/slot1"; flock -n 9 && break
  exec 9>"$locks/slot2"; flock -n 9 && break
  sleep 10
done
echo "rendering $(date +%T)"
cd "$root/studio"
npx remotion render src/index.ts "$slug" "$out/video.raw.mp4" --concurrency=4
exec 9>&-  # free the slot before the cheap ffmpeg steps

ffmpeg -y -loglevel error -i "$out/video.raw.mp4" -c:v copy \
  -af loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=false -ar 48000 -c:a aac -b:a 192k "$out/video.mp4"
rm "$out/video.raw.mp4"
ffmpeg -y -loglevel error -ss "$poster" -i "$out/video.mp4" -frames:v 1 "$out/poster.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/video.mp4"
touch "$out/render.done"
echo "done $(date +%T)"

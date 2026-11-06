#!/usr/bin/env bash
# Step 7 in one command: render, loudnorm to -14 LUFS, poster.
#   render.sh <slug> <poster_seconds>
#   render.sh <slug> - short      the vertical short -> short.mp4 (markers short.render.*, no poster)
#   (a *-zh slug always renders the China cut into video.mp4 / short.mp4, so it needs no cn run)
#   render.sh <slug> - video|short cn   China cut (no domain on screen) -> video-cn.mp4 / short-cn.mp4 (markers *-cn.render.*)
# Renders queue for one of 2 slots (flock), so parallel builders never need a `ps` check.
# Ends with videos/<slug>/render.done or render.failed; the log is videos/<slug>/render.log.
set -uo pipefail
slug=$1; poster=${2:-30}
comp=$slug; name=video; m=render  # m = marker/log prefix
[ "${3:-}" = short ] && comp=$slug-short && name=short && m=short.render
props=()
[[ $slug = *-zh ]] && props=(--props='{"cn":true}')  # Chinese videos are for China: never a domain on screen
[ "${4:-}" = cn ] && name=$name-cn && m=$name.render && props=(--props='{"cn":true}')
root=$(cd "$(dirname "$0")/../../../.." && pwd)
out=$root/videos/$slug
mkdir -p "$out"; rm -f "$out/$m.done" "$out/$m.failed"
exec >"$out/$m.log" 2>&1
trap '[ -f "$out/$m.done" ] || touch "$out/$m.failed"' EXIT
set -e

locks=/tmp/vnt-render-locks; mkdir -p "$locks"
echo "waiting for a render slot $(date +%T)"
long_waiting() {  # a full video whose log still ends at "waiting for a render slot"
  for l in "$root"/videos/*/render.log; do tail -n 1 "$l" | grep -q '^waiting for a render slot' && return 0; done
  return 1
}
while :; do  # ponytail: poll 2 slot locks, a semaphore if more slots ever matter
  if [[ $name = short* ]] && long_waiting; then sleep 10; continue; fi  # full videos go first
  exec 9>"$locks/slot1"; flock -n 9 && break
  exec 9>"$locks/slot2"; flock -n 9 && break
  sleep 10
done
echo "rendering $(date +%T)"
cd "$root/studio"
npx remotion render src/index.ts "$comp" "$out/$name.raw.mp4" --concurrency=4 "${props[@]}"
exec 9>&-  # free the slot before the cheap ffmpeg steps

ffmpeg -y -loglevel error -i "$out/$name.raw.mp4" -c:v copy \
  -af loudnorm=I=-14:TP=-1.5:LRA=11,alimiter=limit=0.8:level=false -ar 48000 -c:a aac -b:a 192k "$out/$name.mp4"
rm "$out/$name.raw.mp4"
[ "$name" = video ] && ffmpeg -y -loglevel error -ss "$poster" -i "$out/video.mp4" -frames:v 1 "$out/poster.jpg"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$name.mp4"
touch "$out/$m.done"
echo "done $(date +%T)"

#!/usr/bin/env bash
# Prepare Seedance 2.0 clips for the website.
#
# Usage:  scripts/prepare-media.sh <folder-with-raw-clips>
#
# The folder must contain cafe.mp4, salon.mp4, nail.mp4, office.mp4 and
# restaurant.mp4 (any that are missing are skipped). For each clip this:
#   1. re-encodes it to <id>.mp4 (H.264) and <id>.webm (VP9) with a keyframe on
#      every frame so scroll scrubbing is smooth, and strips audio;
#   2. extracts the middle frame as the concept still <id>.jpg.
# The site plays whichever video format the visitor's browser supports.
# Output goes to assets/media/, where the site picks it up automatically.
set -euo pipefail

src="${1:?Give the folder that holds the raw Seedance clips}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/assets/media"
mkdir -p "$out"

for id in cafe salon nail office restaurant; do
  in="$src/$id.mp4"
  if [[ ! -f "$in" ]]; then
    echo "skip  $id (no $in)"
    continue
  fi

  ffmpeg -loglevel error -y -i "$in" -an \
    -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p \
    -g 1 -keyint_min 1 -movflags +faststart \
    -vf "scale='min(1280,iw)':-2" \
    "$out/$id.mp4"

  ffmpeg -loglevel error -y -i "$in" -an \
    -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -deadline good -cpu-used 4 \
    -g 1 -keyint_min 1 -pix_fmt yuv420p \
    -vf "scale='min(1280,iw)':-2" \
    "$out/$id.webm"

  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")"
  mid="$(awk -v d="$dur" 'BEGIN { printf "%.2f", d / 2 }')"
  ffmpeg -loglevel error -y -ss "$mid" -i "$in" -frames:v 1 -q:v 3 \
    -vf "scale='min(1600,iw)':-2" "$out/$id.jpg"

  echo "done  $id → assets/media/$id.{mp4,webm,jpg}"
done

# Record which files exist so the site only requests real media.
{
  echo "// Written by scripts/prepare-media.sh — lists the Seedance 2.0 files present."
  echo "window.PLOTO_MEDIA = {"
  for id in cafe salon nail office restaurant; do
    formats=()
    [[ -f "$out/$id.webm" ]] && formats+=('"webm"')
    [[ -f "$out/$id.mp4" ]] && formats+=('"mp4"')
    s=false
    [[ -f "$out/$id.jpg" ]] && s=true
    if [[ ${#formats[@]} -gt 0 || $s == true ]]; then
      echo "  $id: { video: [$(IFS=,; echo "${formats[*]}")], still: $s },"
    fi
  done
  echo "};"
} > "$out/manifest.js"
echo "wrote assets/media/manifest.js"

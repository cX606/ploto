#!/usr/bin/env bash
# Download the Seedance 2.0 renders listed in seedance/clips.json, then run
# prepare-media.sh to make the scroll-optimised copies and concept stills.
#
# Usage:  scripts/fetch-seedance.sh
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
raw="$(mktemp -d)"
trap 'rm -rf "$raw"' EXIT

python3 - "$root/seedance/clips.json" <<'PY' | while read -r id url; do
import json, sys
for space, clip in json.load(open(sys.argv[1]))["clips"].items():
    print(space, clip["url"])
PY
  echo "fetch $id"
  curl -fsSL --retry 3 -o "$raw/$id.mp4" "$url"
done

"$root/scripts/prepare-media.sh" "$raw"

#!/usr/bin/env bash
# Back up the git-ignored tailored.json to Google Drive (folder "cvpage-backup")
# using the gws CLI. Creates the file on first run, updates it after that.
set -euo pipefail

cd "$(dirname "$0")/.."
FILE="src/_data/tailored.json"
FOLDER_NAME="cvpage-backup"

folder_id=$(gws drive files list \
  --params "{\"q\": \"name = '$FOLDER_NAME' and mimeType = 'application/vnd.google-apps.folder' and trashed = false\", \"fields\": \"files(id)\"}" \
  2>/dev/null | python3 -c 'import json,sys; f=json.load(sys.stdin)["files"]; print(f[0]["id"] if f else "")')

if [ -z "$folder_id" ]; then
  folder_id=$(gws drive files create \
    --json "{\"name\": \"$FOLDER_NAME\", \"mimeType\": \"application/vnd.google-apps.folder\"}" \
    --params '{"fields": "id"}' 2>/dev/null | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
fi

file_id=$(gws drive files list \
  --params "{\"q\": \"name = 'tailored.json' and '$folder_id' in parents and trashed = false\", \"fields\": \"files(id)\"}" \
  2>/dev/null | python3 -c 'import json,sys; f=json.load(sys.stdin)["files"]; print(f[0]["id"] if f else "")')

if [ -z "$file_id" ]; then
  gws drive files create --upload "$FILE" --upload-content-type application/json \
    --json "{\"name\": \"tailored.json\", \"parents\": [\"$folder_id\"]}" \
    --params '{"fields": "id,name,modifiedTime"}'
else
  gws drive files update --upload "$FILE" --upload-content-type application/json \
    --params "{\"fileId\": \"$file_id\", \"fields\": \"id,name,modifiedTime\"}"
fi

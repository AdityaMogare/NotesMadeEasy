#!/bin/bash

REPO_OWNER="AdityaMogare"
REPO_NAME="NotesMadeEasy"

# Force milestone titles to use ASCII-only dash (-)
declare -A milestones=(
  ["v1 - Optional Login & User Sync"]=""
  ["v2 - Tags, Search & Music"]=""
  ["v3 - Pencil, Drawing & Sharing"]=""
)

# === Get Milestone IDs ===
for title in "${!milestones[@]}"; do
  id=$(gh api repos/$REPO_OWNER/$REPO_NAME/milestones | jq -r ".[] | select(.title==\"$title\") | .number")
  if [ -z "$id" ]; then
    echo "❌ Milestone '$title' not found. Make sure to use ASCII '-' in milestone title."
    exit 1
  fi
  milestones["$title"]=$id
  echo "📌 Milestone '$title' → ID ${id}"
done

# === Define Issues: title|body|milestone_key ===
issues=(
  # v1
  "Add optional user authentication with JWT|Allow users to sign up/login and sync notes across devices, while still allowing guest usage.|v1 - Optional Login & User Sync"
  "Implement user-based note isolation|Logged-in users can only view their own notes. Guests work in isolated local storage.|v1 - Optional Login & User Sync"

  # v2
  "Add note tagging & filtering|Users can tag notes (e.g., #study, #work) and filter them.|v2 - Tags, Search & Music"
  "Implement full-text search for notes|Add fuzzy search across note titles and content.|v2 - Tags, Search & Music"
  "Enable pinning/starred notes|Users can pin notes, which show up at the top of the list.|v2 - Tags, Search & Music"
  "Add export to PDF/Markdown option|Allow users to export notes as PDF or Markdown.|v2 - Tags, Search & Music"
  "Integrate music player (Spotify/YouTube embedded)|Embed focus music support (e.g., Spotify or YouTube playlists).|v2 - Tags, Search & Music"

  # v3
  "Support Apple Pencil / stylus drawing canvas|Add a canvas that supports handwriting or sketching using touch/stylus.|v3 - Pencil, Drawing & Sharing"
  "Save drawings as part of notes|Allow users to attach handwritten drawings to notes.|v3 - Pencil, Drawing & Sharing"
  "Enable feature-flag-based rollouts|Add feature toggles to enable/disable specific modules in production.|v3 - Pencil, Drawing & Sharing"
)

# === Create Issues ===
for issue in "${issues[@]}"; do
  IFS="|" read -r title body milestone_key <<< "$issue"
  milestone_id=${milestones["$milestone_key"]}

  echo "📝 Creating: $title"
  gh issue create \
    --title "$title" \
    --body "$body" \
    --label "enhancement" \
    --milestone "$milestone_key"
done

echo "✅ All issues for v1, v2, and v3 created and assigned!"

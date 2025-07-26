#!/bin/bash

# === CONFIGURE THESE ===
REPO_OWNER="AdityaMogare"
REPO_NAME="NotesMadeEasy"
MILESTONE_TITLE="MVP – Guest Notes & Pomodoro"

echo "🔧 Creating MVP issues for $REPO_NAME in milestone: $MILESTONE_TITLE"

# === ISSUES TO CREATE ===
issues=(
  "Guest session persistence (localStorage fallback)|Enable note storage for non-logged-in users using browser localStorage.|frontend,UX,feature"
  "Add Pomodoro timer with custom durations|Provide a customizable Pomodoro timer.|frontend,feature,UX"
  "Deploy to production (Vercel + Render)|Deploy frontend on Vercel, backend on Render, using MongoDB Atlas.|deployment,devops"
  "Track feedback for each feature release|Add a form or modal to collect user feedback after new feature launches.|product,feedback,UX"
)

# === CREATE ISSUES ===
for issue in "${issues[@]}"; do
  IFS="|" read -r title body labels <<< "$issue"
  echo "➡️ Creating: $title"
  
  gh issue create \
    --title "$title" \
    --body "$body" \
    --label "$labels" \
    --milestone "$MILESTONE_TITLE"
  
  echo "✅ Created: $title"
done

echo "🎯 All MVP issues created and assigned to milestone '$MILESTONE_TITLE'"

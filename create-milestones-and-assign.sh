#!/bin/bash

# === CONFIGURE THESE ===
REPO_OWNER="AdityaMogare"
REPO_NAME="NotesMadeEasy"

# === CREATE MILESTONES ===
echo " Creating milestones..."

gh api repos/$REPO_OWNER/$REPO_NAME/milestones -f title='MVP – Guest Notes & Pomodoro' \
  -f description='First usable version of NotesMadeEasy with support for guest users. Includes core note-taking, Pomodoro timer, and offline persistence via localStorage.' \
  -f due_on="$(date -u -v+5d +%Y-%m-%dT%H:%M:%SZ)" # due in 5 days

gh api repos/$REPO_OWNER/$REPO_NAME/milestones -f title='v1 – Optional Login & User Sync' \
  -f description='Enable optional authentication so users can save notes in the cloud and sync across devices. Local guest mode still works.'

gh api repos/$REPO_OWNER/$REPO_NAME/milestones -f title='v2 – Tags, Search & Music' \
  -f description='Add enhanced productivity tools: note tagging, filtering, search, and music player integration to aid focus.'

gh api repos/$REPO_OWNER/$REPO_NAME/milestones -f title='v3 – Pencil, Drawing & Sharing' \
  -f description='Focus on creativity and collaboration: integrate Apple Pencil support, allow drawing on canvas, and attaching those sketches to notes.'

echo " Milestones created!"

# === FUNCTION TO GET MILESTONE ID ===
get_milestone_id() {
  gh api repos/$REPO_OWNER/$REPO_NAME/milestones | jq ".[] | select(.title==\"$1\") | .number"
}

# === ASSIGN ISSUES TO MILESTONES ===
declare -A issueMilestones=(
  ["Guest session persistence"]="MVP – Guest Notes & Pomodoro"
  ["Add Pomodoro timer with custom durations"]="MVP – Guest Notes & Pomodoro"
  ["Deploy to production (Vercel + Render)"]="MVP – Guest Notes & Pomodoro"
  ["Track feedback for each feature release"]="MVP – Guest Notes & Pomodoro"

  ["Add optional user authentication with JWT"]="v1 – Optional Login & User Sync"
  ["Implement user-based note isolation"]="v1 – Optional Login & User Sync"

  ["Add note tagging & filtering"]="v2 – Tags, Search & Music"
  ["Implement full-text search for notes"]="v2 – Tags, Search & Music"
  ["Enable pinning/starred notes"]="v2 – Tags, Search & Music"
  ["Integrate music player (Spotify/YouTube embedded)"]="v2 – Tags, Search & Music"
  ["Add export to PDF/Markdown option"]="v2 – Tags, Search & Music"

  ["Support Apple Pencil / stylus drawing canvas"]="v3 – Pencil, Drawing & Sharing"
  ["Save drawings as part of notes"]="v3 – Pencil, Drawing & Sharing"
  ["Enable feature-flag-based rollouts"]="v3 – Pencil, Drawing & Sharing"
)

echo "📎 Assigning issues to milestones..."
for issueTitle in "${!issueMilestones[@]}"; do
  milestoneTitle="${issueMilestones[$issueTitle]}"
  milestoneID=$(get_milestone_id "$milestoneTitle")
  issueNumber=$(gh issue list --search "$issueTitle" --json number,title -q ".[] | select(.title==\"$issueTitle\") | .number")

  if [[ -n "$milestoneID" && -n "$issueNumber" ]]; then
    echo "→ Assigning #$issueNumber: '$issueTitle' to '$milestoneTitle'"
    gh issue edit "$issueNumber" --milestone "$milestoneID"
  else
    echo "⚠️  Could not assign issue: '$issueTitle'"
  fi
done

echo " All issues assigned to milestones!"

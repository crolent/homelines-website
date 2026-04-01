#!/bin/bash

# Initialize git repo if not already done
if [ ! -d ".git" ]; then
  git init
  git remote add origin https://github.com/crolent/homelines-website.git
fi

# Make sure remote is set correctly
git remote set-url origin https://github.com/crolent/homelines-website.git
# To avoid password prompts, replace YOUR_TOKEN below and use this line instead:
# git remote set-url origin https://crolent:YOUR_TOKEN@github.com/crolent/homelines-website.git
# To use SSH instead:
# git remote set-url origin git@github.com:crolent/homelines-website.git

# Stage all changes
git add .

# Commit with timestamp message
git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"

# Push to main branch
git push -u origin main

#!/bin/zsh
set -e

cd "$(dirname "$0")"

if [ ! -d "node_modules" ]; then
  npm install
fi

(sleep 1.5; open "http://localhost:5173/") &
npm run dev

#!/bin/bash
set -e
rm -rf dist/.git
cd dist
git init
git checkout --orphan gh-pages 2>/dev/null
git add -A
git commit -m "deploy"
git push https://github.com/sese-purple/EventWebTicket.git gh-pages --force

#!/usr/bin/env bash

set -e

#rm -rf source.zip
#zip source.zip -r .git src public .gitignore deploy.sh package.json package-lock.json README.md yarn.lock

npm install
npm run build

scp -C -r source.zip build/* apps1@cmlteam.com:~/hack.cmlteam.com/woon-test

echo
echo "Visit https://demo.cmlteam.com/woon-test/index.html#/edit/1"
echo
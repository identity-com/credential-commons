#!/bin/bash
set -e

mkdir -p .hub_tmp
cd .hub_tmp

if [ ! -f "$HUB_ARTIFACT.tgz" ]; then
    wget https://github.com/github/hub/releases/download/v$HUB_ARTIFACT_VERSION/$HUB_ARTIFACT.tgz
fi

tar -xvzf $HUB_ARTIFACT.tgz
sudo ./$HUB_ARTIFACT/install

rm -rf ./$HUB_ARTIFACT
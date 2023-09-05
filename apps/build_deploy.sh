#!/bin/bash

build_command='yarn nx build $1'
eval $build_command
deploy_command='DEBUG=* yarn netlify deploy --auth $NETLIFY_AUTH_TOKEN --dir=dist/apps/$1 --site=sportscast-$1 --prod'
eval $deploy_command

#!/bin/bash

if [ "$NETLIFY" = true ]; then
echo 'process env file'
touch .env
echo VITE_MILLICAST_STREAM_NAME=$STREAM_NAME >> .env
echo VITE_MILLICAST_STREAM_PUBLISHING_TOKEN=$STREAM_PUBLISHING_TOKEN >> .env
echo VITE_MILLICAST_STREAM_ACCOUNT_ID=$STREAM_ACCOUNT_ID >> .env
fi
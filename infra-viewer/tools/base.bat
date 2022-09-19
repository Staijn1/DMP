@REM This is a script to publish to build images and publish them to Docker hub automatically
@echo off

echo "Building base image"

docker build . -t staijn/spotifymanager:nx-base

echo "Uploading base image"
docker push staijn/spotifymanager:nx-base
echo "Done!"
pause

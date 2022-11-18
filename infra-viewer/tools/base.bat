@REM This is a script to publish to build images and publish them to Docker hub automatically
@echo off

echo "Building base image"
cd ../
docker build . -t staijn/infraviewer:nx-base --platform linux/arm64

echo "Uploading base image"
docker push staijn/infraviewer:nx-base
echo "Done!"
pause

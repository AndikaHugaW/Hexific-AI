@echo off
REM Build Hexific Docker images (Windows)

echo Building Hexific Slither Sandbox...
docker build -t hexific-slither:latest -f docker/Dockerfile.slither .

echo Building Hexific API...
docker build -t hexific-api:latest .

echo.
echo Build complete!
echo.
echo To run with Docker Compose:
echo   docker-compose up -d
echo.
echo To enable Docker sandboxing, set in .env:
echo   USE_DOCKER_SLITHER=true

@echo off
echo Installing dependencies...
npm install --production

echo Creating directories...
mkdir public\uploads 2>nul
mkdir public\themes 2>nul

echo Generating theme files...
npm run setup

echo Setting environment variables...
set NODE_ENV=production
set PORT=3001

echo Starting the server...
npm start 
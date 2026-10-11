@echo off
cd /d "%~dp0"
echo Opening TIGRESS at http://localhost:8100
start "" "http://localhost:8100"
py -m http.server 8100
pause

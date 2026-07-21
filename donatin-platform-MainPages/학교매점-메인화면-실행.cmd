@echo off
setlocal EnableExtensions

cd /d "C:\Users\abc20\Desktop\milla-pilot\donatin-platform-MainPages"
if errorlevel 1 (
  echo Failed to open the School Store project folder.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Preparing the School Store app for its first run...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo Package installation failed. Check the network connection and run again.
    pause
    exit /b 1
  )
)

echo.
echo Starting the School Store main page.
echo Press Ctrl+C in this window to stop the server.
echo.
call npm.cmd run dev -- --host 127.0.0.1 --open

endlocal

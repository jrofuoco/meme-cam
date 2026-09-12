@echo off
setlocal
set "PATH=C:\Users\trick\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;%PATH%"
cd /d "%~dp0"
call "C:\Users\trick\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd" desktop
if errorlevel 1 (
  echo.
  echo Meme Cam could not start. Review the error above.
  pause
)
endlocal

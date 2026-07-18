@echo off
python tools\release.py check
if errorlevel 1 (
  echo.
  echo Wydanie zostalo zatrzymane. Popraw bledy pokazane powyzej.
  pause
  exit /b 1
)
echo.
echo Kontrola zakonczona. Wykonaj RELEASE_CHECKLIST.md, a potem uruchom:
echo python tools\release.py package
pause

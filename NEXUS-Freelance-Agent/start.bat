@echo off
chcp 65001 >nul
REM One-click launcher (Windows). First run creates a virtualenv and installs dependencies.
cd /d "%~dp0"

REM Find a real Python 3.10+ ("python" may be the Microsoft Store placeholder that does nothing)
set PY=
py -3 -c "import sys; assert sys.version_info >= (3,10)" >nul 2>&1 && set PY=py -3
if not defined PY python -c "import sys; assert sys.version_info >= (3,10)" >nul 2>&1 && set PY=python
if not defined PY (
  echo.
  echo  Python не найден. Нужен Python 3.10 или новее.
  echo.
  echo  1. Сейчас откроется python.org — скачайте и запустите установщик.
  echo  2. ВАЖНО: на первом экране установщика поставьте галочку "Add python.exe to PATH".
  echo  3. После установки снова дважды кликните start.bat.
  echo.
  start https://www.python.org/downloads/windows/
  pause
  exit /b 1
)

REM A half-created .venv from a failed run would break every later start
if exist .venv if not exist .venv\Scripts\python.exe rmdir /s /q .venv
if not exist .venv (
  echo Первый запуск: устанавливаю библиотеки, это займёт около минуты...
  %PY% -m venv .venv || goto :fail
  .venv\Scripts\python -m pip install -q -r requirements.txt || goto :fail
)
.venv\Scripts\python -m nexus --open
pause
exit /b 0

:fail
echo.
echo  Установка не удалась. Сделайте скриншот этого окна и отправьте его.
if exist .venv rmdir /s /q .venv
pause
exit /b 1

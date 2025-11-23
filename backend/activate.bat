@echo off
REM 1. 切到脚本所在目录（也就是 backend 目录）
cd /d "%~dp0"

REM 2. 激活 venv
call venv\Scripts\activate.bat

REM 3. 启动 uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

REM 4. 关掉服务器后窗口不要立刻消失
pause
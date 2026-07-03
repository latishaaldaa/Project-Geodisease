@echo off
echo ========================================
echo   INSTALASI BACKEND CKG GEODISEASE
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak ditemukan! Silakan install Python terlebih dahulu.
    echo Download dari: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/3] Python terdeteksi...
python --version
echo.

:: Install dependencies
echo [2/3] Menginstall dependencies...
pip install -r requirements.txt
echo.

:: Check installation
if %errorlevel% neq 0 (
    echo [ERROR] Gagal menginstall dependencies!
    pause
    exit /b 1
)

echo [3/3] Instalasi selesai!
echo.
echo ========================================
echo   BACKEND SIAP DIJALANKAN
echo ========================================
echo.
echo Untuk menjalankan server, gunakan:
echo   python app.py
echo.
echo Atau jalankan file: run.bat
echo.
pause

@echo off
title Backend CKG GeoDisease - Instalasi dan Testing
color 0A

echo.
echo ========================================
echo   SETUP BACKEND CKG GEODISEASE
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python tidak ditemukan!
    echo.
    echo Silakan install Python terlebih dahulu:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python terdeteksi
python --version
echo.

:: Install dependencies
echo ========================================
echo   INSTALASI DEPENDENCIES
echo ========================================
echo.
echo Menginstall Flask, SQLAlchemy, CORS...
echo.

pip install -r requirements.txt

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Gagal install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   INISIALISASI DATABASE
echo ========================================
echo.
echo Membuat database dan mengisi data sample...
echo.

python app.py

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Gagal inisialisasi database!
    pause
    exit /b 1
)

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   TESTING API ENDPOINTS
echo ========================================
echo.
echo Menjalankan automated tests...
echo.

python test_api.py

echo.
echo ========================================
echo   SETUP SELESAI!
echo ========================================
echo.
echo Backend CKG siap digunakan!
echo.
echo Untuk menjalankan server:
echo   run.bat
echo.
echo Atau manual:
echo   python app.py
echo.
echo Server akan berjalan di:
echo   http://127.0.0.1:5000
echo.
echo ========================================
echo.
pause

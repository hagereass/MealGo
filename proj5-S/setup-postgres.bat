@echo off
set PG_BIN=C:\Program Files\PostgreSQL\16\bin
set DB_HOST=127.0.0.1
set DB_USER=postgres
set PGPASSWORD=1234

echo Attempting to reset postgres user password...
echo.

echo Trying to create database mealgo_db...
"%PG_BIN%\createdb.exe" -U %DB_USER% -h %DB_HOST% -e mealgo_db 2>&1

if %ERRORLEVEL% neq 0 (
    echo.
    echo Failed to create database. You may need to reset the postgres password manually.
)

pause

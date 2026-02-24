@echo off
REM Build script for ChuloBots CLI (Windows)

echo Building ChuloBots CLI...

REM Check if Rust is installed
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Rust is not installed.
    echo Please install Rust from https://rustup.rs/
    exit /b 1
)

REM Clean previous builds
echo Cleaning previous builds...
cargo clean

REM Build in release mode
echo Building release binary...
cargo build --release

REM Check if build succeeded
if exist target\release\chulobots.exe (
    echo Build successful!
    echo Binary location: target\release\chulobots.exe
    echo.
    echo Run with: target\release\chulobots.exe
) else (
    echo Error: Build completed but binary not found
    exit /b 1
)

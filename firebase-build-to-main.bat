@echo off
REM Get date and time components
set YEAR=%date:~6,4%
set MONTH=%date:~3,2%
set DAY=%date:~0,2%
set HOUR=%time:~0,2%
set MINUTE=%time:~3,2%

REM Remove leading space from hour if less than 10
if "%HOUR:~0,1%"==" " set HOUR=0%HOUR:~1,1%

REM Create a timestamp
set TIMESTAMP=%YEAR%%MONTH%%DAY%%HOUR%%MINUTE%

REM Remove / and \ characters from the timestamp
set TIMESTAMP=%TIMESTAMP:/=%
set TIMESTAMP=%TIMESTAMP:\=%

REM Create a zip backup of the compote-firebase directory
"D:\Software Installation\7-Zip\7z.exe" a -tzip "..\compote-firebase\main-app\%TIMESTAMP%_public_backup.zip" "..\compote-firebase\main-app\public\*"

REM Copy and replace contents in compote-firebase directory
xcopy /s /e /y dist\* "..\compote-firebase\main-app\public\"

REM Copy README.md to the firebase directory
copy /y README.md "..\compote-firebase\main-app\public\"

REM Navigate to compote-firebase directory
cd /d "..\compote-firebase\main-app\public\"

REM Deploy to Firebase
firebase deploy --only hosting

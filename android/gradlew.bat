@echo off
setlocal
set GRADLE_HOME=%USERPROFILE%\.gradle\wrapper\dists\gradle-8.5-bin\

if not exist "%GRADLE_HOME%gradle-8.5\bin\gradle.bat" (
    echo Downloading Gradle...
    powershell -Command "Invoke-WebRequest -Uri 'https://services.gradle.org/distributions/gradle-8.5-bin.zip' -OutFile 'gradle-8.5-bin.zip'; Expand-Archive -Path 'gradle-8.5-bin.zip' -DestinationPath '%USERPROFILE%\.gradle\wrapper\dists\gradle-8.5-bin\' -Force"
)

call "%GRADLE_HOME%gradle-8.5\bin\gradle.bat" %*
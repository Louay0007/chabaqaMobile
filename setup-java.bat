@echo off
echo Looking for Java in Android Studio...

REM Check common Android Studio locations
if exist "C:\Program Files\Android\Android Studio\jbr" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
    echo Found Java at: %JAVA_HOME%
    goto :found
)

if exist "%LOCALAPPDATA%\Android\Sdk\jdk" (
    set "JAVA_HOME=%LOCALAPPDATA%\Android\Sdk\jdk"
    echo Found Java at: %JAVA_HOME%
    goto :found
)

if exist "C:\Program Files\Android\Android Studio\jre" (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jre"
    echo Found Java at: %JAVA_HOME%
    goto :found
)

echo Java not found automatically.
echo Please open Android Studio and check: File -^> Settings -^> Build, Execution, Deployment -^> Build Tools -^> Gradle
echo Look for "Gradle JDK" location
pause
exit /b 1

:found
echo.
echo Setting JAVA_HOME for this session...
set PATH=%JAVA_HOME%\bin;%PATH%

echo.
echo Testing Java...
java -version

echo.
echo JAVA_HOME is now set to: %JAVA_HOME%
echo.
echo You can now run: gradlew assembleRelease
echo.
pause

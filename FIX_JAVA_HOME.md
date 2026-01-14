# Fix JAVA_HOME Error - Quick Guide

## The Problem

Gradle needs Java to build Android apps, but can't find it.

---

## Quick Fix (This Session Only)

### Option 1: Use the Script

```bash
# Run this in ChabaqaFinale-Mobile folder
setup-java.bat
```

This will find Java and set it for your current terminal session.

### Option 2: Manual (If Script Doesn't Work)

1. **Find Java in Android Studio:**
   - Open Android Studio
   - Go to: File → Settings → Build, Execution, Deployment → Build Tools → Gradle
   - Look for "Gradle JDK" - copy that path
   - Example: `C:\Program Files\Android\Android Studio\jbr`

2. **Set JAVA_HOME in your terminal:**
   ```cmd
   set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
   set PATH=%JAVA_HOME%\bin;%PATH%
   ```

3. **Test it:**
   ```cmd
   java -version
   ```

4. **Now build:**
   ```cmd
   cd android
   .\gradlew assembleRelease
   ```

---

## Permanent Fix (Recommended)

Set JAVA_HOME permanently so you don't have to do this every time:

### Method 1: Via System Settings (GUI)

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab
3. Click "Environment Variables"
4. Under "User variables", click "New"
5. Variable name: `JAVA_HOME`
6. Variable value: `C:\Program Files\Android\Android Studio\jbr`
   (or your actual Java path from Android Studio)
7. Click OK
8. Find "Path" in User variables, click "Edit"
9. Click "New"
10. Add: `%JAVA_HOME%\bin`
11. Click OK on all windows
12. **Restart your terminal**

### Method 2: Via PowerShell (Quick)

Run PowerShell as Administrator:

```powershell
# Set JAVA_HOME permanently
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;%JAVA_HOME%\bin", "User")

# Verify
echo $env:JAVA_HOME
```

**Important:** Replace `C:\Program Files\Android\Android Studio\jbr` with your actual Java path!

---

## How to Find Your Java Path

### Option A: Check Android Studio

1. Open Android Studio
2. File → Settings (or Ctrl+Alt+S)
3. Build, Execution, Deployment → Build Tools → Gradle
4. Look at "Gradle JDK" dropdown
5. The path shown there is your JAVA_HOME

### Option B: Search Your Computer

Common locations:
- `C:\Program Files\Android\Android Studio\jbr`
- `C:\Program Files\Android\Android Studio\jre`
- `C:\Users\Louay\AppData\Local\Android\Sdk\jdk`
- `C:\Program Files\Java\jdk-17`

Look for a folder with `bin\java.exe` inside.

---

## After Setting JAVA_HOME

1. **Close and reopen your terminal** (important!)
2. **Verify it works:**
   ```cmd
   echo %JAVA_HOME%
   java -version
   ```
3. **Build your app:**
   ```cmd
   cd C:\Users\Louay\Desktop\Projects\startup\ChabaqaFinale-Mobile\android
   .\gradlew assembleRelease
   ```

---

## Troubleshooting

### "java -version" still doesn't work

**Fix:**
- Make sure you closed and reopened your terminal
- Check that `%JAVA_HOME%\bin` is in your PATH
- Verify the path exists: `dir "%JAVA_HOME%"`

### Can't find Java anywhere

**Fix:**
1. Open Android Studio
2. Go to File → Project Structure → SDK Location
3. Look at "JDK location"
4. If empty, click "Download JDK" and install
5. Use that path as JAVA_HOME

### Still getting JAVA_HOME error

**Alternative: Use Android Studio's Terminal**
1. Open Android Studio
2. Open your project: ChabaqaFinale-Mobile
3. Use the built-in Terminal (bottom of screen)
4. Run: `cd android && .\gradlew assembleRelease`

Android Studio's terminal has JAVA_HOME pre-configured!

---

## Quick Build Script

After fixing JAVA_HOME, create this file: `build-apk.bat`

```batch
@echo off
echo Building Android APK...
cd android
call gradlew assembleRelease
cd ..
echo.
echo APK location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
pause
```

Then just double-click `build-apk.bat` to build!

---

## Summary

**Quick fix (temporary):**
```cmd
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
cd android
.\gradlew assembleRelease
```

**Permanent fix:**
1. Find Java path in Android Studio settings
2. Set JAVA_HOME environment variable (System Settings)
3. Add `%JAVA_HOME%\bin` to PATH
4. Restart terminal
5. Build!

**Easiest way:**
Use Android Studio's built-in terminal - JAVA_HOME already set!

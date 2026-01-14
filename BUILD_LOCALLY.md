# Build Android APK Locally - Quick Guide

## Prerequisites ✅

You already have:
- ✅ Android Studio installed
- ✅ ADB installed
- ✅ Node.js installed

---

## Quick Build (5 Minutes)

### Step 1: Install Dependencies

```bash
cd C:\Users\Louay\Desktop\Projects\startup\ChabaqaFinale-Mobile

# Install npm packages
npm install
```

### Step 2: Generate Android Project

```bash
# This creates the android/ folder with native code
npx expo prebuild --platform android --clean
```

### Step 3: Build APK

```bash
# Navigate to android folder
cd android

# Build release APK (Windows)
.\gradlew assembleRelease
```

**Build time:** ~5-10 minutes (first build is slower)

### Step 4: Find Your APK

The APK will be at:
```
android\app\build\outputs\apk\release\app-release.apk
```

### Step 5: Install on Phone

**Option A: Via USB**
```bash
# Connect phone via USB
# Enable USB debugging on phone
adb install android\app\build\outputs\apk\release\app-release.apk
```

**Option B: Transfer File**
- Copy `app-release.apk` to your phone
- Open it on phone to install

---

## Detailed Steps

### 1. Setup Environment Variables

Make sure your `.env` file exists with correct values:

```bash
# Check if .env exists
type .env
```

Should contain:
```
EXPO_PUBLIC_API_URL=http://51.254.132.77:3000
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
```

### 2. Install Dependencies

```bash
npm install
```

This installs all packages from `package.json`.

### 3. Run Expo Prebuild

```bash
npx expo prebuild --platform android --clean
```

**What this does:**
- Generates native Android project in `android/` folder
- Configures app with your `app.json` settings
- Sets up bundle ID: `com.mariembenali.chabaqa`
- Injects environment variables

**Output:** You'll see `android/` folder created

### 4. Build the APK

```bash
cd android
.\gradlew assembleRelease
```

**What this does:**
- Compiles your React Native code
- Bundles JavaScript
- Creates unsigned APK
- Takes 5-10 minutes

**Watch for:**
- `BUILD SUCCESSFUL` message
- APK location printed at end

### 5. Locate the APK

```bash
# From android folder
dir app\build\outputs\apk\release\
```

You should see: `app-release.apk`

Full path:
```
C:\Users\Louay\Desktop\Projects\startup\ChabaqaFinale-Mobile\android\app\build\outputs\apk\release\app-release.apk
```

### 6. Install on Android Device

#### Method A: USB + ADB (Fastest)

1. **Enable USB Debugging on phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times (enables Developer Options)
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect phone to computer via USB**

3. **Verify connection:**
   ```bash
   adb devices
   ```
   Should show your device

4. **Install APK:**
   ```bash
   # From project root
   adb install android\app\build\outputs\apk\release\app-release.apk
   ```

5. **Launch app:**
   - Find "Chabaqa" app on phone
   - Open it!

#### Method B: File Transfer

1. Copy `app-release.apk` to your phone (via USB, email, cloud)
2. On phone, open the APK file
3. Allow "Install from unknown sources" if prompted
4. Install and open

---

## Troubleshooting

### Error: "ANDROID_HOME not set"

**Fix:**
1. Open Android Studio
2. Go to File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Copy the "Android SDK Location" path
4. Set environment variable:

```powershell
# PowerShell (as Administrator)
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\Louay\AppData\Local\Android\Sdk", "User")
```

5. Restart terminal

### Error: "gradlew: command not found"

**Fix:**
```bash
# Make sure you're in the android folder
cd android

# On Windows, use .\gradlew (with backslash)
.\gradlew assembleRelease
```

### Error: "SDK location not found"

**Fix:**
```bash
# Create local.properties file in android folder
cd android
echo sdk.dir=C:\Users\Louay\AppData\Local\Android\Sdk > local.properties
```

Replace path with your actual Android SDK location.

### Build fails with "Out of memory"

**Fix:**
```bash
# In android folder, edit gradle.properties
# Add this line:
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### APK installs but app crashes

**Check:**
1. Backend is running: http://51.254.132.77:3000
2. `.env` file has correct values
3. Phone has internet connection

**View logs:**
```bash
adb logcat | findstr "ReactNative"
```

---

## Development Workflow

### For Testing (Faster)

Instead of building APK every time, use Expo Go:

```bash
# Start development server
npx expo start

# Scan QR code with Expo Go app
```

### For Production APK

```bash
# Clean previous build
cd android
.\gradlew clean

# Build fresh APK
.\gradlew assembleRelease

# Install on phone
cd ..
adb install android\app\build\outputs\apk\release\app-release.apk
```

---

## Build Commands Reference

### Clean Build
```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

### Debug Build (Faster)
```bash
cd android
.\gradlew assembleDebug
# APK at: app\build\outputs\apk\debug\app-debug.apk
```

### Release Build (Production)
```bash
cd android
.\gradlew assembleRelease
# APK at: app\build\outputs\apk\release\app-release.apk
```

### Build AAB (for Play Store)
```bash
cd android
.\gradlew bundleRelease
# AAB at: app\build\outputs\bundle\release\app-release.aab
```

---

## Comparison: Local vs GitHub Actions

| Aspect | Local Build | GitHub Actions |
|--------|-------------|----------------|
| **Speed** | 5-10 min | 10-15 min |
| **Setup** | Android Studio needed | No setup needed |
| **Internet** | Not required | Required |
| **Control** | Full control | Limited |
| **Debugging** | Easy | Harder |
| **Best for** | Development | CI/CD |

**Recommendation:** Use local builds for development, GitHub Actions for releases.

---

## Quick Commands Cheat Sheet

```bash
# Full build from scratch
npm install
npx expo prebuild --platform android --clean
cd android
.\gradlew assembleRelease
cd ..

# Install on phone
adb install android\app\build\outputs\apk\release\app-release.apk

# View logs
adb logcat | findstr "ReactNative"

# Uninstall from phone
adb uninstall com.mariembenali.chabaqa

# List connected devices
adb devices
```

---

## Next Steps

1. ✅ Build APK locally (faster than GitHub Actions)
2. ✅ Install on phone via ADB
3. ✅ Test the app
4. 🔄 Make changes → Rebuild → Test
5. 🚀 When ready, use GitHub Actions for final release

---

## Pro Tips

1. **First build is slow** (~10 min), subsequent builds are faster (~3-5 min)
2. **Use debug builds** for testing (faster to build)
3. **Use release builds** for distribution (smaller, optimized)
4. **Keep Android Studio open** - helps with SDK management
5. **Use `gradlew clean`** if build acts weird
6. **Check `adb devices`** before installing to verify phone connection

---

## Summary

**Fastest way to build and test:**

```bash
# One-time setup
npm install
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew assembleRelease

# Install on phone
cd ..
adb install android\app\build\outputs\apk\release\app-release.apk
```

**Total time:** 5-10 minutes

Much faster than waiting for GitHub Actions! 🚀

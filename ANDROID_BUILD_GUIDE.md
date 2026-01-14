# Android APK Build Guide - Quick Start

## ✅ What You Get

- **FREE** - No account or payment required
- **Unsigned APK** - Works perfectly for testing and distribution
- **Standalone app** - Install on any Android device
- **~10-15 minutes** - Build time in Codemagic

---

## 📋 Prerequisites

1. GitHub account (you have this)
2. Codemagic account (free tier is enough)
3. Android device to test on

---

## 🚀 Step-by-Step Setup

### Step 1: Push Code to GitHub

```bash
cd C:\Users\Louay\Desktop\Projects\startup\ChabaqaFinale-Mobile

# Add all files
git add .

# Commit changes
git commit -m "Add Codemagic Android build configuration"

# Push to GitHub
git push origin main
```

### Step 2: Connect Codemagic to GitHub

1. Go to https://codemagic.io/
2. Sign up/Login with GitHub
3. Click "Add application"
4. Select your repository: `Louay0007/chabaqa-mobile`
5. Click "Finish: Add application"

### Step 3: Configure Environment Variables

**You have 2 options:**

#### Option A: Use Simple Config (Fastest - No Dashboard Setup)

1. Rename the config files:
   ```bash
   cd ChabaqaFinale-Mobile
   
   # Backup original
   copy codemagic.yaml codemagic-with-groups.yaml
   
   # Use simple version
   copy codemagic-simple.yaml codemagic.yaml
   
   # Commit and push
   git add codemagic.yaml
   git commit -m "Use simple Codemagic config"
   git push origin main
   ```

2. **That's it!** All environment variables are inline in the YAML. No dashboard setup needed.

3. Skip to Step 4 (Start Build)

#### Option B: Use Groups (More Secure - Recommended for Production)

1. In Codemagic, click on your app
2. Go to "Environment variables" tab
3. Click "Add variable group"
4. Name it: `chabaqa_env_vars`
5. Add these 4 variables:

| Variable Name | Value | Secret |
|--------------|-------|--------|
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | ❌ No |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | ❌ No |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | ❌ No |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | ❌ No |

6. Click "Save"
7. Push your code to GitHub (use the original `codemagic.yaml`)

**Why use groups?**
- More secure (secrets not in YAML file)
- Easier to update (change in dashboard, not code)
- Better for teams (different values per environment)

### Step 4: Start Build

1. In Codemagic dashboard, click "Check for configuration file"
2. It will detect `codemagic.yaml`
3. Select workflow: `android-production`
4. Click "Start new build"
5. Wait ~10-15 minutes

### Step 5: Download APK

1. When build completes, go to "Artifacts" tab
2. Download the `.apk` file
3. Transfer to your Android phone (via USB, email, or cloud)

### Step 6: Install on Android

1. On Android phone, go to Settings → Security
2. Enable "Install from unknown sources" or "Install unknown apps"
3. Open the APK file
4. Click "Install"
5. Open Chabaqa app and test!

---

## 🎯 What the Build Does

The optimized `codemagic.yaml` now:

1. ✅ **Installs dependencies** - `npm ci` for clean install
2. ✅ **Creates .env file** - Injects environment variables from Codemagic
3. ✅ **Runs Expo prebuild** - Generates native Android project
4. ✅ **Configures Android SDK** - Sets up local.properties
5. ✅ **Builds APK** - Creates unsigned release APK
6. ✅ **Verifies APK** - Checks that APK was created successfully
7. ✅ **Emails you** - Sends APK download link to louay_rjili@ieee.org

---

## 🔧 Build Configuration

### Automatic Triggers
- Builds automatically on push to `main` branch
- You can also trigger manually in Codemagic dashboard

### Build Environment
- **Instance**: Linux x2 (fast, free tier)
- **Node**: 20
- **Java**: 17
- **Max duration**: 120 minutes (usually takes 10-15)

### Artifacts Saved
- Release APK (the one you want!)
- AAB bundle (for Play Store, if needed later)
- ProGuard mapping (for debugging)

---

## 📱 Testing the APK

### On Physical Device
1. Transfer APK to phone
2. Enable "Install from unknown sources"
3. Install and test

### On Android Emulator (if you have Android Studio)
```bash
# Install on emulator
adb install path/to/app-release.apk

# Or drag and drop APK onto emulator
```

---

## 🐛 Troubleshooting

### Build fails at "Install dependencies"
- Check that `package.json` is in the repo
- Make sure you pushed all files to GitHub

### Build fails at "Create .env file"
- Verify you created `chabaqa_env_vars` group in Codemagic
- Check that all 4 Google OAuth variables are added
- Variable names must match exactly (case-sensitive)

### Build fails at "Run Expo prebuild"
- Check `app.json` is valid JSON
- Verify bundle ID: `com.mariembenali.chabaqa`

### Build fails at "Build unsigned APK"
- Check build logs for Gradle errors
- Usually means a dependency issue

### APK won't install on phone
- Enable "Install from unknown sources" in Android settings
- Make sure APK file isn't corrupted (re-download)
- Try different file transfer method

### App crashes on launch
- Check that backend is running: http://51.254.132.77:3000
- Verify Google OAuth credentials are correct
- Check app logs with `adb logcat` if you have Android Studio

---

## 🎉 Success Checklist

- ✅ Code pushed to GitHub
- ✅ Codemagic connected to repo
- ✅ Environment variable group created
- ✅ Build completed successfully
- ✅ APK downloaded
- ✅ APK installed on Android phone
- ✅ App opens and works

---

## 📊 Build Status

You can monitor builds at:
- Codemagic dashboard: https://codemagic.io/apps
- Email notifications: louay_rjili@ieee.org
- Build logs: Available in Codemagic for 30 days

---

## 🔄 Updating the App

When you make changes:

1. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Codemagic will automatically build new APK

3. Download new APK and install (will update existing app)

---

## 💡 Pro Tips

1. **Version numbering**: Update `version` in `app.json` for each release
2. **Testing**: Test on multiple Android versions if possible
3. **Distribution**: Share APK via Google Drive, Dropbox, or direct download
4. **Signed APK**: For Play Store, you'll need to add keystore (see CODEMAGIC_SETUP.md)
5. **Build time**: First build takes longer (~15 min), subsequent builds are faster (~10 min)

---

## 🚀 Next Steps

### For Testing
- ✅ Build and install APK
- ✅ Test all features
- ✅ Get feedback from users

### For Production
- 📝 Create Google Play Developer account ($25 one-time)
- 🔐 Generate Android keystore for signed APK
- 📦 Build AAB (Android App Bundle) for Play Store
- 🚀 Publish to Google Play Store

---

## 📞 Need Help?

- **Codemagic docs**: https://docs.codemagic.io/
- **Expo docs**: https://docs.expo.dev/
- **Build logs**: Check Codemagic dashboard for detailed error messages
- **Test locally**: Run `npx expo run:android` to test build process locally

---

## ✨ What's Different from iOS?

| Feature | Android | iOS |
|---------|---------|-----|
| **Cost** | FREE | $99/year |
| **Account** | None needed | Apple Developer required |
| **Build time** | 10-15 min | 15-20 min |
| **Signing** | Optional | Required |
| **Distribution** | Easy (APK) | Hard (IPA needs signing) |
| **Testing** | Install APK directly | Needs TestFlight or Xcode |

Android is much easier for testing and distribution!

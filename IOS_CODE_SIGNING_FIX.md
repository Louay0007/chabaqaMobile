# iOS Code Signing Fix Guide

## The Problem

The error "Set up code signing settings on Xcode project" happens because **iOS apps require Apple Developer credentials** to build IPA files.

## ⚠️ CRITICAL REQUIREMENT

**You MUST have an Apple Developer account ($99/year) to build iOS IPA files.**

There is NO free way to build IPA files. Period.

---

## Solution Options

### Option 1: Get Apple Developer Account (Required for IPA)

**Steps:**

1. **Sign up for Apple Developer Program:**
   - Go to: https://developer.apple.com/programs/
   - Cost: $99/year
   - Wait 24-48 hours for approval

2. **Generate Certificates in Apple Developer Portal:**
   - Log in to https://developer.apple.com/account
   - Go to "Certificates, Identifiers & Profiles"
   - Create:
     - iOS Distribution Certificate
     - App ID: `com.mariembenali.chabaqa`
     - Provisioning Profile (Ad Hoc or App Store)

3. **Add Certificates to Codemagic:**
   - In Codemagic dashboard, go to "Code signing identities"
   - Click "iOS code signing"
   - Upload:
     - Certificate (.p12 file)
     - Provisioning profile (.mobileprovision file)
   - Or use automatic code signing with App Store Connect API key

4. **Configure App Store Connect API (Recommended):**
   - In App Store Connect, create API key
   - Download the `.p8` key file
   - In Codemagic, add to `app_store_credentials` group:
     ```
     APP_STORE_CONNECT_KEY_IDENTIFIER: Your key ID
     APP_STORE_CONNECT_ISSUER_ID: Your issuer ID
     APP_STORE_CONNECT_PRIVATE_KEY: Base64 encoded .p8 file
     ```

5. **Rebuild in Codemagic:**
   - The code signing step will now work
   - You'll get an IPA file

---

### Option 2: Build Android APK Instead (FREE)

**This is the recommended option if you don't have Apple Developer account.**

**Steps:**

1. **Focus on Android workflow:**
   - Your `codemagic.yaml` already has Android configured
   - No account or certificates needed
   - Builds unsigned APK (works fine for testing)

2. **Start Android build in Codemagic:**
   - Select `react-native-android` workflow
   - Create `chabaqa_env_vars` group (see CODEMAGIC_SETUP.md)
   - Click "Start new build"

3. **Download and install APK:**
   - Wait ~10-15 minutes for build
   - Download APK from artifacts
   - Transfer to Android phone
   - Enable "Install from unknown sources"
   - Install and test

**Android APK works exactly like iOS IPA, just for Android devices.**

---

### Option 3: Use Expo Go for Testing (FREE)

**This is NOT a standalone app, but works for testing.**

**Steps:**

1. **Install Expo Go on iPhone:**
   - Download from App Store (free)

2. **Run development server locally:**
   ```bash
   cd ChabaqaFinale-Mobile
   npx expo start
   ```

3. **Scan QR code with iPhone camera:**
   - Opens in Expo Go app
   - Full functionality for testing

**Limitations:**
- Requires Expo Go app installed
- Not a standalone app
- Can't distribute to others easily
- Requires your dev server running

---

### Option 4: TestFlight (Requires Apple Developer Account)

**If you get Apple Developer account, use TestFlight for distribution:**

1. Build IPA with Codemagic (after setting up code signing)
2. Upload to App Store Connect
3. Add testers via TestFlight
4. They can install via TestFlight app (no need to sideload)

**Benefits:**
- Easy distribution to testers
- No need for device UDIDs
- Up to 10,000 testers
- Automatic updates

---

## Recommended Path Forward

### If you DON'T have $99 for Apple Developer:

1. ✅ **Build Android APK** (free, works immediately)
2. ✅ **Use Expo Go** for iOS testing (free, requires Expo Go app)
3. ⏸️ Get Apple Developer account later when ready to publish

### If you HAVE Apple Developer account:

1. ✅ Sign up for Apple Developer Program ($99/year)
2. ✅ Generate certificates and provisioning profiles
3. ✅ Add to Codemagic dashboard
4. ✅ Build iOS IPA
5. ✅ Distribute via TestFlight or direct install

---

## Quick Commands

### Build Android APK (FREE):
```bash
# In Codemagic, select: react-native-android workflow
# No certificates needed
# Download APK from artifacts
```

### Test with Expo Go (FREE):
```bash
cd ChabaqaFinale-Mobile
npx expo start
# Scan QR code with iPhone
```

### Build iOS IPA (Requires Apple Developer):
```bash
# In Codemagic, select: react-native-ios workflow
# Must have code signing set up first
# Download IPA from artifacts
```

---

## Why iOS is Different

**Android:**
- Open ecosystem
- Can install unsigned APKs
- No account required for testing
- Free to develop and test

**iOS:**
- Closed ecosystem
- All apps must be signed
- Requires Apple Developer account
- $99/year mandatory for IPA files

This is Apple's policy, not a limitation of Codemagic or Expo.

---

## Next Steps

**Choose your path:**

1. **Want to test on iPhone NOW (free)?**
   → Use Expo Go (Option 3)

2. **Want standalone app on Android (free)?**
   → Build Android APK (Option 2)

3. **Want standalone app on iPhone?**
   → Get Apple Developer account (Option 1)

4. **Want both iOS and Android?**
   → Get Apple Developer account + build both

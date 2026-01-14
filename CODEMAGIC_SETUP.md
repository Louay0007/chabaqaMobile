# Codemagic Setup Guide

## Environment Variable Groups

Your `codemagic.yaml` references these environment variable groups:

### 1. `chabaqa_env_vars` (Required for both iOS and Android)
This group contains your app's environment variables.

**In Codemagic Dashboard:**
1. Go to your app settings
2. Navigate to "Environment variables" tab
3. Click "Add variable group" or create group named `chabaqa_env_vars`
4. Add these variables:

| Variable Name | Value | Secret |
|--------------|-------|--------|
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | No |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | No |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | No |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` | No |

**Note:** `EXPO_PUBLIC_API_URL` is already defined in the `vars` section of codemagic.yaml, so you don't need to add it to the group.

### 2. `app_store_credentials` (Required for iOS only)

**⚠️ BLOCKER: You MUST have an Apple Developer account ($99/year) to build iOS IPA files.**

**Without Apple Developer account:**
- iOS builds will FAIL at "Set up code signing settings" step
- There is NO free alternative for IPA files
- Use Android APK or Expo Go instead (see IOS_CODE_SIGNING_FIX.md)

**If you have Apple Developer account:**

**Method A: Automatic Code Signing (Recommended)**
1. In App Store Connect, create API key
2. Download the `.p8` private key file
3. In Codemagic, create group `app_store_credentials` with:

| Variable Name | Value | Secret |
|--------------|-------|--------|
| `APP_STORE_CONNECT_KEY_IDENTIFIER` | Your Key ID from App Store Connect | Yes |
| `APP_STORE_CONNECT_ISSUER_ID` | Your Issuer ID from App Store Connect | Yes |
| `APP_STORE_CONNECT_PRIVATE_KEY` | Base64 encoded .p8 file content | Yes |

**Method B: Manual Code Signing**
1. In Codemagic Dashboard, go to "Code signing identities"
2. Upload iOS Distribution Certificate (.p12)
3. Upload Provisioning Profile (.mobileprovision)
4. Codemagic will handle the rest

**To base64 encode the .p8 file:**
```bash
# Mac/Linux:
base64 -i AuthKey_XXXXXXXXXX.p8

# Windows PowerShell:
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AuthKey_XXXXXXXXXX.p8"))
```

### 3. `keystore_credentials` (Optional for Android)
Only needed if you want a signed APK. For testing, unsigned APK works fine.

**For unsigned APK (recommended for testing):**
- You can skip this group
- The build will create an unsigned APK you can install

**For signed APK:**
1. Generate Android keystore locally
2. Base64 encode it: `base64 -i your-keystore.jks`
3. In Codemagic, create group `keystore_credentials` with:
   - `CM_KEYSTORE` (base64 encoded keystore)
   - `CM_KEYSTORE_PASSWORD`
   - `CM_KEY_ALIAS`
   - `CM_KEY_PASSWORD`

---

## Quick Start (Android APK - FREE)

1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add Codemagic configuration"
   git push origin main
   ```

2. **In Codemagic Dashboard:**
   - Connect your GitHub repo
   - Click "Check for configuration file"
   - Create environment variable group `chabaqa_env_vars` (see above)
   - Start build for `react-native-android` workflow

3. **Download APK:**
   - Wait for build to complete (~10-15 minutes)
   - Download APK from artifacts
   - Install on Android device

---

## iOS Build (Requires Apple Developer Account)

**Reality Check:**
- iOS builds require Apple Developer account ($99/year)
- No free alternatives exist for IPA files
- You can use Expo Go for free testing, but it's not a standalone app

**If you have Apple Developer account:**
1. Set up code signing in Codemagic
2. Create `app_store_credentials` group
3. Build `react-native-ios` workflow
4. Download IPA from artifacts

**Alternative (Free):**
- Use Expo Go app on iPhone
- Run `npx expo start` locally
- Scan QR code with Expo Go
- This is for testing only, not a standalone app

---

## Troubleshooting

### Build fails with "group not found"
- Make sure you created the environment variable groups in Codemagic dashboard
- Group names must match exactly: `chabaqa_env_vars`, `app_store_credentials`, `keystore_credentials`

### Android build succeeds but APK won't install
- Enable "Install from unknown sources" on Android device
- Unsigned APKs are fine for testing

### iOS build fails
- Check if you have Apple Developer account
- Verify code signing credentials are correct
- iOS builds require valid provisioning profile

---

## Next Steps

1. ✅ Push this code to GitHub
2. ✅ Connect repo to Codemagic
3. ✅ Create `chabaqa_env_vars` group in Codemagic
4. ✅ Start Android build (free, no account needed)
5. ⏸️ iOS build (requires Apple Developer account)

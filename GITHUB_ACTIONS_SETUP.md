# GitHub Actions Setup - FREE Android APK Builds

## Why GitHub Actions?

- ✅ **Completely FREE** - 2,000 minutes/month for public repos, 500 for private
- ✅ **No credit card** required
- ✅ **Already integrated** with your GitHub repo
- ✅ **Easy to use** - Just push code and it builds automatically
- ✅ **Download APK** directly from GitHub

---

## Quick Setup (5 Minutes)

### Step 1: Add Secrets to GitHub

1. Go to your GitHub repo: `https://github.com/Louay0007/chabaqa-mobile`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets one by one:

| Secret Name | Value |
|------------|-------|
| `EXPO_PUBLIC_API_URL` | `http://51.254.132.77:3000` |
| `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com` |
| `EXPO_TOKEN` | (Optional - get from `npx expo login` then `npx expo whoami --token`) |

**Note:** `EXPO_TOKEN` is optional. If you skip it, the build will still work but might show a warning.

### Step 2: Push the Workflow File

```bash
cd ChabaqaFinale-Mobile

# Add the workflow file
git add .github/workflows/android-build.yml

# Commit
git commit -m "Add GitHub Actions workflow for Android builds"

# Push to GitHub
git push origin main
```

### Step 3: Watch the Build

1. Go to your repo on GitHub
2. Click **Actions** tab
3. You'll see "Build Android APK" running
4. Wait ~10-15 minutes for build to complete

### Step 4: Download APK

1. When build completes, click on the workflow run
2. Scroll down to **Artifacts** section
3. Download `chabaqa-android-apk.zip`
4. Extract the ZIP to get your APK file
5. Install on Android phone!

---

## How to Trigger Builds

### Automatic (Recommended)
- Just push code to `main` branch
- GitHub Actions will build automatically

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual
1. Go to GitHub repo → **Actions** tab
2. Click "Build Android APK" workflow
3. Click **Run workflow** button
4. Select branch (main)
5. Click **Run workflow**

---

## Build Status

You can see build status:
- On GitHub Actions tab
- In your commit (green checkmark or red X)
- Via email notifications (if enabled)

---

## Cost Breakdown

### Public Repository (Recommended)
- ✅ **FREE** - Unlimited minutes
- ✅ No credit card needed
- ✅ Best option

### Private Repository
- ✅ **500 minutes/month FREE**
- ✅ Each build takes ~10-15 minutes
- ✅ ~30-50 builds per month free
- ✅ More than enough for testing

**Your repo is currently private, so you get 500 free minutes/month.**

---

## Comparison with Other Services

| Service | Free Tier | Setup Time | Ease of Use |
|---------|-----------|------------|-------------|
| **GitHub Actions** | 2000 min (public) / 500 min (private) | 5 min | ⭐⭐⭐⭐⭐ |
| Codemagic | 500 macOS min | 15 min | ⭐⭐⭐⭐ |
| EAS Build | Limited builds | 10 min | ⭐⭐⭐⭐ |
| Bitrise | 200 min | 20 min | ⭐⭐⭐ |
| AppCenter | Deprecated | - | ❌ |

**Winner: GitHub Actions** - Best free tier, easiest setup, already integrated.

---

## Troubleshooting

### Build fails at "Setup Expo"
- Add `EXPO_TOKEN` secret (optional but recommended)
- Get token: `npx expo login` then `npx expo whoami --token`

### Build fails at "Run Expo prebuild"
- Check `app.json` is valid
- Verify bundle ID: `com.mariembenali.chabaqa`

### Build fails at "Build Android APK"
- Check Gradle errors in logs
- Usually means dependency issue

### Can't find APK after build
- Go to Actions → Click on workflow run
- Scroll to bottom → Artifacts section
- Download `chabaqa-android-apk.zip`

### Build takes too long
- Normal: 10-15 minutes
- First build is slower (downloads dependencies)
- Subsequent builds are faster (cached)

---

## Advanced: Speed Up Builds

Add caching to make builds faster:

```yaml
- name: Cache Gradle
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

This is already optimized in the workflow file!

---

## Making Your Repo Public (Optional)

If you want unlimited free builds:

1. Go to repo Settings
2. Scroll to bottom → **Danger Zone**
3. Click **Change visibility**
4. Select **Public**
5. Confirm

**Benefits:**
- Unlimited GitHub Actions minutes
- Free forever
- No credit card needed

**Considerations:**
- Your code will be visible to everyone
- Secrets are still hidden
- Good for open source projects

---

## Next Steps

1. ✅ Add secrets to GitHub (Step 1)
2. ✅ Push workflow file (Step 2)
3. ✅ Watch build complete (Step 3)
4. ✅ Download and install APK (Step 4)
5. 🎉 Test your app!

---

## Getting Expo Token (Optional)

If you want to add `EXPO_TOKEN`:

```bash
# Login to Expo
npx expo login

# Get your token
npx expo whoami --token
```

Copy the token and add it as a GitHub secret named `EXPO_TOKEN`.

---

## Summary

GitHub Actions is the **best free option** for building Android APKs:
- No new accounts needed
- Already integrated with GitHub
- 500-2000 free minutes per month
- Easy to set up (5 minutes)
- Download APK directly from GitHub

Just add the secrets, push the code, and you're done!

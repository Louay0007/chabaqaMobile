# How to Add GitHub Secrets - Step by Step

## Visual Guide

### Step 1: Go to Your Repository Settings

1. Open your browser and go to: `https://github.com/Louay0007/chabaqa-mobile`
2. Click the **Settings** tab (top right, next to Insights)
3. In the left sidebar, scroll down and click **Secrets and variables**
4. Click **Actions**

### Step 2: Add Each Secret

For each secret, you'll repeat this process 5 times:

1. Click the green **New repository secret** button
2. Fill in the form:
   - **Name**: Copy the exact name from the table below
   - **Secret**: Copy the exact value from the table below
3. Click **Add secret**

---

## Secrets to Add (Copy-Paste These)

### Secret #1
```
Name: EXPO_PUBLIC_API_URL
Secret: http://51.254.132.77:3000
```

**How to add:**
- Name field: `EXPO_PUBLIC_API_URL`
- Secret field: `http://51.254.132.77:3000`
- Click "Add secret"

---

### Secret #2
```
Name: EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID
Secret: 759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
```

**How to add:**
- Name field: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- Secret field: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`
- Click "Add secret"

---

### Secret #3
```
Name: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
Secret: 759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
```

**How to add:**
- Name field: `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- Secret field: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`
- Click "Add secret"

---

### Secret #4
```
Name: EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
Secret: 759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
```

**How to add:**
- Name field: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- Secret field: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`
- Click "Add secret"

---

### Secret #5
```
Name: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
Secret: 759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com
```

**How to add:**
- Name field: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Secret field: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`
- Click "Add secret"

---

### Secret #6 (Optional - Skip for Now)
```
Name: EXPO_TOKEN
Secret: (Get this by running: npx expo whoami --token)
```

**You can skip this one for now.** The build will work without it.

If you want to add it later:
1. Open terminal
2. Run: `npx expo login` (login with your Expo account)
3. Run: `npx expo whoami --token`
4. Copy the token that appears
5. Add it as a secret with name `EXPO_TOKEN`

---

## What It Should Look Like

After adding all secrets, you should see this list in GitHub:

```
Repository secrets (5)
- EXPO_PUBLIC_API_URL
- EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID
- EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
- EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
- EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
```

---

## Important Notes

### ✅ DO:
- Copy the **exact** name (case-sensitive!)
- Copy the **entire** value (no spaces before/after)
- Use the "New repository secret" button for each one

### ❌ DON'T:
- Don't add quotes around the values
- Don't add spaces before/after
- Don't change the names
- Don't skip any (except EXPO_TOKEN which is optional)

---

## Example: Adding the First Secret

**Step-by-step for the first one:**

1. Click "New repository secret"
2. In the "Name" field, type exactly: `EXPO_PUBLIC_API_URL`
3. In the "Secret" field, type exactly: `http://51.254.132.77:3000`
4. Click "Add secret"
5. You'll see it appear in the list

**Now repeat for the other 4 secrets!**

---

## Quick Copy-Paste Format

If you want to copy-paste quickly, here are all the values:

**Secret 1:**
- Name: `EXPO_PUBLIC_API_URL`
- Value: `http://51.254.132.77:3000`

**Secret 2:**
- Name: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- Value: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`

**Secret 3:**
- Name: `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- Value: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`

**Secret 4:**
- Name: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- Value: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`

**Secret 5:**
- Name: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- Value: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`

---

## After Adding Secrets

Once you've added all 5 secrets:

1. Go back to your repository main page
2. Push the workflow file (if you haven't already):
   ```bash
   git add .github/workflows/android-build.yml
   git commit -m "Add GitHub Actions workflow"
   git push origin main
   ```
3. Go to the **Actions** tab
4. Watch your build run!

---

## Troubleshooting

### "I don't see the Settings tab"
- Make sure you're logged into GitHub
- Make sure you're on YOUR repository (Louay0007/chabaqa-mobile)
- You need to be the owner or have admin access

### "I can't find Secrets and variables"
- In Settings, look in the left sidebar
- Scroll down to the "Security" section
- Click "Secrets and variables"
- Then click "Actions"

### "I made a mistake in a secret"
- Click on the secret name
- Click "Update secret"
- Enter the correct value
- Click "Update secret"

### "The build fails with 'secret not found'"
- Check that the secret name is EXACTLY as shown (case-sensitive)
- Make sure there are no extra spaces
- Try deleting and re-adding the secret

---

## Video Tutorial (If You Need Visual Help)

If you're still confused, search YouTube for:
"How to add GitHub Actions secrets"

The process is the same for any repository.

---

## Summary

1. Go to: `https://github.com/Louay0007/chabaqa-mobile/settings/secrets/actions`
2. Click "New repository secret" 5 times
3. Add each secret with exact name and value from above
4. Push your code
5. Watch the build in Actions tab!

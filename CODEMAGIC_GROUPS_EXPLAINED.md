# Codemagic Environment Variable Groups - Explained

## What Are Groups?

Groups are collections of environment variables stored in Codemagic dashboard, not in your code.

## The Confusion

When you see this in `codemagic.yaml`:

```yaml
environment:
  groups:
    - chabaqa_env_vars
```

**This does NOT create the group!** It only **references** a group that should exist in Codemagic dashboard.

## How It Works

### 1. YAML References the Group
```yaml
groups:
  - chabaqa_env_vars  # "Hey Codemagic, load variables from this group"
```

### 2. You Create the Group in Dashboard
- Go to Codemagic → Your App → Environment variables
- Click "Add variable group"
- Name: `chabaqa_env_vars`
- Add variables:
  - `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
  - `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
  - etc.

### 3. During Build
- Codemagic loads variables from the group
- Makes them available as `$VARIABLE_NAME`
- Your script uses them: `$EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`

## Two Approaches

### Approach 1: Use Groups (Recommended for Production)

**Pros:**
- ✅ Secrets not in code
- ✅ Easy to update without code changes
- ✅ Different values per environment
- ✅ More secure

**Cons:**
- ❌ Requires dashboard setup
- ❌ Extra step before first build

**File:** `codemagic.yaml` (original)

```yaml
environment:
  groups:
    - chabaqa_env_vars  # References dashboard group
  vars:
    PACKAGE_NAME: "com.mariembenali.chabaqa"
```

**Setup:**
1. Create group in Codemagic dashboard
2. Add variables to group
3. Push code
4. Build

---

### Approach 2: Inline Variables (Quick Testing)

**Pros:**
- ✅ No dashboard setup needed
- ✅ Works immediately
- ✅ Faster to test

**Cons:**
- ❌ Secrets visible in YAML
- ❌ Must commit to change values
- ❌ Less secure

**File:** `codemagic-simple.yaml`

```yaml
environment:
  vars:
    PACKAGE_NAME: "com.mariembenali.chabaqa"
    EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID: "759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com"
    # All vars inline, no groups
```

**Setup:**
1. Rename `codemagic-simple.yaml` to `codemagic.yaml`
2. Push code
3. Build

---

## Which Should You Use?

### For Quick Testing (Right Now)
→ **Use Approach 2 (Inline Variables)**

1. Rename files:
   ```bash
   copy codemagic.yaml codemagic-with-groups.yaml
   copy codemagic-simple.yaml codemagic.yaml
   ```

2. Push and build immediately

### For Production (Later)
→ **Use Approach 1 (Groups)**

1. Create groups in dashboard
2. Switch back to original `codemagic.yaml`
3. More secure and maintainable

---

## Common Errors

### Error: "Group 'chabaqa_env_vars' not found"

**Cause:** YAML references a group that doesn't exist in dashboard

**Solution 1 (Quick):** Use inline variables
```bash
copy codemagic-simple.yaml codemagic.yaml
git add codemagic.yaml
git commit -m "Use inline vars"
git push
```

**Solution 2 (Proper):** Create the group in dashboard
1. Go to Codemagic → Environment variables
2. Click "Add variable group"
3. Name: `chabaqa_env_vars`
4. Add all 4 Google OAuth variables
5. Rebuild

---

### Error: "Variable 'EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID' not defined"

**Cause:** Variable not in group or not in vars section

**Solution:** Add to group in dashboard OR add to `vars:` section in YAML

---

## Example: Creating a Group in Dashboard

1. **Login to Codemagic**
   - https://codemagic.io/

2. **Select Your App**
   - Click on `chabaqa-mobile`

3. **Go to Environment Variables**
   - Click "Environment variables" tab

4. **Add Variable Group**
   - Click "Add variable group"
   - Enter name: `chabaqa_env_vars`
   - Click "Create"

5. **Add Variables to Group**
   - Click on the group
   - Click "Add variable"
   - Variable name: `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
   - Variable value: `759626859985-m0uo1oppudgks98ivsjk57ujpu5fbhfp.apps.googleusercontent.com`
   - Secret: No (uncheck)
   - Click "Add"
   - Repeat for other 3 variables

6. **Save**
   - Click "Save" at bottom

7. **Rebuild**
   - Go to builds
   - Click "Start new build"

---

## Visual Flow

### With Groups:
```
codemagic.yaml → References group → Codemagic Dashboard → Loads variables → Build uses them
```

### Without Groups (Inline):
```
codemagic.yaml → Contains variables directly → Build uses them
```

---

## Security Note

**Google OAuth Client IDs are NOT secrets!**
- They're meant to be public
- Safe to put in YAML
- Safe to commit to Git

**But for best practice:**
- Use groups for consistency
- Easier to manage multiple environments
- Better for team collaboration

---

## Quick Decision Tree

**Do you want to build RIGHT NOW?**
→ Use `codemagic-simple.yaml` (inline vars)

**Do you want proper setup for production?**
→ Create groups in dashboard, use `codemagic.yaml`

**Are you testing and will set up properly later?**
→ Use `codemagic-simple.yaml` now, switch to groups later

---

## Summary

- **Groups = Dashboard storage** (not created by YAML)
- **YAML references groups** (doesn't create them)
- **Two options:** Groups (secure) or Inline (quick)
- **For testing:** Use inline vars (`codemagic-simple.yaml`)
- **For production:** Use groups (original `codemagic.yaml`)

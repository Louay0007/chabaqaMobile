# Fix API Connection Issues - Android APK

## The Problem

Your app shows: "Erreur de connexion" (Connection error)

**Root cause:** Android blocks HTTP connections by default. Your backend uses `http://51.254.132.77:3000` (not HTTPS).

---

## Quick Fixes

### Fix 1: Allow HTTP in Android (Recommended for Testing)

We need to tell Android to allow HTTP connections to your backend.

**Step 1: Create network security config**

Create this file: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Allow cleartext (HTTP) traffic to your backend -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">51.254.132.77</domain>
    </domain>
</network-security-config>
```

**Step 2: Update AndroidManifest.xml**

Edit: `android/app/src/main/AndroidManifest.xml`

Find the `<application` tag and add:

```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ... other attributes ...>
```

**Step 3: Rebuild APK**

```bash
cd android
.\gradlew clean
.\gradlew assembleRelease
```

---

### Fix 2: Check Backend is Running

Make sure your backend is accessible:

**Test from your computer:**
```bash
curl http://51.254.132.77:3000/api/health
```

**Or open in browser:**
```
http://51.254.132.77:3000/api/health
```

Should return: `{"status":"ok"}` or similar

**If backend is down:**
```bash
# On VPS
ssh ubuntu@51.254.132.77
cd ~/chabaqa-backend
docker compose up -d
docker compose logs -f backend
```

---

### Fix 3: Check Phone Internet Connection

Make sure your phone:
- ✅ Has internet connection (WiFi or mobile data)
- ✅ Can reach external servers
- ✅ Is not on a restricted network (some corporate/school WiFi blocks external IPs)

**Test:** Open browser on phone and visit: `http://51.254.132.77:3000/api/health`

---

## Detailed Fix Steps

### Option A: Automatic Fix (Use Expo Prebuild)

1. **Create network security config:**

```bash
# Create directory
mkdir -p android/app/src/main/res/xml

# Create file (Windows)
echo ^<?xml version="1.0" encoding="utf-8"?^> > android/app/src/main/res/xml/network_security_config.xml
echo ^<network-security-config^> >> android/app/src/main/res/xml/network_security_config.xml
echo     ^<domain-config cleartextTrafficPermitted="true"^> >> android/app/src/main/res/xml/network_security_config.xml
echo         ^<domain includeSubdomains="true"^>51.254.132.77^</domain^> >> android/app/src/main/res/xml/network_security_config.xml
echo     ^</domain-config^> >> android/app/src/main/res/xml/network_security_config.xml
echo ^</network-security-config^> >> android/app/src/main/res/xml/network_security_config.xml
```

2. **Update app.json to include this config:**

Add to `app.json`:

```json
{
  "expo": {
    "android": {
      "package": "com.mariembenali.chabaqa",
      "allowBackup": false,
      "permissions": [],
      "networkSecurityConfig": "@xml/network_security_config"
    }
  }
}
```

3. **Rebuild:**

```bash
# Clean and regenerate
npx expo prebuild --platform android --clean

# Build APK
cd android
.\gradlew assembleRelease
```

### Option B: Manual Fix (Edit AndroidManifest directly)

1. **Create network_security_config.xml** (see above)

2. **Edit AndroidManifest.xml:**

File: `android/app/src/main/AndroidManifest.xml`

Find:
```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    ...>
```

Change to:
```xml
<application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ...>
```

3. **Rebuild:**

```bash
cd android
.\gradlew clean assembleRelease
```

---

## Verify the Fix

### Step 1: Check Backend is Running

```bash
# From your computer
curl http://51.254.132.77:3000/api/health
```

Should return JSON response.

### Step 2: Install New APK

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### Step 3: Test App

1. Open Chabaqa app
2. Try to login
3. Should connect successfully!

---

## Troubleshooting

### Still getting connection error?

**Check 1: Backend is running**
```bash
ssh ubuntu@51.254.132.77
docker compose ps
```

Should show backend container running.

**Check 2: Backend is accessible**
```bash
curl http://51.254.132.77:3000/api/health
```

**Check 3: Phone can reach backend**
- Open browser on phone
- Visit: `http://51.254.132.77:3000/api/health`
- Should see JSON response

**Check 4: Network security config is applied**
```bash
# Check if file exists
dir android\app\src\main\res\xml\network_security_config.xml

# Check AndroidManifest
type android\app\src\main\AndroidManifest.xml | findstr networkSecurityConfig
```

### Backend not responding?

**Restart backend:**
```bash
ssh ubuntu@51.254.132.77
cd ~/chabaqa-backend
docker compose restart backend
docker compose logs -f backend
```

### Phone can't reach backend?

**Possible causes:**
- Phone on different network (use mobile data instead of WiFi)
- Firewall blocking port 3000
- VPS firewall rules

**Test VPS firewall:**
```bash
ssh ubuntu@51.254.132.77
sudo ufw status
sudo ufw allow 3000/tcp
```

---

## Alternative: Use HTTPS (Production Solution)

For production, you should use HTTPS instead of HTTP.

**Quick setup with Cloudflare Tunnel (Free):**

1. Install cloudflared on VPS
2. Create tunnel to backend
3. Get HTTPS URL (e.g., `https://chabaqa.yourdomain.com`)
4. Update `.env` in mobile app
5. Rebuild APK

This is more secure and works without network security config changes.

---

## Summary

**Quick fix for testing:**

1. Create `network_security_config.xml` allowing HTTP to `51.254.132.77`
2. Add to `AndroidManifest.xml`: `android:networkSecurityConfig="@xml/network_security_config"`
3. Rebuild APK
4. Install and test

**For production:**
- Use HTTPS with SSL certificate
- Or use Cloudflare Tunnel for free HTTPS

---

## Commands Cheat Sheet

```bash
# Create network security config
mkdir -p android/app/src/main/res/xml

# Rebuild APK
cd android
.\gradlew clean
.\gradlew assembleRelease

# Install on phone
cd ..
adb install -r android/app/build/outputs/apk/release/app-release.apk

# Check backend
curl http://51.254.132.77:3000/api/health

# Restart backend
ssh ubuntu@51.254.132.77
cd ~/chabaqa-backend
docker compose restart backend
```

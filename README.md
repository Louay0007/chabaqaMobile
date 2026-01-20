# Chabaqa Mobile App

<div align="center">
  <img src="./assets/images/logo_chabaqa.png" alt="Chabaqa Logo" width="200"/>
  
  <h3>Build the Future of Communities</h3>
  
  <p>A community-first platform that empowers you to create, join, and grow meaningful communities around any topic.</p>

  [![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-54.0.0-black.svg)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-Private-red.svg)]()
</div>

---

## 📱 About

Chabaqa is a mobile application that enables users to:

- 🏘️ **Create & Join Communities** - Build communities around any topic
- 📝 **Share & Engage** - Post updates, share photos, and start conversations
- 🎉 **Host Events** - Organize and manage community events
- 💬 **Direct Messaging** - Connect privately with community members
- 🔍 **Discover** - Explore communities across various categories
- 💰 **Wallet System** - Earn and spend points within the platform
- 🔔 **Stay Updated** - Get real-time notifications

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/benali504/ChabaqaFinale-Mobile.git
   cd ChabaqaFinale-Mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/emulator**
   ```bash
   # Android
   npm run android

   # iOS (macOS only)
   npm run ios
   ```

---

## 🏗️ Project Structure

```
ChabaqaFinale-Mobile/
├── app/                      # App screens and navigation
│   ├── (auth)/              # Authentication screens
│   ├── (communities)/       # Communities screens
│   ├── (community)/         # Single community screens
│   ├── (profile)/           # Profile screens
│   ├── (messages)/          # Messaging screens
│   └── (notifications)/     # Notifications screens
├── lib/                     # API clients and utilities
│   ├── auth.ts             # Authentication logic
│   ├── *-api.ts            # API clients
│   └── image-utils.ts      # Image handling
├── hooks/                   # Custom React hooks
├── components/              # Reusable components
├── assets/                  # Images, fonts, etc.
└── android/                 # Android native code
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

### API Configuration

The app connects to the Chabaqa backend API. Make sure the backend is running and accessible.

---

## 📦 Building for Production

### Android

1. **Generate keystore** (first time only)
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 \
     -keystore chabaqa-release.keystore \
     -alias chabaqa-key \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

2. **Create keystore.properties**
   ```properties
   storePassword=YOUR_PASSWORD
   keyPassword=YOUR_PASSWORD
   keyAlias=chabaqa-key
   storeFile=chabaqa-release.keystore
   ```

3. **Build release AAB**
   ```bash
   cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

   Output: `android/app/build/outputs/bundle/release/app-release.aab`

For detailed instructions, see [RELEASE_BUILD_INSTRUCTIONS.md](./RELEASE_BUILD_INSTRUCTIONS.md)

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

---

## 📚 Documentation

- [Release Build Instructions](./RELEASE_BUILD_INSTRUCTIONS.md)
- [Play Store Checklist](./PLAY_STORE_CHECKLIST.md)
- [Quick Start Guide](./QUICK_START_GUIDE.md)
- [Account Deletion Feature](./ACCOUNT_DELETION_FEATURE.md)
- [Privacy Policy](#privacy-policy)

---

## 🔒 Privacy Policy

**Last Updated:** January 20, 2026

### Introduction

Chabaqa ("we," "our," or "us") operates the Chabaqa mobile application (the "App"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our App.

### Information We Collect

#### Personal Information
- **Account Information:** Email address, name, profile picture
- **Profile Data:** Bio, location (if provided), social links
- **Authentication Data:** Login credentials (encrypted)

#### User-Generated Content
- **Posts:** Text content, images, tags
- **Comments:** Responses to posts
- **Community Data:** Communities you join, events you register for
- **Messages:** Direct messages between users
- **Interactions:** Likes, bookmarks, shares

#### Automatically Collected Information
- **Device Information:** Device type, operating system version
- **Usage Data:** App features used, session duration
- **Log Data:** Error logs, crash reports

#### Media Files
- **Photos:** Profile pictures, post images, event photos
- **Documents:** Payment proofs for top-up requests

### How We Use Your Information

We use the collected information to:
- Provide and maintain the App functionality
- Create and manage your account
- Enable community features (posts, events, messaging)
- Process top-up requests and manage wallet points
- Send notifications about app activity
- Improve app performance and user experience
- Respond to support requests
- Prevent fraud and ensure security

### Data Sharing and Disclosure

**We DO NOT sell your personal information.**

We may share your information in the following circumstances:
- **Within Communities:** Your profile and posts are visible to community members
- **Public Content:** Posts in public communities may be visible to all users
- **Service Providers:** Third-party services that help us operate the app (hosting, analytics)
- **Legal Requirements:** When required by law or to protect our rights

### Payment Information

#### Payment Processing

Chabaqa does not process payments directly through the app. We use a manual payment verification system where:

- Users submit payment requests with desired amounts
- Users make payments through external banking systems (bank transfers, mobile money, etc.)
- Users upload proof of payment (receipts, screenshots, or confirmation documents)
- Our team manually verifies each payment within 24-48 hours
- Points are added to user wallets after verification

#### Payment Data We Collect

We collect and store:
- Payment proof images (receipts, screenshots)
- Payment amount and currency
- Payment reference numbers
- User notes about the payment

We **DO NOT** collect or store:
- Credit card numbers
- Bank account credentials
- CVV codes
- Banking passwords
- Any sensitive financial credentials

#### Payment Proof Storage

Payment proof images are:
- Stored securely on our servers
- Used only for payment verification purposes
- Accessible only to authorized admin staff
- Retained for accounting and dispute resolution
- Can be deleted upon user request (after verification is complete)

#### Payment Security

- All payment proof uploads are transmitted over HTTPS
- Payment verification is done manually by trained staff
- We do not integrate with automated payment gateways
- We do not handle sensitive financial data
- Users make payments through their own trusted banking apps

#### How to Add Points to Your Wallet

1. Go to **Profile → Top-Up**
2. Enter the amount you want to add
3. Select your currency (DT, USD, or EUR)
4. Upload proof of payment (bank receipt or screenshot)
5. Add optional notes
6. Submit your request
7. Wait for verification (24-48 hours)
8. Receive notification when approved

#### Refunds and Disputes

If you have issues with a payment:
- Contact us at **louay.rjilii@gmail.com** within 7 days
- Include your payment reference number
- Provide details of the issue
- We will investigate and respond within 48 hours

For more details about the payment system, see:
- [Payment System Analysis](./PAYMENT_SYSTEM_ANALYSIS.md)
- [Pre-Submission Payment Updates](./PRE_SUBMISSION_PAYMENT_UPDATES.md)

### Data Storage and Security

- **Encryption:** Data is encrypted in transit using HTTPS
- **Secure Storage:** Passwords are hashed and securely stored
- **Retention:** We retain your data as long as your account is active

### Your Rights

You have the right to:
- **Access:** Request a copy of your personal data
- **Correction:** Update or correct your information
- **Deletion:** Request deletion of your account and data
- **Opt-Out:** Disable notifications in app settings
- **Data Portability:** Export your data

To exercise these rights, contact us at louay.rjilii@gmail.com

### Data Deletion Instructions

#### Method 1: In-App Deletion (Recommended)
1. Open the Chabaqa app
2. Go to **Profile → About tab**
3. Scroll to **"Danger Zone"** section
4. Tap **"Delete Account"**
5. Confirm deletion (you will be asked twice)

#### Method 2: Email Request
Email us at louay.rjilii@gmail.com with:
- Subject: "Account Deletion Request"
- Your account email address
- Confirmation that you want to permanently delete your account

**What gets deleted:**
- Your profile and all personal information
- All your posts, comments, and interactions
- Your communities (if you're the creator)
- Your community memberships
- All your events and registrations
- Your session bookings
- Your challenges and participations
- Your courses and enrollments
- Your products and purchases
- Your wallet and transaction history
- **Payment proof images** (after verification is complete)
- All your messages and conversations
- Your notifications
- Your uploaded files (avatars, images)

**Deletion timeline:**
- In-app deletion: Immediate
- Email request: Within 30 days

**Note:** This action is permanent and cannot be undone. Make sure to export any data you want to keep before deleting your account.

### Children's Privacy

Our App is not intended for users under 13 years of age. We do not knowingly collect information from children under 13.

### Third-Party Services

Our App may contain links to third-party services:
- **Google Sign-In:** For authentication (governed by Google's Privacy Policy)
- **Image Storage:** For hosting user-uploaded images

### Cookies and Tracking

We use:
- **Session Tokens:** To keep you logged in
- **Local Storage:** To cache app data for better performance

### International Data Transfers

Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place.

### Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by:
- Posting the new Privacy Policy in the App
- Updating the "Last Updated" date

### Contact Us

If you have questions about this Privacy Policy, please contact us:

**Email:** louay.rjilii@gmail.com

### Compliance

This Privacy Policy complies with:
- General Data Protection Regulation (GDPR)
- California Consumer Privacy Act (CCPA)
- Google Play Store Data Safety Requirements

For the complete privacy policy template, see [PRIVACY_POLICY_TEMPLATE.md](./PRIVACY_POLICY_TEMPLATE.md)

---

## 🤝 Contributing

This is a private repository. If you have access and want to contribute:

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Wait for review

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👥 Team

- **Developer:** Louay Rjili
- **Email:** louay.rjilii@gmail.com

---

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)
- Device information

---

## 📞 Support

For support, email louay.rjilii@gmail.com

---

## 🎯 Roadmap

- [x] User authentication
- [x] Community creation and management
- [x] Post creation and interactions
- [x] Event management
- [x] Direct messaging
- [x] Wallet system
- [x] Account deletion
- [ ] Push notifications
- [ ] In-app purchases
- [ ] Video support
- [ ] Live streaming

---

## 📊 Status

- **Development:** ✅ Active
- **Production:** 🚀 Ready
- **Play Store:** 📱 Preparing submission
- **App Store:** 🍎 Coming soon

---

## 🙏 Acknowledgments

- React Native team
- Expo team
- All contributors and testers

---

<div align="center">
  <p>Made with ❤️ by the Chabaqa Team</p>
  <p>© 2026 Chabaqa. All rights reserved.</p>
</div>

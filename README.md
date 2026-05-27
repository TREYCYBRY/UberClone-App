# UberClone App 🚗

**Student 1:** Adler Clin Omonte Sanchez

**Student 2:** Treycy Bridney Andres Sebastian

## 📝 Project Description
UberClone is a mobile application developed in **React Native** that replicates the core ride-hailing experience of Uber. Users can register or log in, request a ride by selecting an origin and destination on an interactive map, choose a vehicle type, see the estimated fare, complete the payment with a credit card through **Stripe** or in cash, track the ride in real time, and review their full ride history.

The project integrates **Firebase Cloud Functions** as a secure backend for creating Stripe Payment Intents, **Firestore** for persistent data, and the **Google Maps SDK** for live geolocation and route rendering.

## ✨ Main Features
* **Authentication:** Registration and login flow with persistent session.
* **Interactive map:** Origin and destination selection with autocomplete (Google Places).
* **Vehicle selection:** Multiple vehicle types with dynamic fare calculation based on distance and duration.
* **Payments with Stripe:** Native Payment Sheet for credit/debit cards, with the option to pay in cash.
* **Real-time tracking:** Ride status visualization with route polylines.
* **Ride history:** Persistent log of all completed trips.
* **User profile:** Manage personal information.

## 💻 Technologies Used
* **Framework:** React Native CLI 0.85 (Functional Components with Hooks)
* **Navigation:** React Navigation (Native Stack + Bottom Tabs)
* **State Management:** React Context API + Hooks
* **Maps & Geolocation:** `react-native-maps` (Google Maps SDK) + `react-native-google-places-autocomplete`
* **Backend:** Firebase (Firestore + Cloud Functions v2 in Node.js 24)
* **Payments:** `@stripe/stripe-react-native` (Payment Sheet) + Stripe Node SDK on the server
* **Persistent Storage:** `@react-native-async-storage/async-storage`
* **User Interface:** React Native Safe Area Context, Vector Icons, Gesture Handler, Reanimated
* **Testing Platforms:** iOS Simulator (iPhone 17), Android Emulator, and physical devices

## 📂 Project Structure
```
UberClone-App/
├── App.js                      # Entry point (StripeProvider + AppProvider)
├── src/
│   ├── Config/Firebase.js      # Firebase Web SDK initialization
│   ├── Context/AppContext.js   # Global state (session, rides)
│   ├── Navigation/             # Stack + Tabs navigators
│   ├── Screens/                # Login, Register, Ride, Payment, Tracking, History, Profile
│   ├── Styles/GlobalStyles.js  # Color palette and shared styles
│   └── Utils/                  # Constants, vehicle types, mocks, storage helpers
├── functions/                  # Firebase Cloud Functions (createPaymentIntent)
├── ios/                        # Native iOS project (Xcode workspace + Pods)
└── android/                    # Native Android project (Gradle)
```

## 🛠️ Installation and Setup Instructions

Follow these steps in your terminal to clone and run the project locally:

### 1. Clone the repository and navigate to the folder
```bash
git clone https://github.com/TREYCYBRY/UberClone-App.git
cd UberClone-App
```

### 2. Install JavaScript dependencies
```bash
npm install
```

This installs every dependency declared in `package.json`, including React Navigation, React Native Maps, Stripe, Firebase, and all supporting libraries.

### 3. iOS Configuration (Mandatory on Mac)
Install the CocoaPods native dependencies (required after each `npm install` or update of native modules):
```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

> If you do not have CocoaPods set up, run `sudo gem install cocoapods` first.

### 4. Android Configuration
No extra steps are required for the JavaScript layer. Make sure you have:
* **Android Studio** with an Android 13+ emulator created, OR a physical device with **USB debugging** enabled.
* The `ANDROID_HOME` environment variable correctly configured.

### 5. Run the application

**Start Metro (in one terminal):**
```bash
npm start
```

**Start the project on the iPhone simulator (iOS) in another terminal:**
```bash
npx react-native run-ios --simulator="iPhone 17"
```

**Start the project on the Android emulator:**
```bash
npx react-native run-android
```

### 6. Run on a physical device (optional)

**iOS (physical iPhone):**
1. Connect the iPhone to the Mac via USB and trust the computer.
2. Open `ios/UberClone.xcworkspace` in Xcode.
3. In **Signing & Capabilities**, select your Apple ID team and use a unique Bundle Identifier (e.g. `com.yourname.uberclone`).
4. Select your iPhone as the destination and press **Run** (▶️).
5. On the iPhone, trust the developer certificate under **Settings → General → VPN & Device Management**.

**Android (physical phone):**
1. Enable **Developer Options** and **USB Debugging** on the phone.
2. Connect it via USB and accept the debug authorization.
3. Run `npx react-native run-android` — the app installs automatically.

## 🔐 Required Credentials

The project relies on three external services. The keys included in the repository are **test keys** for academic use:

* **Firebase:** Configuration already injected in `src/Config/Firebase.js`.
* **Stripe (publishable key):** Defined inside `<StripeProvider>` in `App.js`.
* **Stripe (secret key):** Stored on the server in `functions/.env` (`STRIPE_SECRET_KEY`).
* **Google Maps API Key:** Configured in `android/app/src/main/AndroidManifest.xml` and in the iOS `AppDelegate`.

## 💳 Testing the Stripe Payment Flow
Use Stripe's official test cards in the Payment Sheet:

| Card Number          | Result                  |
|----------------------|-------------------------|
| `4242 4242 4242 4242`| Successful payment      |
| `4000 0000 0000 9995`| Insufficient funds      |
| `4000 0025 0000 3155`| Requires 3D Secure auth |

Use any future expiration date, any 3-digit CVC, and any 5-digit ZIP code.

## 🧪 Tested Platforms
* ✅ iOS Simulator — iPhone 17 (iOS 18+)
* ✅ Android Emulator — Pixel 6 (API 34)
* ✅ Physical iPhone via Xcode
* ✅ Physical Android via USB debugging

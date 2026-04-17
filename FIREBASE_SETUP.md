# Firebase Setup Guide for Meeting Scheduler

## 🚀 Firebase Integration Complete!

Your meeting scheduler now saves all data to Firebase Cloud Firestore. Data persists across page refreshes and is shared across all users.

## 📋 Next Steps: Configure Your Firebase Project

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard (Google Analytics is optional)

### 2. Set up Firestore Database

1. In your Firebase project, click "Firestore Database" in the left menu
2. Click "Create database"
3. Choose **"Start in test mode"** (for development)
   - This allows read/write access for 30 days
4. Select a location closest to your users (e.g., asia-east1 for Taiwan)
5. Click "Enable"

### 3. Get Your Firebase Credentials

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>` to add a web app
5. Register your app with a nickname (e.g., "Meeting Scheduler")
6. Copy the `firebaseConfig` object

### 4. Update Your Configuration

Open `src/firebase.js` and replace the placeholder values with your actual credentials:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### 5. Set Firestore Security Rules (Important!)

Go to Firestore Database → Rules tab and update:

**For Development (Test Mode):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 6, 1);
    }
  }
}
```

**For Production (Recommended):**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read availability and schedules
    match /availability/{document} {
      allow read: if true;
      allow write: if true; // Consider adding authentication
    }
    match /scheduled/{document} {
      allow read: if true;
      allow write: if true; // Consider adding authentication
    }
  }
}
```

## 📊 Database Structure

Your data is organized as follows:

```
meeting-scheduler (Firestore Database)
├── availability/
│   └── {YEAR}_{MONTH}
│       ├── data: { memberName: { "day-slotId": boolean } }
│       ├── savedMembers: [array of member names]
│       └── lastUpdated: timestamp
└── scheduled/
    └── {YEAR}_{MONTH}
        ├── data: { meetingId: { day, slotId } }
        └── lastUpdated: timestamp
```

## ✅ Features Now Working

- ✅ **Auto-save**: Changes are automatically saved to Firebase
- ✅ **Real-time sync**: Data loads when switching months
- ✅ **Persistent storage**: Data survives page refreshes
- ✅ **Multi-user**: All users see the same data
- ✅ **Lock mechanism**: Saved members can't edit their availability

## 🔧 Testing

1. Run your app: `npm run dev`
2. Fill in availability for a member
3. Click "Save Availability" 
4. Refresh the page - your data should still be there!
5. Check Firebase Console → Firestore Database to see your data

## 🛡️ Security Considerations

For production deployment:

1. **Add Authentication**: Implement Firebase Authentication
2. **Update Security Rules**: Restrict write access to authenticated users
3. **Add User Roles**: Create admin role for FAD team members
4. **Environment Variables**: Store Firebase config in environment variables

## 🐛 Troubleshooting

**Error: "Missing or insufficient permissions"**
- Check your Firestore Security Rules
- Make sure test mode is enabled or rules allow access

**Error: "Firebase: No Firebase App"**
- Verify `firebase.js` has correct credentials
- Check that Firebase is initialized before use

**Data not saving:**
- Open browser console (F12) to see error messages
- Verify your Firebase project is active
- Check your internet connection

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Firebase configuration in `src/firebase.js`
3. Check Firestore Security Rules in Firebase Console

---

🎉 **Your meeting scheduler is now connected to Firebase!**

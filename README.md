# AarohanR - College Fest Event Registration Platform

AarohanR is a modern web application built for managing college fest event registrations. It provides different experiences for college students and outside participants, with special handling for paid events.

## Features

- User authentication with Google Sign-in
- Role-based access control (Admin, College Student, Outside Participant)
- Event management system
- Automatic free registration for college students (@poornima.org emails)
- Payment integration for outside participants (coming soon)
- Responsive design with dark mode
- Real-time updates using Firebase

## Tech Stack

- **Frontend:**
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - Headless UI
  - React Hook Form

- **Backend:**
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Storage
  - Firebase Cloud Functions (coming soon)

## Prerequisites

- Node.js 18+ and npm
- Firebase project
- Git

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aarohanr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google provider)
   - Create a Firestore database
   - Enable Storage

4. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration details

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Security Rules

Add these security rules to your Firebase console:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAdmin() || isOwner(userId);
    }
    
    // Events
    match /events/{eventId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Registrations
    match /registrations/{registrationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAdmin();
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /event-banners/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# Umrah Guide Mobile App

A React Native mobile application built with Expo for Umrah pilgrims, providing step-by-step guidance, duas, ziyarat locations, and trip management.

## 📁 Project Structure

```
mobile/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── duas.tsx       # Duas listing
│   │   ├── guide.tsx      # Umrah guide steps
│   │   ├── map.tsx        # Ziyarat locations
│   │   └── profile.tsx    # User profile
│   ├── guide/             # Guide detail screens
│   │   └── [id].tsx       # Individual guide step details
│   ├── map/               # Ziyarat detail screens
│   │   └── [id].tsx       # Individual location details
│   ├── itinerary.tsx      # Trip itinerary screen
│   └── _layout.tsx        # Root layout configuration
├── assets/                # Static assets (icons, splash)
├── components/            # Reusable UI components
├── data/                  # Mock data and fixtures
│   └── mock.ts            # Mock data for all features
├── lib/                   # Utility functions and constants
│   ├── constants.ts       # App-wide constants
│   └── utils.ts           # Helper functions
├── public/                # Public images (guides, locations)
├── types/                 # TypeScript type definitions
│   └── index.ts           # Shared type definitions
├── app.json              # Expo configuration
├── global.css            # Global styles and CSS variables
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm

### Installation

```bash
cd mobile
npm install
```

### Running the App

**Web:**
```bash
npm start -- --web
# or
npx expo start --web
```

**iOS:**
```bash
npx expo start --ios
```

**Android:**
```bash
npx expo start --android
```

## 🎨 Features

- **Home Dashboard**: Trip status, prayer times, quick access to features
- **Umrah Guide**: Step-by-step instructions with images
- **Duas**: Categorized supplications in Arabic with transliteration
- **Ziyarat Locations**: Historical sites with details and visitor tips
- **Trip Itinerary**: Day-by-day schedule with activities
- **User Profile**: Personal information and trip history

## 🎨 Design System

The app uses a custom color palette based on sand, cream, and emerald green tones, matching the web version.

### Color Tokens
- **Background**: Cream/Sand tones
- **Primary**: Emerald green
- **Secondary**: Warm sand tones
- **Accent**: Emerald variations

## 📦 Tech Stack

- **React Native** - Mobile framework
- **Expo** - Development platform
- **Expo Router** - File-based navigation
- **NativeWind** - Tailwind CSS for React Native
- **TypeScript** - Type safety
- **Lucide React Native** - Icons

## 📝 Data Management

Currently using mock data from `data/mock.ts`. In production, this would be replaced with API calls to a backend service.

## 🖼️ Images

Images are stored in the `public/` folder and loaded using `require()` for optimal bundling.

## 🔧 Configuration

- **Tailwind**: `tailwind.config.js`
- **TypeScript**: `tsconfig.json`
- **Expo**: `app.json`
- **Metro**: `metro.config.js`

## 📱 Supported Platforms

- ✅ Web
- ✅ iOS
- ✅ Android

## 🤝 Contributing

This is a standalone mobile application. Ensure code follows the established patterns and TypeScript types are properly defined.

## 📄 License

Private project - All rights reserved

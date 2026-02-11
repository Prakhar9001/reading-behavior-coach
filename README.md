# Reading Behavior Coach

A local-first reading behavior intelligence app that helps you understand why you abandon books and coaches you into becoming a better reader.

## Core Philosophy

We believe that reading behavior is a habit that can be understood and improved. By tracking how you interact with books—especially when and why you abandon them—we can provide insights that help you build a sustainable and enjoyable reading practice.

## Tech Stack

- **Framework**: Expo SDK 50 + React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (File-based)
- **UI**: React Native Paper
- **State Management**: Zustand
- **Database**: Expo SQLite (Local-first)
- **Platforms**: iOS, Android, Web

## Architecture

The app follows a local-first architecture where all data resides on the user's device. 
- **Data Layer**: Repositories abstract direct database access.
- **Logic Layer**: specialized "Engines" (Coaching, Insights) process raw data into actionable advice.
- **UI Layer**: Components are functional and reactive, driven by Zustand stores.

## Features

- **Library Management**: Track "Currently Reading", "Completed", and "Abandoned" books.
- **Abandonment Tracking**: Detailed logging of why a book was dropped.
- **Coaching Engine**: "Should I quit?" analysis based on reading patterns (V1 Implementation).
- **Insights**: Visualization of reading data (V1 Implementation).

## V1 Status

- **Scaffold**: Complete
- **Core Data**: Implementation in progress (Week 1)
- **Coaching Logic**: Basic rule set implemented

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Locally**
   ```bash
   npm start
   ```

3. **Reset Database (Dev Only)**
   The app initializes the database on first run. To reset, clear app data or use the dev menu (if implemented).

## Future Roadmap

- [ ] Advanced Coaching Algorithms
- [ ] Social Sharing (Optional)
- [ ] Export/Import Data
- [ ] Personalized Reading Challenges

---
v1.0.0

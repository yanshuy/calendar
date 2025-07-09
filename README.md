# 📅 Modern Calendar App

A sleek and intuitive calendar application built with React, TypeScript, and Tailwind CSS using indexed DB as events storage.

![Calendar App](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.15-blue?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6.2.0-yellow?logo=vite)

## ✨ Features

### 📋 Event Management
- **Create Events**: Add new events with detailed information including name, description, start/end times, and categories
- **Edit Events**: Modify existing events with validation and error handling
- **Delete Events**: Remove events with confirmation prompts
- **Event Categories**: Organize events by Work, Personal, Meeting, or Reminder categories

### 📅 Calendar Views
- **Day View**: Focus on a single day's events with hourly time slots
- **Week View**: See an entire week at a glance with ISO week formatting
- **Month Navigation**: Browse through months with an intuitive calendar picker
- **Today Navigation**: Quick jump back to the current date

### 📱 User Experience
- **Modern UI**: Clean, minimalist interface with smooth animations
- **Keyboard Navigation**: Full keyboard accessibility support
- **Click-to-Create**: Click on any time slot to create a new event
- **Visual Indicators**: Event dots on calendar dates and color-coded categories

### 💾 Data Storage
- **IndexedDB Integration**: Local storage for offline functionality
- **ICS Import**: Import events from external calendar files
- **Data Persistence**: Events persist across browser sessions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd calendar-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## 🛠️ Tech Stack

### Frontend
- **React 19.0.0** - Modern React with latest features
- **TypeScript 5.7.2** - Type-safe JavaScript development
- **Tailwind CSS 4.0.15** - Utility-first CSS framework
- **Vite 6.2.0** - Fast build tool and development server

### Libraries
- **date-fns 4.1.0** - Modern JavaScript date utility library
- **date-fns-tz 3.2.0** - Timezone handling for date-fns
- **idb 8.0.2** - IndexedDB wrapper for browser storage

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite React Plugin** - React support for Vite

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── EventModal.tsx   # Event creation/editing modal
│   ├── EventSticker.tsx # Event display component
│   └── UploadModal.tsx  # File import modal
├── context/             # React context providers
│   ├── useCalendar.tsx  # Calendar state management
│   ├── useEventModal.tsx # Modal state management
│   └── useEventStore.tsx # Event data management
├── hooks/               # Custom React hooks
│   ├── useClickOutside.ts # Outside click detection
│   ├── useDialog.ts     # Dialog/modal management
│   └── useIndexedDB.ts  # IndexedDB operations
├── utils/               # Utility functions
│   ├── date-utils.ts    # Date manipulation helpers
│   ├── ErrorBoundry.tsx # Error boundary component
│   ├── intersectionObserver.ts # Scroll detection
│   └── types.ts         # TypeScript type definitions
├── Calendar.tsx         # Month calendar component
├── CalendarSidebar.tsx  # Event sidebar component
├── CalendarView.tsx     # Main calendar view
├── DaysView.tsx         # Day/week view component
└── main.tsx             # Application entry point
```

## 🎯 Usage

### Creating Events
1. Click the "Event" button in the toolbar
2. Or click on any time slot in the calendar
3. Fill in the event details:
   - **Name**: Event title (required)
   - **Start/End Time**: Date and time selection
   - **Category**: Work, Personal, Meeting, or Reminder
   - **Description**: Optional event details
4. Click "Save Event" to create

### Navigating the Calendar
- **Day/Week Toggle**: Switch between day and week views
- **Navigation Arrows**: Move between time periods
- **Today Button**: Jump to the current date
- **Month Picker**: Click the month/year to open calendar picker

### Searching Events
- Use the search bar in the sidebar
- Search by event name, date, or time
- Results update in real-time as you type

### Importing Events
1. Click the import button (upload icon)
2. Select an ICS calendar file
3. Events will be imported automatically

### Customization
- **Theme Colors**: Modify Tailwind CSS classes in components
- **Date Format**: Adjust date-fns formatting in utility functions
- **Categories**: Add new event categories in the types file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

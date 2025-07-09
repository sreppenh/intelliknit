# Intelliknit MVP

A React-based knitting project tracker that helps you organize and track your knitting projects, components, and steps.

## Features

- **Project Management**: Create and organize multiple knitting projects
- **Component Tracking**: Break projects into components (sleeves, body, etc.)
- **Step-by-Step Progress**: Add detailed steps and track completion
- **Progress Visualization**: Visual progress bars and completion tracking
- **Component Copying**: Duplicate components with identical steps
- **Knitting Mode**: Focused tracking view for active knitting sessions

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/intelliknit-mvp.git
cd intelliknit-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── features/
│   └── projects/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── App.js
└── main.jsx
```

## State Management Strategy

- **React Context** for global state (projects, current project)
- **Custom hooks** for feature-specific logic
- **Local state** for UI-only concerns
- Prepared for future state management (Redux Toolkit, Zustand)

## Data Layer Strategy

- **Abstract storage layer** (currently localStorage, easily swappable)
- **Repository pattern** for data operations
- Ready for API integration, offline sync, cloud storage

## Future MVP Readiness

- **Plugin architecture** for new features
- **Consistent patterns** for adding views, modals, workflows
- **Typed interfaces** (TypeScript migration path)
- **Testing structure** built-in

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
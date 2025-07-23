# Incident Manager - React Application

A comprehensive incident management system built with React, featuring a modern UI for creating, tracking, and managing incidents with detailed postmortem analysis.

## Features

### Core Functionality
- **Incident Creation**: Create incidents with comprehensive details
- **Multi-step Form**: Organized into logical sections (Basic Info, Customer Impact, Timeline, Root Cause Analysis, Safeguards, Review)
- **Real-time Validation**: Form validation with error messages
- **Auto-save**: Automatically saves drafts to localStorage
- **Priority Scoring**: Dynamic priority calculation based on incident severity and impact

### Advanced Features
- **Five Whys Analysis**: Built-in root cause analysis framework
- **Customer Impact Assessment**: Detailed impact tracking including users, transactions, and compliance
- **Future Safeguards**: Prevention, detection, and mitigation improvements
- **File Attachments**: Support for incident documentation and evidence
- **Stakeholder Management**: Track contributors, reviewers, and accountability
- **Action Items**: Manage follow-up tasks and deliverables
- **Templates**: (Ready for implementation) Incident templates for common scenarios

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with Tailwind CSS
- **Tab Navigation**: Easy navigation between different sections
- **Dynamic Forms**: Smart form elements that adapt to user input
- **Notifications**: Real-time feedback and status updates

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository or create a new React app:
```bash
npx create-react-app incident-manager
cd incident-manager
```

2. Install dependencies:
```bash
npm install
```

3. Copy the provided files to your project structure:
```
src/
├── components/
│   ├── ui/
│   │   └── index.js
│   └── IncidentCreationPage.jsx
├── App.js
├── App.css
├── index.js
└── index.css
```

4. Install additional dependencies:
```bash
npm install lucide-react date-fns uuid
npm install -D tailwindcss autoprefixer postcss
```

5. Set up Tailwind CSS:
```bash
npx tailwindcss init -p
```

6. Start the development server:
```bash
npm start
```

## Usage

### Creating an Incident

1. **Basic Information**: Fill in the incident title, description, severity level, and scope
2. **Customer Impact**: Document affected users, transactions, and compliance implications
3. **Timeline**: Record when the incident started and was discovered
4. **Root Cause Analysis**: Conduct Five Whys analysis and identify trigger conditions
5. **Future Safeguards**: Plan prevention, detection, and mitigation improvements
6. **Review**: Add contributors, reviewers, and submit for approval

### Key Features

#### Auto-save
- Automatically saves form data to localStorage every 2 seconds
- Recover drafts when returning to the page
- Can be toggled on/off

#### Priority Scoring
- Automatically calculates priority based on:
  - Severity level (L1=1, L2=2, L3=3, L4=4, L5=5) multiplied by scope (Low=1x, High=2x)
    - Examples: L1 Low=1, L1 High=2, L3 Low=3, L3 High=6, L5 Low=5, L5 High=10
  - External impact area (+2 points)
  - High percentage of affected requests (+2 points)
  - Large number of affected users (+2 points)
  - Security/privacy impact (+1 point)
  - Safety/compliance impact (+1 point)

#### Form Validation
- Required fields validation
- Character limits
- Real-time error messages
- Prevents submission of invalid data

### Data Structure

The application creates incident objects with the following structure:

```javascript
{
  incident_id: "INC-1234567890",
  title: "Database Connection Failure",
  description: "Primary database became unresponsive...",
  level: "L4",
  severity_scope: "High",
  scope: "External",
  status: "Reported",
  
  customerImpact: {
    impacted_parties: ["Premium customers", "Enterprise clients"],
    percentage_requests_affected: "25",
    absolute_users_impacted: "5000",
    // ... other impact fields
  },
  
  root_cause_analysis: {
    trigger_condition: "Database connection pool exhaustion",
    five_whys: {
      why1: "Database became unresponsive",
      why2: "Connection pool was exhausted",
      // ... continuing analysis
    }
  },
  
  // ... other incident fields
}
```

## Customization

### Adding New Fields
1. Update the incident state structure in `IncidentCreationPage.jsx`
2. Add form fields in the appropriate tab section
3. Update the `updateIncident` function if needed

### Modifying UI Components
- Edit components in `src/components/ui/index.js`
- Customize styles in `src/index.css`
- Modify Tailwind configuration in `tailwind.config.js`

### Adding Templates
The application is ready for incident templates. To implement:
1. Create a templates data structure
2. Add template selection UI
3. Implement `applyTemplate` function logic

## Integration

### API Integration
To connect to a backend API:
1. Replace the mock `handleSubmit` function with real API calls
2. Add authentication handling
3. Implement error handling for network requests

### Database Schema
The incident object structure is designed to work with both SQL and NoSQL databases:
- Nested objects can be stored as JSON columns in SQL
- MongoDB or similar NoSQL databases can store the complete structure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Note**: This application is based on the Python incident management system and provides a modern web interface for comprehensive incident tracking and postmortem analysis. 
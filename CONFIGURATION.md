# Configuration Guide

The Incident Manager now includes a powerful configuration system that allows you to customize all dropdown values, scoring algorithms, validation rules, and more.

## 🎯 Quick Start

1. **Access the Configuration Editor**: Click the "Configure" button in the top-right corner of the incident creation page
2. **Make Changes**: Use the intuitive interface to add/remove/modify values
3. **Save**: Click "Save" to apply your changes
4. **Refresh**: Reload the page to see your changes in the incident form

## 📁 Configuration File Location

The main configuration is stored in:
```
src/config/incidentConfig.js
```

## 🔧 What You Can Configure

### 1. **Severity Levels**
- **Default**: L1-L5 with descriptions
- **Customizable**: Add your own levels (e.g., P0, P1, P2, Critical, High, Medium, Low)
- **Example**:
```javascript
severityLevels: [
  { value: 'P0', label: 'P0 - Critical', description: 'System down' },
  { value: 'P1', label: 'P1 - High', description: 'Major functionality affected' },
  { value: 'P2', label: 'P2 - Medium', description: 'Some functionality affected' }
]
```

### 2. **Scope Levels**
- **Default**: Low, Medium, High
- **Customizable**: Define your own scope classifications
- **Example**:
```javascript
scopeLevels: [
  { value: 'Single', label: 'Single User', description: 'Affects one user' },
  { value: 'Team', label: 'Team Level', description: 'Affects a team' },
  { value: 'Organization', label: 'Organization Wide', description: 'Affects entire org' }
]
```

### 3. **Impact Areas**
- **Default**: Internal, External, Partial, Infrastructure, Application
- **Customizable**: Add your specific system areas
- **Example**:
```javascript
impactAreas: [
  { value: 'Frontend', label: 'Frontend Systems', description: 'User-facing applications' },
  { value: 'Backend', label: 'Backend Services', description: 'API and microservices' },
  { value: 'Database', label: 'Database Layer', description: 'Data persistence layer' }
]
```

### 4. **Root Cause Categories**
- **Default**: Human Error, System Failure, Process Failure, etc.
- **Customizable**: Define categories that match your organization

### 5. **Impact Assessment Levels**
- **Default**: None, Low, Medium, High, Critical
- **Customizable**: Create your own impact scale

## ⚙️ Priority Scoring Configuration

### Level Scores
Configure base scores for each severity level:
```javascript
levelScores: {
  'P0': 10,  // Critical gets highest score
  'P1': 7,   // High priority
  'P2': 4,   // Medium priority
  'P3': 1    // Low priority
}
```

### Scope Multipliers
Configure how scope affects priority:
```javascript
scopeMultipliers: {
  'Single': 1,       // No multiplier
  'Team': 1.5,       // 1.5x multiplier
  'Organization': 2   // 2x multiplier
}
```

### Bonus Points
Configure additional points for special conditions:
```javascript
bonusPoints: {
  externalImpact: 3,              // +3 for external impact
  highRequestPercentage: 2,       // +2 for >50% requests affected
  highUserImpact: 2,              // +2 for >1000 users affected
  securityPrivacyImpact: 2,       // +2 for security issues
  safetyComplianceImpact: 2       // +2 for compliance issues
}
```

## 🎨 Using the Configuration Editor

### **Levels & Scopes Tab**
- Add/remove severity levels
- Customize scope options
- Define impact areas
- Each item has:
  - **Value**: Technical identifier (used in code)
  - **Label**: Display name (shown in dropdown)
  - **Description**: Tooltip text (optional)

### **Categories Tab**
- Manage root cause categories
- Configure impact assessment levels
- Add domain-specific categories

### **Priority Scoring Tab**
- Adjust level scores
- Configure scope multipliers
- Set bonus point values
- Modify priority badge thresholds

### **Settings Tab**
- Set default values for new incidents
- Configure validation rules
- Adjust form behavior

## 📤 Import/Export Configuration

### **Export Configuration**
1. Click "Export" button
2. Downloads `incident-config.json`
3. Share with team or backup

### **Import Configuration**
1. Click "Import" button
2. Select `.json` file
3. Configuration immediately loads

### **Example Export Format**
```json
{
  "severityLevels": [
    {
      "value": "P0",
      "label": "P0 - Critical",
      "description": "Complete system outage"
    }
  ],
  "priorityScoring": {
    "levelScores": {
      "P0": 10,
      "P1": 7
    },
    "scopeMultipliers": {
      "Low": 1,
      "High": 2
    }
  }
}
```

## 🔄 Advanced Customization

### **Programmatic Configuration**
Edit `src/config/incidentConfig.js` directly for advanced customization:

```javascript
export const INCIDENT_CONFIG = {
  // Your custom configuration
  severityLevels: [
    // Your levels
  ],
  // Custom validation logic
  customValidation: (incident) => {
    // Your validation rules
  }
};
```

### **Dynamic Configuration Loading**
For enterprise deployments, load configuration from API:

```javascript
// Load config from backend
const loadConfigFromAPI = async () => {
  const response = await fetch('/api/incident-config');
  return response.json();
};
```

## 📋 Common Configuration Examples

### **Software Development Team**
```javascript
severityLevels: [
  { value: 'P0', label: 'P0 - Critical', description: 'Production down' },
  { value: 'P1', label: 'P1 - High', description: 'Major feature broken' },
  { value: 'P2', label: 'P2 - Medium', description: 'Minor feature issue' },
  { value: 'P3', label: 'P3 - Low', description: 'Enhancement request' }
]
```

### **IT Operations Team**
```javascript
severityLevels: [
  { value: 'Critical', label: 'Critical', description: 'Service unavailable' },
  { value: 'Major', label: 'Major', description: 'Significant degradation' },
  { value: 'Minor', label: 'Minor', description: 'Limited impact' },
  { value: 'Cosmetic', label: 'Cosmetic', description: 'UI/UX issues' }
]
```

### **Healthcare Organization**
```javascript
severityLevels: [
  { value: 'L1', label: 'Life-threatening', description: 'Immediate patient risk' },
  { value: 'L2', label: 'Urgent', description: 'Patient care delayed' },
  { value: 'L3', label: 'Standard', description: 'Normal workflow affected' },
  { value: 'L4', label: 'Low', description: 'Administrative impact only' }
]
```

## 🛠️ Troubleshooting

### **Configuration Not Loading**
1. Check browser console for errors
2. Verify JSON syntax in configuration file
3. Refresh page after making changes

### **Dropdowns Empty**
1. Open Configuration Editor
2. Verify items exist in relevant sections
3. Check that values are properly formatted

### **Priority Scoring Issues**
1. Verify level scores are numbers
2. Check scope multipliers are valid decimals
3. Ensure bonus points are integers

## 🚀 Production Deployment

### **Environment-Specific Configuration**
Create different configs for different environments:

```javascript
// config/dev.js
export const DEV_CONFIG = { /* dev settings */ };

// config/prod.js  
export const PROD_CONFIG = { /* production settings */ };

// Use environment variable to select
const config = process.env.NODE_ENV === 'production' ? PROD_CONFIG : DEV_CONFIG;
```

### **Version Control**
- Commit configuration changes to git
- Use pull requests for configuration updates
- Document configuration changes in release notes

## 🎯 Best Practices

1. **Test Changes**: Always test configuration changes in development first
2. **Document Customizations**: Keep notes on why specific values were chosen
3. **Regular Reviews**: Periodically review and update configurations
4. **Backup Configurations**: Export and backup configurations regularly
5. **Team Alignment**: Ensure entire team understands the severity/scope definitions

---

**Need Help?** The configuration system is designed to be intuitive, but if you need assistance, check the browser console for error messages or refer to the source code documentation. 
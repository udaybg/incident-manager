# Incident State Management Documentation

## 📋 Overview

This document describes the complete state management and UI behavior for the Incident Management system. The incident lifecycle follows a linear progression through specific states, with each state having unique UI behaviors and available actions.

## 🔄 State Flow Diagram

```
reported → mitigating → resolved → postmortem → closed
```

## 📊 Detailed State Management

### 1. **REPORTED** State
**Initial state when incident is created**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Start Mitigating" (primary action)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Post an Update section (text box + post button)
- 📍 **Status Bar**: Shows "Reported" as active (green)

#### Actions:
- **Click "Start Mitigating"** → Changes state to `mitigating`

---

### 2. **MITIGATING** State
**Active incident being worked on**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Mark Resolved" (primary action - changed from "Mark as Mitigated")
  - "Mark as duplicate" (always available)
- ✅ **Available Elements**:
  - **Post an Update section** (text box + post button) - **ONLY visible in this state**
  - **Updates display** (always visible to show posted updates)
- 📍 **Status Bar**: Shows "Mitigating" as active (green)

#### Actions:
- **Click "Mark Resolved"** → Changes state to `resolved`
- **Post Updates** → Adds updates to incident timeline

---

### 3. **RESOLVED** State
**Incident has been fixed**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Start Postmortem" (primary action)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Post an Update section (text box + post button)
- 📍 **Status Bar**: 
  - Shows "Resolved" as active (green)
  - **"Resolved" is clickable** → Toggles inline display of posted updates below state-change buttons

#### Actions:
- **Click "Start Postmortem"** → Changes state to `postmortem`
- **Click "Resolved" in status bar** → Shows/hides posted updates inline

---

### 4. **POSTMORTEM** State
**Post-incident analysis phase**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Complete Postmortem" (primary action)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Post an Update section (text box + post button)
- ✅ **Available Elements**:
  - **Postmortem form** (appears below status buttons)
- 📍 **Status Bar**: 
  - Shows "Postmortem" as active (green)
  - **"Mitigating" becomes clickable** → Opens modal to view posted updates

#### Actions:
- **Click "Complete Postmortem"** → Changes state to `closed` (requires all postmortem fields to be filled)
- **Click "Mitigating" in status bar** → Opens updates modal

---

### 5. **CLOSED** State
**Incident lifecycle complete**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Mark as duplicate" (only remaining button)
- ❌ **Hidden Elements**:
  - Primary action button (no more state transitions)
  - Post an Update section (text box + post button)
  - Postmortem form (hidden after completion)
- 📍 **Status Bar**: 
  - Shows "Closed" as active (green)
  - **"Mitigating" is clickable** → Opens modal to view posted updates
  - **"Closed" is clickable** → Opens modal to view completed postmortem

#### Actions:
- **Click "Mitigating" in status bar** → Opens updates modal
- **Click "Closed" in status bar** → Opens postmortem modal

---

## 🎯 Key Business Rules

### Status Transitions
1. **Linear Progression**: States can only move forward, never backward
2. **Required Actions**: Each transition requires explicit user action
3. **No Skipping**: Cannot skip states (e.g., cannot go directly from reported to resolved)

### Post Updates Functionality
- **ONLY available during "mitigating" state**
- Purpose: Document progress, issues, and mitigation steps
- Updates are preserved and viewable in later states via clickable status links

### Postmortem Form
- **ONLY visible during "postmortem" state**
- **All fields are required** before "Complete Postmortem" button works
- Form disappears after completion but data is accessible via "Closed" status link

### Status Bar Hyperlinks
| Current State | Clickable Status | Action |
|---------------|------------------|---------|
| `resolved` | "Resolved" | Toggle inline updates display |
| `postmortem` | "Mitigating" | View updates modal |
| `closed` | "Mitigating" | View updates modal |
| `closed` | "Closed" | View postmortem modal |

---

## 🔧 Technical Implementation

### State Management
```javascript
// Status flow mapping
const statusFlow = {
  'reported': 'mitigating',
  'mitigating': 'resolved', 
  'resolved': 'postmortem',
  'postmortem': 'closed'
};

// Button text mapping  
const buttonTexts = {
  'reported': 'Start Mitigating',
  'mitigating': 'Mark Resolved',
  'resolved': 'Start Postmortem', 
  'postmortem': 'Complete Postmortem'
};
```

### Conditional UI Rendering
```javascript
// Post update section - only during mitigating
{incident.status === 'mitigating' && (
  <PostUpdateSection />
)}

// Updates display - always visible during mitigating, togglable during resolved+
{(incident.status === 'mitigating' || showInlineUpdates) && updates.length > 0 && (
  <UpdatesSection />
)}

// Postmortem form - only during postmortem
{isPostmortemMode && incident.status === 'postmortem' && (
  <PostmortemForm />
)}

// Primary action button - hidden when closed
{incident.status !== 'closed' && (
  <StatusTransitionButton />
)}
```

### Hyperlink Logic
```javascript
const getStatusLink = (statusKey) => {
  if (statusKey === 'resolved' && currentIndex >= 2) {
    return () => setShowInlineUpdates(!showInlineUpdates);
  }
  if (statusKey === 'mitigating' && currentIndex >= 3) {
    return () => setShowUpdatesModal(true);
  }
  if (statusKey === 'closed' && currentIndex >= 4) {
    return () => setShowPostmortemModal(true);
  }
  return null;
};
```

---

## 📱 User Experience Flow

### Typical Incident Lifecycle:
1. **Create Incident** → Status: `reported`
2. **Start Working** → Click "Start Mitigating" → Status: `mitigating`
3. **Document Progress** → Post updates using text box (only available now)
4. **Fix Issue** → Click "Mark Resolved" → Status: `resolved`
5. **Begin Analysis** → Click "Start Postmortem" → Status: `postmortem`
6. **Complete Analysis** → Fill postmortem form → Click "Complete Postmortem" → Status: `closed`

### Information Access:
- **During/After Resolution**: Click "Resolved" in status bar to toggle inline view of all mitigation updates
- **During/After Postmortem**: Click "Mitigating" in status bar to view updates in modal
- **After Closure**: Click "Closed" in status bar to view postmortem analysis in modal

---

## 🚨 Validation Rules

### Postmortem Completion
All fields are required before "Complete Postmortem" works:

**Postmortem Owners:**
- Author *, Contributors *, Organisation *, Accountable Team *, Reviewers *, Bar Raiser *

**Incident Summary:**
- Executive Summary *, Detailed Summary *, Key Learnings *, Mitigation Notes *

**Incident Timestamps:**
- Started At *, Detected At *, Mitigated At *, Resolved At *

**Impact Assessment:**
- Business Impact *, Customer Impact *, Stakeholder Impact *

### Error Handling
- **Missing Fields**: Shows alert with list of missing required fields
- **Invalid Transitions**: System prevents invalid state changes
- **Data Persistence**: All updates and postmortem data are preserved across sessions

---

## 🔍 Testing Checklist

### State Transition Testing:
- [ ] reported → mitigating (button changes, post section appears)
- [ ] mitigating → resolved (button changes, post section disappears, resolved clickable)
- [ ] resolved → postmortem (button changes, postmortem form appears, mitigating clickable)
- [ ] postmortem → closed (button disappears, form disappears, closed clickable)

### UI Element Testing:
- [ ] Post updates only visible during mitigating
- [ ] Updates display always visible during mitigating state
- [ ] Updates display toggles correctly when resolved status is clicked (resolved+ states)
- [ ] Postmortem form only visible during postmortem  
- [ ] Status hyperlinks work correctly
- [ ] Modals display correct data for mitigating/closed states
- [ ] Mark as duplicate always available

### Validation Testing:
- [ ] Cannot complete postmortem with empty fields
- [ ] Error messages show missing fields correctly
- [ ] All required fields marked with asterisks

---

*Last Updated: 2024-01-15*  
*Version: 1.2* 
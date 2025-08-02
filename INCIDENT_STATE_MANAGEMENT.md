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
  - Show Resolution button
  - Show Postmortem button
- 📍 **Status Bar**: Shows "Reported" as active (green)

#### Actions:
- **Click "Start Mitigating"** → Changes state to `mitigating`

---

### 2. **MITIGATING** State
**Active incident being worked on**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Mark Resolved" (primary action)
  - "Mark as duplicate" (always available)
- ✅ **Available Elements**:
  - **Post an Update section** (text box + post button) - **ONLY visible in this state**
  - **Updates display** (always visible inline to show posted updates immediately)
- ❌ **Hidden Elements**:
  - Show Resolution button
  - Show Postmortem button
- 📍 **Status Bar**: Shows "Mitigating" as active (green)

#### Actions:
- **Click "Mark Resolved"** → Changes state to `resolved`
- **Post Updates** → Adds updates to incident timeline (visible immediately below text box)

---

### 3. **RESOLVED** State
**Incident has been fixed**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Start Postmortem" (primary action)
  - "Show Resolution" (opens side panel with posted updates)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Post an Update section (text box + post button)
  - Show Postmortem button
  - Inline updates display (now accessible via side panel)
- 📍 **Status Bar**: 
  - Shows "Resolved" as active (green)

#### Actions:
- **Click "Start Postmortem"** → Changes state to `postmortem` and shows postmortem form
- **Click "Show Resolution"** → Opens side panel displaying all posted updates from mitigation phase

---

### 4. **POSTMORTEM** State
**Post-incident analysis phase**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Complete Postmortem" (primary action)
  - "Show Resolution" (opens side panel with posted updates)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Post an Update section (text box + post button)
  - Show Postmortem button
- ✅ **Available Elements**:
  - **Postmortem form** (editable form for completing analysis)
- 📍 **Status Bar**: 
  - Shows "Postmortem" as active (green)

#### Actions:
- **Click "Complete Postmortem"** → Validates all postmortem fields and changes state to `closed` (automatically closes resolution side panel if validation fails)
- **Click "Show Resolution"** → Opens side panel displaying all posted updates from mitigation phase

---

### 5. **CLOSED** State
**Incident lifecycle complete**

#### UI Elements:
- ✅ **Buttons Available**: 
  - "Show Resolution" (opens side panel with posted updates)
  - "Show Postmortem" (toggles completed postmortem display, **active by default**)
  - "Mark as duplicate" (always available)
- ❌ **Hidden Elements**:
  - Primary action button (no more state transitions)
  - Post an Update section (text box + post button)
  - Editable postmortem form
- ✅ **Available Elements**:
  - **Completed postmortem display** (read-only view below action buttons, **shown by default**)
- 📍 **Status Bar**: 
  - Shows "Closed" as active (green)
  - **"Closed" is clickable** → Opens modal to view completed postmortem

#### Actions:
- **Click "Show Resolution"** → Opens side panel displaying all posted updates from mitigation phase
- **Click "Show Postmortem"** → Toggles display of completed postmortem analysis below action buttons
- **Click "Closed" in status bar** → Opens postmortem modal

#### Default Behavior:
- **Show Postmortem is active by default** when incident loads in closed state

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
// Post update section - only during mitigating (inline)
{incident.status === 'mitigating' && (
  <PostUpdateSection />
)}

// Inline updates display - only visible during mitigating
{incident.status === 'mitigating' && updates.length > 0 && (
  <InlineUpdatesSection />
)}

// Show Resolution button - available from resolved state onwards
{['resolved', 'postmortem', 'closed'].includes(incident.status) && (
  <ShowResolutionButton />
)}

// Show Postmortem button - only available in closed state
{incident.status === 'closed' && (
  <ShowPostmortemButton />
)}

// Resolution side panel - opens when Show Resolution is clicked
{showInlineUpdates && (
  <ResolutionSidePanel />
)}

// Completed postmortem display - read-only view in closed state
{showCompletedPostmortem && incident.status === 'closed' && (
  <CompletedPostmortemDisplay />
)}

// Editable postmortem form - only during postmortem state
{isPostmortemMode && incident.status === 'postmortem' && (
  <EditablePostmortemForm />
)}

// Primary action button - hidden when closed
{incident.status !== 'closed' && (
  <StatusTransitionButton />
)}
```

### Hyperlink Logic
```javascript
const getStatusLink = (statusKey) => {
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
- **During/After Resolution**: Click "Show Resolution" button to open side panel with all mitigation updates
- **After Closure**: Click "Closed" in status bar to view postmortem analysis in modal

### Resolution Side Panel Features:
- **Positioning**: Starts below main header (64px from top) to avoid overlay
- **Resizable**: Drag left edge to adjust width (300px - 800px or 60% of screen)
- **Default Width**: 384px (24rem)
- **Multiple Close Options**: Close button (×), backdrop click, or toggle button
- **Smooth Animations**: Slide-in/out transitions with proper z-indexing
- **Independent Operation**: Works alongside postmortem form without interference

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
- [ ] reported → mitigating (button changes to "Mark Resolved", post section appears)
- [ ] mitigating → resolved (button changes to "Start Postmortem", post section disappears, "Show Resolution" button appears)
- [ ] resolved → postmortem (button changes to "Complete Postmortem", editable postmortem form appears)
- [ ] postmortem → closed (primary button disappears, editable form disappears, "Show Postmortem" button appears, completed postmortem shows by default)

### UI Element Testing:
- [ ] Post updates only visible during mitigating
- [ ] Inline updates display always visible during mitigating state
- [ ] "Show Resolution" button only visible during resolved+ states
- [ ] "Show Postmortem" button only visible during closed state
- [ ] Resolution side panel opens/closes correctly when "Show Resolution" is clicked
- [ ] Side panel has smooth slide-in/out animation
- [ ] Side panel backdrop closes the panel when clicked
- [ ] Side panel does not cover the main header (starts at 64px from top)
- [ ] Side panel is resizable by dragging the left edge
- [ ] Side panel respects minimum width (300px) and maximum width (60% of screen or 800px)
- [ ] Resize cursor appears when hovering over resize handle
- [ ] Editable postmortem form visible during postmortem state
- [ ] Completed postmortem display visible when "Show Postmortem" is clicked in closed state
- [ ] Completed postmortem is shown by default when incident loads in closed state
- [ ] Resolution side panel works independently of postmortem displays
- [ ] Complete Postmortem validation automatically closes resolution side panel on error
- [ ] Status hyperlinks work correctly (only "Closed" has hyperlink)
- [ ] Modals display correct data for closed state
- [ ] Mark as duplicate always available in all states

### Validation Testing:
- [ ] Cannot complete postmortem with empty fields
- [ ] Error messages show missing fields correctly
- [ ] All required fields marked with asterisks

---

*Last Updated: 2024-01-15*  
*Version: 4.0* 
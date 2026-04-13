# Google Forms to Calendar Sync (iPad Cart Scheduler)

A lightweight Google Apps Script that automatically creates calendar events when a Google Form is submitted. Designed for managing shared resources (like iPad carts) across multiple schools or departments while preventing scheduling conflicts.

## 📌 Features
- ✅ Automatically creates calendar events on form submission
- 🔒 Detects and logs scheduling conflicts
- 📧 Sends conflict notification emails to requesters
- 🏫 Supports multiple schools/departments via short-name mapping
- 📊 Logs conflicts to a dedicated sheet for easy tracking

## 🛠️ Setup Instructions

### 1. Prepare Your Google Form
Ensure your form collects responses in this exact order:
1. Timestamp (auto)
2. Email
3. School Name
4. Cart Number
5. Teacher Name
6. Room Number
7. Date of Request
8. Start Time
9. End Time
10. Purpose
11. Number of iPads

### 2. Link to Google Sheets & Apps Script
1. In your Form, click **Responses** → **Link to Sheets**
2. Open the linked Sheet → **Extensions** → **Apps Script**
3. Paste this script into `Code.gs`

### 3. Configure School Mapping
Update the `map` object in `getSchoolShortName()` to match your actual schools and desired calendar short codes:
```javascript
const map = {
  "Your School Name Here": "SHORT_CODE",
  "Another School": "OTHER_CODE"
};

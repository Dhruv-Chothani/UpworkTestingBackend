# Simple Google Sheets Setup (Easiest Method)

This is the **easiest way** to send booking data to your Google Sheet without complex service account setup.

## Method: Google Apps Script Webhook (Recommended for Quick Setup)

### Step 1: Create Google Apps Script

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1aI9-NF9ualBYL_G_ruBefT7sjUGyN-oYTxXi7DmEtGQ/edit
2. Click **Extensions** → **Apps Script**
3. Delete any existing code and paste this:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'append') {
      // Add headers if sheet is empty
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          'Timestamp',
          'Date',
          'Time',
          'Patient Name',
          'Phone',
          'Email',
          'Concern',
          'Status'
        ]);
      }
      
      // Append booking data
      sheet.appendRow([
        data.data.timestamp || new Date().toISOString(),
        data.data.date || '',
        data.data.time || '',
        data.data.patientName || '',
        data.data.phone || '',
        data.data.email || '',
        data.data.concern || '',
        data.data.status || 'pending'
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true }));
    }
    
    if (data.action === 'update') {
      // Find and update status
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][1] === data.data.date && rows[i][2] === data.data.time) {
          sheet.getRange(i + 1, 8).setValue(data.data.status);
          return ContentService.createTextOutput(JSON.stringify({ success: true }));
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }));
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }));
  }
}
```

4. Click **Save** (💾 icon) and give it a name like "Booking Webhook"

### Step 2: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" → Choose **Web app**
3. Set:
   - **Description**: "Booking Webhook"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (or "Anyone with Google account" for more security)
4. Click **Deploy**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/.../exec`)
6. Click **Authorize access** and allow permissions

### Step 3: Add to Backend

Add to your `backend/.env` file:

```
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Replace `YOUR_SCRIPT_ID` with the actual ID from your web app URL.

### Step 4: Restart Backend

```bash
cd backend
npm install
npm run dev
```

## Testing

1. Create a test booking through your frontend
2. Check your Google Sheet - the data should appear automatically
3. Check backend console for any error messages

## Troubleshooting

- **"Script function not found"**: Make sure the function is named `doPost` exactly
- **"Access denied"**: Make sure you set "Who has access" to "Anyone" or authorized properly
- **Data not appearing**: Check backend console logs for errors
- **CORS errors**: The webhook should handle CORS automatically, but if issues persist, add this to your Apps Script:

```javascript
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Advantages of This Method

✅ No service account setup needed  
✅ No JSON key files to manage  
✅ Works immediately after deployment  
✅ Easy to update and modify  
✅ Free and unlimited  

## Security Note

For production, consider:
- Adding authentication token in the webhook
- Restricting access to specific IPs
- Using "Anyone with Google account" instead of "Anyone"



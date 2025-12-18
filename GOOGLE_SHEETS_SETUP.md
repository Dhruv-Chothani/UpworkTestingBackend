# Google Sheets Integration Setup

This guide will help you set up Google Sheets integration so that appointment bookings are automatically sent to your spreadsheet.

## Spreadsheet Details
- **Spreadsheet ID**: `1aI9-NF9ualBYL_G_ruBefT7sjUGyN-oYTxXi7DmEtGQ`
- **URL**: https://docs.google.com/spreadsheets/d/1aI9-NF9ualBYL_G_ruBefT7sjUGyN-oYTxXi7DmEtGQ/edit?usp=sharing

## Setup Methods

### Method 1: Service Account (Recommended)

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Enable Google Sheets API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Give it a name (e.g., "clinic-booking-service")
   - Click "Create and Continue"
   - Skip optional steps and click "Done"

4. **Create Key**
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

5. **Share Spreadsheet with Service Account**
   - Open the downloaded JSON file
   - Copy the `client_email` value (looks like: `your-service@project-id.iam.gserviceaccount.com`)
   - Open your Google Sheet
   - Click "Share" button
   - Paste the service account email
   - Give it "Editor" permission
   - Click "Send"

6. **Add Credentials to Backend**
   - Place the JSON file in your `backend/` folder (or any secure location)
   - Add to `backend/.env`:
     ```
     GOOGLE_APPLICATION_CREDENTIALS=./path/to/your-service-account-key.json
     ```

### Method 2: Service Account (Environment Variables)

Alternatively, you can use environment variables instead of a JSON file:

1. Follow steps 1-5 from Method 1
2. Open the downloaded JSON file
3. Add to `backend/.env`:
   ```
   GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   - Copy the entire `private_key` value from JSON (including BEGIN/END lines)
   - Keep the quotes and `\n` characters

### Method 3: API Key (Less Secure - Only for Public Sheets)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. Add to `backend/.env`:
   ```
   GOOGLE_API_KEY=your-api-key-here
   ```
5. **Important**: Make your spreadsheet publicly editable (not recommended for production)

## Testing

After setup, restart your backend server:
```bash
cd backend
npm install  # Install googleapis package
npm run dev
```

When a booking is created, it should automatically appear in your Google Sheet with these columns:
- Timestamp
- Date
- Time
- Patient Name
- Phone
- Email
- Concern
- Status

## Troubleshooting

- **Error: "The caller does not have permission"**
  - Make sure you shared the spreadsheet with the service account email
  - Check that the service account has "Editor" permission

- **Error: "Requested entity was not found"**
  - Verify the spreadsheet ID is correct
  - Make sure the spreadsheet exists and is accessible

- **Bookings not appearing in Sheets**
  - Check backend console for error messages
  - Verify credentials are correctly set in `.env`
  - Ensure Google Sheets API is enabled in your project

## Notes

- The Sheets integration is non-blocking - if it fails, the booking will still be saved to MongoDB
- Headers are automatically added on first booking
- Status updates are also synced to Sheets when changed in admin panel



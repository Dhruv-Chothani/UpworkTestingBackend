import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Spreadsheet ID from the URL
const SPREADSHEET_ID = '1aI9-NF9ualBYL_G_ruBefT7sjUGyN-oYTxXi7DmEtGQ';
const SHEET_NAME = 'Sheet1'; // Default sheet name

/**
 * Initialize Google Sheets API client
 * Supports both service account (JSON file) and API key methods
 */
const getSheetsClient = async () => {
  try {
    // Method 1: Service Account (Recommended for production)
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.JWT(
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        null,
        process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/spreadsheets']
      );

      await auth.authorize();
      return google.sheets({ version: 'v4', auth });
    }

    // Method 2: Service Account JSON file
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const authClient = await auth.getClient();
      return google.sheets({ version: 'v4', auth: authClient });
    }

    // Method 3: API Key (for public sheets - less secure)
    if (process.env.GOOGLE_API_KEY) {
      return google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });
    }

    throw new Error('No Google Sheets credentials configured');
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw error;
  }
};

/**
 * Append booking data to Google Sheets
 */
export const appendBookingToSheets = async (bookingData) => {
  try {
    const sheets = await getSheetsClient();

    // Prepare row data
    const row = [
      new Date().toISOString(), // Timestamp
      bookingData.date || '',
      bookingData.slotTime || '',
      bookingData.patientName || '',
      bookingData.patientPhone || '',
      bookingData.patientEmail || '',
      bookingData.concern || '',
      bookingData.status || 'pending',
    ];

    // Check if headers exist, if not add them
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
    });

    const headers = response.data.values?.[0];
    if (!headers || headers.length === 0) {
      // Add headers
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[
            'Timestamp',
            'Date',
            'Time',
            'Patient Name',
            'Phone',
            'Email',
            'Concern',
            'Status'
          ]],
        },
      });
    }

    // Append the booking data
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [row],
      },
    });

    console.log('Booking data successfully added to Google Sheets');
    return true;
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    // Don't throw error - allow booking to succeed even if Sheets fails
    return false;
  }
};

/**
 * Update booking status in Google Sheets
 */
export const updateBookingStatusInSheets = async (bookingDate, bookingTime, newStatus) => {
  try {
    const sheets = await getSheetsClient();

    // Get all rows
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:H`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return false;

    // Find the row matching date and time
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][1] === bookingDate && rows[i][2] === bookingTime) {
        rowIndex = i + 1; // Sheets is 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      console.log('Booking not found in Sheets');
      return false;
    }

    // Update status in column H (8th column)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!H${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[newStatus]],
      },
    });

    console.log('Booking status updated in Google Sheets');
    return true;
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    return false;
  }
};



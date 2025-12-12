/**
 * Alternative Google Sheets integration using Webhook/HTTP POST
 * This method uses Google Apps Script to receive data via HTTP POST
 * 
 * Setup:
 * 1. Create a Google Apps Script in your spreadsheet
 * 2. Deploy it as a web app
 * 3. Add the webhook URL to your .env file
 */

/**
 * Send booking data to Google Sheets via webhook
 * This is a simpler alternative to the service account method
 */
export const sendBookingToSheetsWebhook = async (bookingData) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('Google Sheets webhook URL not configured');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'append',
        data: {
          timestamp: new Date().toISOString(),
          date: bookingData.date || '',
          time: bookingData.slotTime || '',
          patientName: bookingData.patientName || '',
          phone: bookingData.patientPhone || '',
          email: bookingData.patientEmail || '',
          concern: bookingData.concern || '',
          status: bookingData.status || 'pending',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    console.log('Booking data successfully sent to Google Sheets via webhook');
    return true;
  } catch (error) {
    console.error('Error sending to Google Sheets webhook:', error);
    return false;
  }
};

/**
 * Update booking status via webhook
 */
export const updateBookingStatusWebhook = async (bookingDate, bookingTime, newStatus) => {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return false;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update',
        data: {
          date: bookingDate,
          time: bookingTime,
          status: newStatus,
        },
      }),
    });

    console.log('Booking status updated in Google Sheets via webhook');
    return true;
  } catch (error) {
    console.error('Error updating Google Sheets via webhook:', error);
    return false;
  }
};


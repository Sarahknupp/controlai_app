export interface SMSConfig {
  accountSid: string;
  authToken: string;
  from: string;
  apiKey?: string;
  apiSecret?: string;
}

export const smsConfig: SMSConfig = {
  accountSid: process.env.SMS_ACCOUNT_SID || '',
  authToken: process.env.SMS_AUTH_TOKEN || '',
  from: process.env.SMS_FROM || '',
  apiKey: process.env.SMS_API_KEY,
  apiSecret: process.env.SMS_API_SECRET
}; 
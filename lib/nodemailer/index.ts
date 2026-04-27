import nodemailer from 'nodemailer';
import {WELCOME_EMAIL_TEMPLATE, NEWS_SUMMARY_EMAIL_TEMPLATE, STOCK_ALERT_UPPER_EMAIL_TEMPLATE, STOCK_ALERT_LOWER_EMAIL_TEMPLATE} from "@/lib/nodemailer/templates";

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro)
        .replace(/{{baseUrl}}/g, process.env.NEXT_PUBLIC_BASE_URL!);

    const mailOptions = {
        from: `"Signalist" <signalist@jsmastery.pro>`,
        to: email,
        subject: `Welcome to Signalist - your stock market toolkit is ready!`,
        text: 'Thanks for joining Signalist',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent)
        .replace(/{{baseUrl}}/g, process.env.NEXT_PUBLIC_BASE_URL!);

    const mailOptions = {
        from: `"Signalist News" <signalist@jsmastery.pro>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Signalist`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendStockAlertEmail = async ({
  email,
  symbol,
  company,
  currentPrice,
  targetPrice,
  type,
  timestamp,
}: {
  email: string;
  symbol: string;
  company: string;
  currentPrice: string;
  targetPrice: string;
  type: 'upper' | 'lower';
  timestamp: string;
}) => {
  const template = type === 'upper' ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;
  const htmlTemplate = template
    .replace(/{{symbol}}/g, symbol)
    .replace(/{{company}}/g, company)
    .replace(/{{currentPrice}}/g, currentPrice)
    .replace(/{{targetPrice}}/g, targetPrice)
    .replace(/{{timestamp}}/g, timestamp)
    .replace(/{{baseUrl}}/g, process.env.NEXT_PUBLIC_BASE_URL!);

  const mailOptions = {
    from: `"Signalist Alerts" <signalist@jsmastery.pro>`,
    to: email,
    subject: `🔔 Price Alert: ${symbol} has reached your target!`,
    text: `${symbol} has reached your target price of ${targetPrice}. Current price is ${currentPrice}.`,
    html: htmlTemplate,
  };

  await transporter.sendMail(mailOptions);
};
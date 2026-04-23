# Signalist

**Signalist** is a next-generation trading intelligence platform designed to empower investors with real-time data and AI-driven insights. Built with modern web technologies, it provides a seamless experience for tracking markets, analyzing stocks, and receiving personalized intelligence reports.

---

## Key Features

- **Real-time Market Data**  
  Stay updated with live quotes, interactive candle charts, and advanced baseline visualizations powered by Finnhub and TradingView.
- **AI-Powered Market Insights**  
  Leverages Gemini 2.5 Flash to summarize complex market news and provide tailored stock analysis directly to your dashboard.

- **Automated Intelligence Workflows**  
  Orchestrated by Inngest, Signalist sends personalized daily news summaries based on your specific watchlist and investment profile.

- **Comprehensive Analysis Tools**  
  Detailed company profiles, technical analysis indicators, and key financials (P/E ratios, market cap, etc.) for thousands of stocks.

- **Smart Watchlist**  
  Manage and monitor your favorite assets with real-time performance tracking and instant access to stock-specific news.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Better-Auth](https://better-auth.com/)
- **Background Jobs**: [Inngest](https://www.inngest.com/)
- **AI Engine**: Google Gemini 2.5 Flash
- **Data Providers**: Finnhub API & TradingView Widgets

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- Finnhub API Key
- Inngest Cloud or Local Dev Server
- Google Gemini API Key

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/oluwatobi-25/TheWheel.git
   cd trade
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**  
   Create a `.env` file in the root directory and add the following:

   ```env
   MONGODB_URI=your_mongodb_uri
   FINNHUB_API_KEY=your_finnhub_key
   INNGEST_EVENT_KEY=your_inngest_key
   GEMINI_API_KEY=your_gemini_key
   BETTER_AUTH_SECRET=your_auth_secret
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Start Inngest Dev Server** (in a separate terminal)
   ```bash
   npx inngest-cli@latest dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Architecture

Signalist uses a modern asynchronous architecture to handle heavy data processing without blocking the UI:

- **Server Actions**: Used for form submissions and data mutations.
- **Inngest Workflows**: Handles long-running tasks like AI news summarization and scheduled email delivery.
- **Caching**: Implements React `cache` and Next.js revalidation for optimized API calls to Finnhub.

---

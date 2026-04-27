import { Inngest } from "inngest"

export const inngest = new Inngest({
    id: "Trade",
    eventKey: process.env.INNGEST_EVENT_KEY,
    signingKey: process.env.INNGEST_SIGNING_KEY,
    ai: { gemini: { apiKey: process.env.GEMINI_API_KEY! } }
});

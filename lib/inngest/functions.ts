process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import {inngest} from "@/lib/inngest/client";
import {NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT} from "@/lib/inngest/prompt";
import {sendNewsSummaryEmail, sendStockAlertEmail, sendWelcomeEmail} from "../nodemailer";
import {email} from "better-auth";
import {getAllUsersForNewsEmail} from "@/lib/actions/user.actions";
import {getWatchlistSymbolsByEmail} from "@/lib/actions/watchlist.actions";
import {getNews, getWatchlistData} from "@/lib/actions/finnhub.actions";
import {formatPrice, getFormattedTodayDate} from "@/lib/utils";
import {Alert} from "@/database/models/alert.model";
import {connectToDatabase} from "@/database/mongoose";

export const sendSignUpEmail = inngest.createFunction(
    { 
        id: 'sign-up-email',
        retries: 2,
        triggers: [{ event: 'app/user.created' }]
    },
    async ({ event, step }) => {
        const userProfile = `
            - Country: ${event.data.country}
            - Investment goals: ${event.data.investmentGoals}
            - Risk tolerance: ${event.data.riskTolerance}
            - Preferred industry: ${event.data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        const response = await step.ai.infer('generate-welcome-intro', {
            model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
            body: {
                contents: [{ role: 'user', parts: [{ text: prompt }]}]
            }
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const introText = (part && 'text' in part ? part.text : null)
            || 'Thanks for joining Signalist. You now have the tools to track markets and make smarter moves.';

        await step.run('send-welcome-email', async () => {
            const { data: { email, name } } = event;
            return await sendWelcomeEmail({ email, name, intro: introText });
        });

        return {
            success: true,
            message: 'Welcome email sent successfully'
        };
    }
);


 export const sendDailyNewsSummary = inngest.createFunction(
     { 
         id: 'daily-news-summary',
         triggers: [ { event: 'app/send.daily.news' }, { cron: '0 12 * * *' } ]
     },
     async ({ step }) => {
        // --- Part 1: Check Stock Alerts ---
        const alerts = await step.run('fetch-active-alerts', async () => {
            await connectToDatabase();
            const activeAlerts = await Alert.find({ isTriggered: false }).lean();
            return JSON.parse(JSON.stringify(activeAlerts));
        });

        if (alerts && alerts.length > 0) {
            const symbols = [...new Set(alerts.map((a: any) => a.symbol))];
            const stockData = await step.run('fetch-current-prices', async () => {
                return await getWatchlistData(symbols as string[]);
            });

            const priceMap = new Map((stockData as any[]).map((s: any) => [s.symbol, s]));
            const triggeredAlerts: any[] = [];

            for (const alert of alerts) {
                const currentData = priceMap.get(alert.symbol);
                if (!currentData) continue;

                const currentPrice = currentData.currentPrice || 0;
                let triggered = false;

                if (alert.alertType === 'upper' && currentPrice >= alert.threshold) {
                    triggered = true;
                } else if (alert.alertType === 'lower' && currentPrice <= alert.threshold) {
                    triggered = true;
                }

                if (triggered) {
                    triggeredAlerts.push({
                        ...alert,
                        currentPrice,
                        priceFormatted: currentData.priceFormatted
                    });
                }
            }

            if (triggeredAlerts.length > 0) {
                await step.run('process-triggered-alerts', async () => {
                    const mongoose = await connectToDatabase();
                    const db = mongoose?.connection.db;
                    if (!db) throw new Error('MongoDB connection not found');

                    for (const alert of triggeredAlerts) {
                        try {
                            const user = await db.collection('user').findOne({ id: alert.userId });
                            if (!user || !user.email) continue;

                            await sendStockAlertEmail({
                                email: user.email,
                                symbol: alert.symbol,
                                company: alert.company,
                                currentPrice: alert.priceFormatted,
                                targetPrice: formatPrice(alert.threshold),
                                type: alert.alertType,
                                timestamp: new Date().toLocaleString()
                            });

                            await Alert.findByIdAndUpdate(alert._id, {
                                isTriggered: true,
                                triggeredAt: new Date(),
                                lastPrice: alert.currentPrice
                            });
                        } catch (e) {
                            console.error(`Error processing alert ${alert._id}:`, e);
                        }
                    }
                });
            }
        }

        // --- Part 2: Daily News Summary ---
        // Note: For testing, this will also run every 60 seconds if cron is set to * * * * *
        // In production, it should be reverted to 12 hours (0 12 * * *) or similar.
         // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if(!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews();
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries: { user: UserForNewsEmail; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
                try {
                    const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                    const response = await step.ai.infer(`summarize-news-${user.email}`, {
                        model: step.ai.models.gemini({ model: 'gemini-2.5-flash-lite' }),
                        body: {
                            contents: [{ role: 'user', parts: [{ text:prompt }]}]
                        }
                    });

                    const part = response.candidates?.[0]?.content?.parts?.[0];
                    const newsContent = (part && 'text' in part ? part.text : null) || 'No market news.'

                    userNewsSummaries.push({ user, newsContent });
                } catch (e) {
                    console.error('Failed to summarize news for : ', user.email);
                    userNewsSummaries.push({ user, newsContent: null });
                }
            }

        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
                await Promise.all(
                    userNewsSummaries.map(async ({ user, newsContent}) => {
                        if(!newsContent) return false;

                        return await sendNewsSummaryEmail({ email: user.email, date: getFormattedTodayDate(), newsContent })
                    })
                )
            })

        return { success: true, message: 'Daily news and alerts processed successfully' }
    }
)
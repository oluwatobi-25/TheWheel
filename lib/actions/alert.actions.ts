'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Alert } from '@/database/models/alert.model';
import { revalidatePath } from 'next/cache';

export async function createAlert(data: {
  userId: string;
  symbol: string;
  company: string;
  alertName: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  frequency: 'once-per-minute' | 'once-per-hour' | 'once-per-day';
}) {
  try {
    await connectToDatabase();
    const alert = await Alert.create(data);
    revalidatePath('/watchlist');
    return { success: true, alert: JSON.parse(JSON.stringify(alert)) };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: 'Failed to create alert' };
  }
}

export async function getAlertsByUserId(userId: string) {
  try {
    await connectToDatabase();
    const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
}

export async function deleteAlert(alertId: string) {
  try {
    await connectToDatabase();
    await Alert.findByIdAndDelete(alertId);
    revalidatePath('/watchlist');
    return { success: true };
  } catch (error) {
    console.error('Error deleting alert:', error);
    return { success: false, error: 'Failed to delete alert' };
  }
}

'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";
import { SignInSchema, SignUpSchema } from "../validations";

export const signUpWithEmail = async (data: SignUpFormData) => {
    try {
        const validatedData = SignUpSchema.safeParse(data);
        if (!validatedData.success) {
            return { success: false, error: validatedData.error.issues[0].message };
        }

        const { email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry } = validatedData.data;

        const response = await auth.api.signUpEmail({ 
            body: { email, password, name: fullName },
            headers: await headers()
        })

        if(response) {
            try {
                await inngest.send({
                    name: 'app/user.created',
                    data: { email, name: fullName, country, investmentGoals, riskTolerance, preferredIndustry }
                })
            } catch (inngestError) {
                console.error('Inngest event send failed:', inngestError);
                // We don't fail the sign up if the background task fails
            }
        }

        console.log('Sign up successful:', response);
        return { success: true, data: response }
    } catch (e) {
        console.error('Sign up error:', e)
        return { success: false, error: e instanceof Error ? e.message : 'Sign up failed' }
    }
}

export const signInWithEmail = async (data: SignInFormData) => {
    try {
        const validatedData = SignInSchema.safeParse(data);
        if (!validatedData.success) {
            return { success: false, error: validatedData.error.issues[0].message };
        }

        const { email, password } = validatedData.data;

        const response = await auth.api.signInEmail({ 
            body: { email, password },
            headers: await headers()
        })

        console.log('Sign in successful');
        return { success: true, data: response }
    } catch (e) {
        console.error('Sign in error:', e)
        return { success: false, error: e instanceof Error ? e.message : 'Sign in failed' }
    }
}

export const signOut = async () => {
    try {
        await auth.api.signOut({ headers: await headers() });
    } catch (e) {
        console.error('Sign out error:', e)
        return { success: false, error: 'Sign out failed' }
    }
}
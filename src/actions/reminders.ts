'use server';

import { generateReminders, type GenerateRemindersInput, type GenerateRemindersOutput, generateTaskReminders, type GenerateTaskRemindersInput, type GenerateTaskRemindersOutput } from "@/ai/flows/generate-reminders";

export async function getReminders(input: GenerateRemindersInput): Promise<GenerateRemindersOutput> {
    return await generateReminders(input);
}

export async function getTaskReminders(input: GenerateTaskRemindersInput): Promise<GenerateTaskRemindersOutput> {
    return await generateTaskReminders(input);
}

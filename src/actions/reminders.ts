'use server';

import { generateReminders, type GenerateRemindersInput, type GenerateRemindersOutput } from "@/ai/flows/generate-reminders";

export async function getReminders(input: GenerateRemindersInput): Promise<GenerateRemindersOutput> {
    return await generateReminders(input);
}

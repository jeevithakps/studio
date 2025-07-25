
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getReminders } from '@/actions/reminders';
import { type Reminder } from '@/ai/flows/generate-reminders';
import { Bell, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { profiles, allItems } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";


export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateReminders = async () => {
    setIsLoading(true);
    setReminders([]);
    try {
      const result = await getReminders({
        profiles,
        items: allItems,
        currentTime: new Date().toISOString(),
      });
      setReminders(result.reminders);
    } catch (error) {
      console.error("Failed to generate reminders:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "The AI could not generate reminders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Smart Reminders</h1>
          <p className="text-muted-foreground">
            AI-powered reminders based on your family's routines and item statuses.
          </p>
        </div>
        <Button onClick={handleGenerateReminders} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Reminders
            </>
          )}
        </Button>
      </header>
      
      {isLoading ? (
        <div className="text-center text-muted-foreground py-16">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 font-semibold">Generating smart reminders...</p>
          <p>The AI is analyzing profiles and item states.</p>
        </div>
      ) : reminders.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reminders.map((reminder, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="text-primary w-5 h-5" />
                  {reminder.title}
                </CardTitle>
                <CardDescription>For: {reminder.profileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reminder.suggestion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
            <Bell className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No Reminders Yet</h3>
            <p className="mt-1">Click the "Generate Reminders" button to get started.</p>
        </div>
      )}
    </div>
  );
}

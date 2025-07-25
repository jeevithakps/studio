
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaskReminders } from '@/actions/reminders';
import { type Reminder } from '@/ai/flows/generate-reminders';
import { Bell, Sparkles, Loader2, AlertTriangle, CalendarClock } from 'lucide-react';
import { profiles, allItems, checklistsData } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";

export default function AgendaPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [upcomingTask, setUpcomingTask] = useState<Reminder | null>(null);
    const { toast } = useToast();

    // This is a temporary solution to re-sync state since we are not using a proper state manager.
    // In a real app, you'd use a state management library or context.
    const [checklists, setChecklists] = useState(checklistsData);
    useEffect(() => {
        const interval = setInterval(() => {
        setChecklists([...checklistsData]);
        }, 500);
        return () => clearInterval(interval);
    });

    useEffect(() => {
        const checkUpcomingTasks = () => {
            const now = new Date();
            const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

            const upcoming = checklists.find(task => {
                if (!task.time) return false;
                const [hours, minutes] = task.time.split(':').map(Number);
                const taskTime = new Date();
                taskTime.setHours(hours, minutes, 0, 0);
                
                return taskTime > now && taskTime <= fifteenMinutesFromNow;
            });

            if (upcoming) {
                const profile = profiles.find(p => p.essentials.some(e => upcoming.items.some(i => i.name === e))) || profiles[0];
                if(profile){
                    const itemsWithLocations = upcoming.items.map(taskItem => {
                        const itemDetails = allItems.find(item => item.id === taskItem.id);
                        return `${taskItem.name} (${itemDetails?.location || 'Unknown'})`;
                    }).join(', ');

                    const suggestion = `It's almost time for "${upcoming.title}". Get your items ready: ${itemsWithLocations}.`;

                    const reminder: Reminder = {
                        profileName: profile.name,
                        title: `Upcoming Task: ${upcoming.title}`,
                        suggestion: suggestion
                    };
                    setUpcomingTask(reminder);
                }
            } else {
                setUpcomingTask(null);
            }
        };

        checkUpcomingTasks();
        const interval = setInterval(checkUpcomingTasks, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [checklists]);

    const handleGenerateReminders = async () => {
        setIsLoading(true);
        setReminders([]); 
        
        try {
            const reminderPromises = checklists.map(task => {
                // Find a relevant profile - simplistic logic for now
                const profile = profiles.find(p => p.essentials.some(e => task.items.some(i => i.name === e))) || profiles[0];
                return getTaskReminders({
                    profile: profile,
                    task: task,
                    items: allItems,
                    currentTime: new Date().toISOString(),
                });
            });

            const results = await Promise.all(reminderPromises);
            const allReminders = results.flatMap(result => result.reminders);
            setReminders(allReminders);

        } catch (error) {
            console.error("Failed to generate task reminders:", error);
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "The AI could not generate task reminders. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-start">
                <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Daily Agenda</h1>
                <p className="text-muted-foreground">
                    A schedule of your timed tasks and AI-powered reminders.
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
                    Generate Agenda Reminders
                    </>
                )}
                </Button>
            </header>

            {upcomingTask && (
                 <Card className="bg-primary/10 border-primary">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-primary w-5 h-5" />
                            <span>{upcomingTask.title}</span>
                        </CardTitle>
                        <CardDescription>For: {upcomingTask.profileName}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold">{upcomingTask.suggestion}</p>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="text-center text-muted-foreground py-16">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 font-semibold">Generating agenda reminders...</p>
                    <p>The AI is analyzing your scheduled tasks.</p>
                </div>
            ) : reminders.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reminders.map((reminder, index) => (
                    <Card key={index}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarClock className="text-primary w-5 h-5" />
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
                    <CalendarClock className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">No Reminders Generated</h3>
                    <p className="mt-1">Click the button to generate reminders for your scheduled tasks.</p>
                </div>
            )}
        </div>
    );
}


'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getReminders } from '@/actions/reminders';
import { type Reminder } from '@/ai/flows/generate-reminders';
import { Bell, Sparkles, Loader2, Plus, X } from 'lucide-react';
import { profiles, allItems } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderSuggestion, setNewReminderSuggestion] = useState('');
  const [newReminderProfile, setNewReminderProfile] = useState('');
  const { toast } = useToast();

  const handleGenerateReminders = async () => {
    setIsLoading(true);
    // Keep existing manual reminders if any, or clear all. Let's clear for now.
    setReminders([]); 
    try {
      const result = await getReminders({
        profiles,
        items: allItems,
        currentTime: new Date().toISOString(),
      });
      // Prepend AI reminders to any existing manual ones
      setReminders(prev => [...result.reminders, ...prev.filter(r => (r as any).manual)]);
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

  const resetAddReminderForm = () => {
    setNewReminderTitle('');
    setNewReminderSuggestion('');
    setNewReminderProfile('');
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim() || !newReminderSuggestion.trim() || !newReminderProfile.trim()) {
       toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields for the new reminder.",
      });
      return;
    }

    const newReminder: Reminder & { manual?: boolean } = {
      title: newReminderTitle,
      suggestion: newReminderSuggestion,
      profileName: newReminderProfile,
      manual: true,
    };

    setReminders(prev => [newReminder, ...prev]);
    resetAddReminderForm();
    setIsAddReminderOpen(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Smart Reminders</h1>
          <p className="text-muted-foreground">
            AI-powered and manual reminders to keep you on track.
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
              Generate AI Reminders
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
            <Card key={index} className={(reminder as any).manual ? 'border-accent' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   {(reminder as any).manual 
                    ? <Plus className="text-accent w-5 h-5" /> 
                    : <Bell className="text-primary w-5 h-5" />
                   }
                  {reminder.title}
                </CardTitle>
                <CardDescription>For: {reminder.profileName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{reminder.suggestion}</p>
              </CardContent>
            </Card>
          ))}
           <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
              <DialogTrigger asChild>
                 <Card
                  className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setIsAddReminderOpen(true)}
                >
                  <div className="text-center text-muted-foreground">
                    <Plus className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">Add Reminder</p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Reminder</DialogTitle>
                  <DialogDescription>Create a custom reminder for any user.</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reminder-title" className="text-right">Title</Label>
                      <Input
                        id="reminder-title"
                        value={newReminderTitle}
                        onChange={(e) => setNewReminderTitle(e.target.value)}
                        placeholder="e.g., 'Water the plants'"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reminder-suggestion" className="text-right">Details</Label>
                      <Textarea
                        id="reminder-suggestion"
                        value={newReminderSuggestion}
                        onChange={(e) => setNewReminderSuggestion(e.target.value)}
                        placeholder="e.g., 'The ferns in the living room look thirsty.'"
                        className="col-span-3"
                      />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reminder-profile" className="text-right">For</Label>
                        <Select onValueChange={setNewReminderProfile} value={newReminderProfile}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                 </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={resetAddReminderForm}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddReminder}>Add Reminder</Button>
                </DialogFooter>
              </DialogContent>
           </Dialog>
        </div>
      ) : (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg col-span-full">
                <Bell className="mx-auto h-12 w-12" />
                <h3 className="mt-4 text-lg font-semibold">No Reminders Yet</h3>
                <p className="mt-1">Click "Generate AI Reminders" or add one manually.</p>
            </div>
             <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
              <DialogTrigger asChild>
                 <Card
                  className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary hover:text-primary transition-colors"
                  onClick={() => setIsAddReminderOpen(true)}
                >
                  <div className="text-center text-muted-foreground">
                    <Plus className="mx-auto h-8 w-8" />
                    <p className="mt-2 font-semibold">Add Reminder</p>
                  </div>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add a New Reminder</DialogTitle>
                  <DialogDescription>Create a custom reminder for any user.</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reminder-title" className="text-right">Title</Label>
                      <Input
                        id="reminder-title"
                        value={newReminderTitle}
                        onChange={(e) => setNewReminderTitle(e.target.value)}
                        placeholder="e.g., 'Water the plants'"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="reminder-suggestion" className="text-right">Details</Label>
                      <Textarea
                        id="reminder-suggestion"
                        value={newReminderSuggestion}
                        onChange={(e) => setNewReminderSuggestion(e.target.value)}
                        placeholder="e.g., 'The ferns in the living room look thirsty.'"
                        className="col-span-3"
                      />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reminder-profile" className="text-right">For</Label>
                        <Select onValueChange={setNewReminderProfile} value={newReminderProfile}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a profile" />
                          </SelectTrigger>
                          <SelectContent>
                            {profiles.map((p) => (
                              <SelectItem key={p.id} value={p.name}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                    </div>
                 </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={resetAddReminderForm}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleAddReminder}>Add Reminder</Button>
                </DialogFooter>
              </DialogContent>
           </Dialog>
        </div>
      )}
    </div>
  );
}

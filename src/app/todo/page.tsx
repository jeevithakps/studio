
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTaskReminders } from '@/actions/reminders';
import { type Reminder } from '@/ai/flows/generate-reminders';
import { Bell, Sparkles, Loader2, AlertTriangle, CalendarClock, Plus, X, Edit } from 'lucide-react';
import { profiles, allItems, todosData, type ToDo, type ChecklistItem } from '@/lib/data';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ToDoPage() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [upcomingTask, setUpcomingTask] = useState<Reminder | null>(null);
    const { toast } = useToast();

    const [todos, setTodos] = useState(todosData);
    
    // Edit state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTodo, setEditingTodo] = useState<ToDo | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editItems, setEditItems] = useState<ChecklistItem[]>([]);

    useEffect(() => {
        if (editingTodo) {
          setEditTitle(editingTodo.title);
          setEditDesc(editingTodo.description);
          setEditTime(editingTodo.time || '');
          setEditItems([...editingTodo.items]);
        }
    }, [editingTodo]);

    const handleOpenEditDialog = (todo: ToDo) => {
        setEditingTodo(todo);
        setIsEditDialogOpen(true);
    };

    const handleUpdateTodo = () => {
        if (!editingTodo) return;

        const updatedTodo = {
        ...editingTodo,
        title: editTitle,
        description: editDesc,
        time: editTime || undefined,
        items: editItems.filter(item => item.name.trim() !== '')
        };
        
        const index = todosData.findIndex(c => c.id === editingTodo.id);
        if (index !== -1) {
            todosData[index] = updatedTodo;
            setTodos([...todosData]);
        }
        
        setEditingTodo(null);
        setIsEditDialogOpen(false);
    };

    const handleEditItemChange = (index: number, value: string) => {
        const updatedItems = [...editItems];
        updatedItems[index].name = value;
        setEditItems(updatedItems);
    };

    const handleAddItemToEditTodo = () => {
        setEditItems([...editItems, { id: `new-${Date.now()}`, name: '' }]);
    };

    const handleRemoveItemFromEditTodo = (index: number) => {
        const updatedItems = editItems.filter((_, i) => i !== index);
        setEditItems(updatedItems);
    };

    // This is a temporary solution to re-sync state since we are not using a proper state manager.
    useEffect(() => {
        const interval = setInterval(() => {
            setTodos([...todosData]);
        }, 500);
        return () => clearInterval(interval);
    });

    useEffect(() => {
        const checkUpcomingTasks = () => {
            const now = new Date();
            const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

            const upcoming = todos.find(task => {
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
    }, [todos]);

    const handleGenerateReminders = async () => {
        setIsLoading(true);
        setReminders([]); 
        
        try {
            const reminderPromises = todos.map(task => {
                const profile = profiles.find(p => p.essentials.some(e => task.items.some(i => i.name === e))) || profiles[0];
                return getTaskReminders({
                    profile: profile,
                    task: { ...task, time: undefined }, // AI doesn't need time for this, so we cast to Checklist
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">To-Do</h1>
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
                    Generate Task Reminders
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {todos.map((todo) => (
                    <Card key={todo.id}>
                    <CardHeader>
                         <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{todo.title}</CardTitle>
                                <CardDescription>{todo.description}</CardDescription>
                                {todo.time && (
                                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                                        <CalendarClock className="h-4 w-4 mr-1" />
                                        <span>{todo.time}</span>
                                    </div>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(todo)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium mb-2">Required Items:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {todo.items.map(item => <li key={item.id}>{item.name}</li>)}
                        </ul>
                    </CardContent>
                    </Card>
                ))}
            </div>

            {isLoading ? (
                <div className="text-center text-muted-foreground py-16">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 font-semibold">Generating task reminders...</p>
                    <p>The AI is analyzing your scheduled tasks.</p>
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
                    <h3 className="mt-4 text-lg font-semibold">No Reminders Generated</h3>
                    <p className="mt-1">Click the button to generate AI reminders for your tasks.</p>
                </div>
            )}
             <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit To-Do Task</DialogTitle>
                    <DialogDescription>
                    Update the details for your to-do task.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-title" className="text-right">
                        Title
                    </Label>
                    <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="col-span-3"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-description" className="text-right">
                        Description
                    </Label>
                    <Textarea
                        id="edit-description"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="col-span-3"
                    />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-time" className="text-right">
                        Time
                        </Label>
                        <Input
                            id="edit-time"
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div>
                    <Label className="mb-2 block">Required Items</Label>
                    <div className="flex flex-col gap-2">
                        {editItems.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2">
                            <Input
                            value={item.name}
                            onChange={(e) => handleEditItemChange(index, e.target.value)}
                            placeholder={`Item ${index + 1}`}
                            />
                            <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItemFromEditTodo(index)}
                            >
                            <X className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddItemToEditTodo} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleUpdateTodo}>Save Changes</Button>
                </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

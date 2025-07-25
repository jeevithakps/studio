'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { checklists } from '@/lib/data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ChecklistsPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);

  const handleCheckboxChange = (checklistId: string, itemId: string) => {
    const key = `${checklistId}-${itemId}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = (checklistId: string) => {
    const list = checklists.find((c) => c.id === checklistId);
    if (!list) return;

    const allItemsChecked = list.items.every(
      (item) => !!checkedItems[`${checklistId}-${item.id}`]
    );

    if (!allItemsChecked) {
      setActiveChecklistId(checklistId);
      setIsAlertOpen(true);
    } else {
      // Handle successful completion
      alert(`${list.title} completed!`);
    }
  };

  const getUncheckedItemsCount = (checklistId: string) => {
    const list = checklists.find((c) => c.id === checklistId);
    if (!list) return 0;
    return list.items.filter((item) => !checkedItems[`${checklistId}-${item.id}`]).length;
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Smart Checklists</h1>
        <p className="text-muted-foreground">
          Customizable checklists to ensure you never forget a thing.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {checklists.map((list) => (
          <Card key={list.id}>
            <CardHeader>
              <CardTitle>{list.title}</CardTitle>
              <CardDescription>{list.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {list.items.map((item) => {
                const key = `${list.id}-${item.id}`;
                return (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={key}
                      checked={!!checkedItems[key]}
                      onCheckedChange={() => handleCheckboxChange(list.id, item.id)}
                    />
                    <Label
                      htmlFor={key}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.name}
                    </Label>
                  </div>
                );
              })}
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleComplete(list.id)} className="w-full">
                Complete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you missing items?</AlertDialogTitle>
            <AlertDialogDescription>
              You have {activeChecklistId ? getUncheckedItemsCount(activeChecklistId) : 0} item(s) unchecked. Do you want to mark them as misplaced? This will help you find them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction>Mark as Misplaced</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

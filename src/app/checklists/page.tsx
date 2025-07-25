'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
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
import { checklistsData, type Checklist, type ChecklistItem } from '@/lib/data';
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
import { useToast } from "@/hooks/use-toast";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<Checklist[]>(checklistsData);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistDesc, setNewChecklistDesc] = useState('');
  const [newChecklistItems, setNewChecklistItems] = useState<string[]>(['']);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);

  const { toast } = useToast();

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
      toast({
        title: "Checklist Complete!",
        description: `You've completed the "${list.title}" checklist.`,
      })
    }
  };

  const getUncheckedItemsCount = (checklistId: string) => {
    const list = checklists.find((c) => c.id === checklistId);
    if (!list) return 0;
    return list.items.filter((item) => !checkedItems[`${checklistId}-${item.id}`]).length;
  };

  const handleItemChange = (index: number, value: string) => {
    const updatedItems = [...newChecklistItems];
    updatedItems[index] = value;
    setNewChecklistItems(updatedItems);
  };

  const handleAddItemToNewChecklist = () => {
    setNewChecklistItems([...newChecklistItems, '']);
  };

  const handleRemoveItemFromNewChecklist = (index: number) => {
    if (newChecklistItems.length > 1) {
      const updatedItems = newChecklistItems.filter((_, i) => i !== index);
      setNewChecklistItems(updatedItems);
    }
  };

  const handleCreateChecklist = () => {
    if (!newChecklistTitle.trim()) return;

    const newChecklist: Checklist = {
      id: `cl-${Date.now()}`,
      title: newChecklistTitle,
      description: newChecklistDesc,
      items: newChecklistItems
        .filter((item) => item.trim() !== '')
        .map((item, index) => ({
          id: `item-${Date.now()}-${index}`,
          name: item,
        })),
    };

    setChecklists([...checklists, newChecklist]);
    resetCreateForm();
    setIsCreateDialogOpen(false);
  };

  const resetCreateForm = () => {
    setNewChecklistTitle('');
    setNewChecklistDesc('');
    setNewChecklistItems(['']);
  };

  const handleOpenAddItemDialog = (checklistId: string) => {
    setEditingChecklistId(checklistId);
    setIsAddItemDialogOpen(true);
  };
  
  const handleConfirmAddItem = () => {
    if (!newItemText.trim() || !editingChecklistId) return;
  
    setChecklists(prevChecklists =>
      prevChecklists.map(list => {
        if (list.id === editingChecklistId) {
          const newItem: ChecklistItem = {
            id: `item-${Date.now()}`,
            name: newItemText,
          };
          return { ...list, items: [...list.items, newItem] };
        }
        return list;
      })
    );
  
    setNewItemText('');
    setEditingChecklistId(null);
    setIsAddItemDialogOpen(false);
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
          <Card key={list.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{list.title}</CardTitle>
              <CardDescription>{list.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 flex-grow">
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
            <CardFooter className="flex justify-between">
              <Button onClick={() => handleComplete(list.id)} className="flex-grow">
                Complete
              </Button>
               <Button variant="outline" size="icon" className="ml-2" onClick={() => handleOpenAddItemDialog(list.id)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Card
              className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary hover:text-primary transition-colors"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <div className="text-center text-muted-foreground">
                <Plus className="mx-auto h-8 w-8" />
                <p className="mt-2 font-semibold">Create New Checklist</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Checklist</DialogTitle>
              <DialogDescription>
                Fill in the details for your new checklist below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Weekend Trip"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newChecklistDesc}
                  onChange={(e) => setNewChecklistDesc(e.target.value)}
                  className="col-span-3"
                  placeholder="A short description of the checklist."
                />
              </div>
              <div>
                <Label className="mb-2 block">Checklist Items</Label>
                <div className="flex flex-col gap-2">
                  {newChecklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItemFromNewChecklist(index)}
                        disabled={newChecklistItems.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddItemToNewChecklist} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetCreateForm}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateChecklist}>Create Checklist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>
              Enter the name of the new item you want to add to the checklist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="new-item-name">Item Name</Label>
            <Input
              id="new-item-name"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="e.g., Sunscreen"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleConfirmAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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

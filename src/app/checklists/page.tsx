
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
import { checklistsData, type Checklist, type ChecklistItem, allItems, profiles, type Item, history, type HistoryItem } from '@/lib/data';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


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
  const [newItemOwner, setNewItemOwner] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemStatus, setNewItemStatus] = useState<'In Place' | 'Misplaced'>('In Place');
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
      // Optional: clear checks on completion
      const newCheckedItems = { ...checkedItems };
      list.items.forEach(item => {
        delete newCheckedItems[`${list.id}-${item.id}`];
      });
      setCheckedItems(newCheckedItems);
    }
  };

  const handleMarkAsMisplaced = () => {
    if (!activeChecklistId) return;
    const list = checklists.find((c) => c.id === activeChecklistId);
    if (!list) return;

    const uncheckedItems = list.items.filter(
      (item) => !checkedItems[`${activeChecklistId}-${item.id}`]
    );

    let itemsMarkedCount = 0;
    uncheckedItems.forEach((uncheckedItem) => {
      const mainItem = allItems.find((item) => item.id === uncheckedItem.id);
      if (mainItem && mainItem.status !== 'Misplaced') {
        mainItem.status = 'Misplaced';
        itemsMarkedCount++;
        
        // Add to history
        const historyEntry: HistoryItem = {
          id: `h-${Date.now()}-${mainItem.id}`,
          date: new Date().toISOString(),
          item: mainItem.name,
          user: mainItem.owner, // Or a generic user if not applicable
          location: mainItem.location, // Location where it was last seen
          status: 'Misplaced',
        };
        history.unshift(historyEntry);
      }
    });

    if (itemsMarkedCount > 0) {
      toast({
        title: "Items Updated",
        description: `${itemsMarkedCount} item(s) have been marked as misplaced and updated on the dashboard.`,
      });
    }

    setIsAlertOpen(false);
    setActiveChecklistId(null);
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

    const newItemsForChecklist: ChecklistItem[] = newChecklistItems
      .filter((item) => item.trim() !== '')
      .map((item, index) => ({
        id: `item-${Date.now()}-${index}`,
        name: item,
      }));

    const newChecklist: Checklist = {
      id: `cl-${Date.now()}`,
      title: newChecklistTitle,
      description: newChecklistDesc,
      items: newItemsForChecklist,
    };
    
    checklistsData.push(newChecklist);
    setChecklists([...checklistsData]);
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
    if (!newItemText.trim() || !editingChecklistId || !newItemOwner.trim() || !newItemLocation.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields for the new item.",
      });
      return;
    }
    
    const list = checklistsData.find(list => list.id === editingChecklistId);

    if (list) {
        const newItemId = `item-${Date.now()}`;
        const newChecklistItem: ChecklistItem = {
            id: newItemId,
            name: newItemText,
        };
        list.items.push(newChecklistItem);
        setChecklists([...checklistsData]);

        const newDashboardItem: Item = {
          id: newItemId,
          name: newItemText,
          owner: newItemOwner,
          location: newItemLocation,
          status: newItemStatus,
          hasTag: false, 
        };
        allItems.push(newDashboardItem);
    }
  
    setNewItemText('');
    setNewItemOwner('');
    setNewItemLocation('');
    setNewItemStatus('In Place');
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
              Enter the details for the new item to add to the checklist and dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-item-name" className="text-right">Name</Label>
              <Input
                id="new-item-name"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="e.g., Sunscreen"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-item-owner" className="text-right">Owner</Label>
               <Select onValueChange={setNewItemOwner} value={newItemOwner}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an owner" />
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-item-location" className="text-right">Location</Label>
              <Input
                id="new-item-location"
                value={newItemLocation}
                onChange={(e) => setNewItemLocation(e.target.value)}
                placeholder="e.g., Bathroom cabinet"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-item-status" className="text-right">Status</Label>
                <Select onValueChange={(value) => setNewItemStatus(value as 'In Place' | 'Misplaced')} value={newItemStatus}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="In Place">In Place</SelectItem>
                        <SelectItem value="Misplaced">Misplaced</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>Cancel</Button>
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
            <AlertDialogAction onClick={handleMarkAsMisplaced}>Mark as Misplaced</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

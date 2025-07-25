
'use client';

import { useState, useEffect } from 'react';
import { MoreHorizontal, Tag, Plus, MapPin, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { allItems, type Item, profiles, type Profile } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";


type RoutineCheck = {
  profile: Profile;
  time: Date;
}

function LocationVerification() {
  const [pendingChecks, setPendingChecks] = useState<RoutineCheck[]>([]);

  useEffect(() => {
    const now = new Date();
    const newPendingChecks: RoutineCheck[] = [];

    profiles.forEach(profile => {
      const returnTimeMatch = profile.routine.match(/Returns at ([\d]{1,2}:[\d]{2} [AP]M)/);
      if (returnTimeMatch) {
        const timeString = returnTimeMatch[1];
        const [time, period] = timeString.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period.toLowerCase() === 'pm' && hours < 12) {
          hours += 12;
        }
        if (period.toLowerCase() === 'am' && hours === 12) {
          hours = 0;
        }

        const routineTime = new Date();
        routineTime.setHours(hours, minutes, 0, 0);

        // Check if routine time was within the last few hours but not in the future
        if (now > routineTime && (now.getTime() - routineTime.getTime()) < 4 * 60 * 60 * 1000) {
           newPendingChecks.push({ profile, time: routineTime });
        }
      }
    });
    setPendingChecks(newPendingChecks);
  }, []);

  const handleConfirmLocation = (profileId: string) => {
    setPendingChecks(prev => prev.filter(p => p.profile.id !== profileId));
     toast({
        title: "Locations Verified",
        description: `Thanks for confirming the locations for ${pendingChecks.find(p => p.profile.id === profileId)?.profile.name}'s items.`,
      });
  };
  
  if (pendingChecks.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pendingChecks.map(({ profile }) => (
        <Card key={profile.id} className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="text-blue-500"/>
              Location Check for {profile.name}
            </CardTitle>
            <CardDescription>
              It looks like {profile.name} has returned. Time to verify the location of their essential items.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc list-inside text-muted-foreground">
              {profile.essentials.map(item => <li key={item}>{item}</li>)}
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleConfirmLocation(profile.id)}>
              <CheckCircle className="mr-2 h-4 w-4"/>
              Confirm Locations
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}


export default function Home() {
  const [items, setItems] = useState<Item[]>(allItems);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemOwner, setNewItemOwner] = useState('');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemStatus, setNewItemStatus] = useState<'In Place' | 'Misplaced'>('In Place');

  const { toast } = useToast();

  // This is a temporary solution to re-sync state since we are not using a proper state manager.
  // In a real app, you'd use a state management library or context.
  useEffect(() => {
    const interval = setInterval(() => {
      setItems([...allItems]);
    }, 500);
    return () => clearInterval(interval);
  });
  
  const resetAddItemForm = () => {
    setNewItemName('');
    setNewItemOwner('');
    setNewItemLocation('');
    setNewItemStatus('In Place');
  };

  const handleAddNewItem = () => {
    if (!newItemName.trim() || !newItemOwner.trim() || !newItemLocation.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields.",
      });
      return;
    }

    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: newItemName,
      owner: newItemOwner,
      location: newItemLocation,
      status: newItemStatus,
      hasTag: false, 
    };
    
    allItems.unshift(newItem); // Add to the beginning of the list
    setItems([...allItems]);
    resetAddItemForm();
    setIsAddItemDialogOpen(false);
  };


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          A real-time overview of all your tracked items.
        </p>
      </header>

      <LocationVerification />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
              <CardTitle>All Items</CardTitle>
              <CardDescription>
                Manage your family's belongings and their current status.
              </CardDescription>
            </div>
             <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="-ml-1 mr-2 h-4 w-4" />
                  Add New Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                  <DialogDescription>
                    Track a new item by providing its details below.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-name" className="text-right">Name</Label>
                    <Input
                      id="item-name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., TV Remote"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-owner" className="text-right">Owner</Label>
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
                    <Label htmlFor="item-location" className="text-right">Location</Label>
                    <Input
                      id="item-location"
                      value={newItemLocation}
                      onChange={(e) => setNewItemLocation(e.target.value)}
                      placeholder="e.g., Living Room"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="item-status" className="text-right">Status</Label>
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
                    <Button variant="outline" onClick={resetAddItemForm}>Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleAddNewItem}>Add Item</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    {item.hasTag && <Tag className="w-4 h-4 text-accent" />}
                    {item.name}
                  </TableCell>
                  <TableCell>{item.owner}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Misplaced" ? "destructive" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Mark as Found</DropdownMenuItem>
                        <DropdownMenuItem>View History</DropdownMenuItem>
                        {item.hasTag && <DropdownMenuItem>Find with Bluetooth</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

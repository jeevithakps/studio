
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profiles, type Profile } from '@/lib/data';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProfilesPage() {
  const [allProfiles, setAllProfiles] = useState<Profile[]>(profiles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRole, setNewProfileRole] = useState('');
  const [newProfileRoutine, setNewProfileRoutine] = useState('');
  const [newProfileEssentials, setNewProfileEssentials] = useState<string[]>(['']);

  const handleEssentialItemChange = (index: number, value: string) => {
    const updatedItems = [...newProfileEssentials];
    updatedItems[index] = value;
    setNewProfileEssentials(updatedItems);
  };

  const handleAddEssentialItem = () => {
    setNewProfileEssentials([...newProfileEssentials, '']);
  };

  const handleRemoveEssentialItem = (index: number) => {
    if (newProfileEssentials.length > 1) {
      const updatedItems = newProfileEssentials.filter((_, i) => i !== index);
      setNewProfileEssentials(updatedItems);
    }
  };

  const resetForm = () => {
    setNewProfileName('');
    setNewProfileRole('');
    setNewProfileRoutine('');
    setNewProfileEssentials(['']);
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim() || !newProfileRole.trim()) return;

    const newProfile: Profile = {
      id: `profile-${Date.now()}`,
      name: newProfileName,
      role: newProfileRole,
      avatar: 'https://placehold.co/100x100.png',
      routine: newProfileRoutine,
      essentials: newProfileEssentials.filter((item) => item.trim() !== ''),
    };

    profiles.push(newProfile);
    setAllProfiles([...profiles]);
    resetForm();
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Family Profiles</h1>
        <p className="text-muted-foreground">
          Manage profiles, routines, and essential items for each family member.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {allProfiles.map((profile) => (
          <Card key={profile.id} className="flex flex-col">
            <CardHeader className="items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>{profile.role}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <h4 className="font-semibold mb-2">Daily Routine</h4>
              <p className="text-sm text-muted-foreground mb-4">
                {profile.routine}
              </p>
              <h4 className="font-semibold mb-2">Essential Items</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {profile.essentials.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Card
              className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary hover:text-primary transition-colors"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="text-center text-muted-foreground">
                <Plus className="mx-auto h-8 w-8" />
                <p className="mt-2 font-semibold">Add New Profile</p>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Profile</DialogTitle>
              <DialogDescription>
                Create a new profile for a family member.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Jane Doe"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  value={newProfileRole}
                  onChange={(e) => setNewProfileRole(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Teenager"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="routine" className="text-right">
                  Routine
                </Label>
                <Textarea
                  id="routine"
                  value={newProfileRoutine}
                  onChange={(e) => setNewProfileRoutine(e.target.value)}
                  className="col-span-3"
                  placeholder="Describe their daily routine."
                />
              </div>
              <div>
                <Label className="mb-2 block">Essential Items</Label>
                <div className="flex flex-col gap-2">
                  {newProfileEssentials.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleEssentialItemChange(index, e.target.value)}
                        placeholder={`Item ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEssentialItem(index)}
                        disabled={newProfileEssentials.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={handleAddEssentialItem} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddProfile}>Add Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

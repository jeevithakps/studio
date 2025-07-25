
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, X, Edit } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // State for new profile
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRole, setNewProfileRole] = useState('');
  const [newProfileRoutine, setNewProfileRoutine] = useState('');
  const [newProfileEssentials, setNewProfileEssentials] = useState<string[]>(['']);

  // State for editing profile
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileRole, setEditProfileRole] = useState('');
  const [editProfileRoutine, setEditProfileRoutine] = useState('');
  const [editProfileEssentials, setEditProfileEssentials] = useState<string[]>(['']);

  useEffect(() => {
    if (editingProfile) {
      setEditProfileName(editingProfile.name);
      setEditProfileRole(editingProfile.role);
      setEditProfileRoutine(editingProfile.routine);
      setEditProfileEssentials(editingProfile.essentials.length > 0 ? editingProfile.essentials : ['']);
    }
  }, [editingProfile]);

  const handleEssentialItemChange = (index: number, value: string, isEdit: boolean) => {
    if (isEdit) {
      const updatedItems = [...editProfileEssentials];
      updatedItems[index] = value;
      setEditProfileEssentials(updatedItems);
    } else {
      const updatedItems = [...newProfileEssentials];
      updatedItems[index] = value;
      setNewProfileEssentials(updatedItems);
    }
  };

  const handleAddEssentialItem = (isEdit: boolean) => {
    if (isEdit) {
      setEditProfileEssentials([...editProfileEssentials, '']);
    } else {
      setNewProfileEssentials([...newProfileEssentials, '']);
    }
  };

  const handleRemoveEssentialItem = (index: number, isEdit: boolean) => {
    if (isEdit) {
        if (editProfileEssentials.length > 1) {
            const updatedItems = editProfileEssentials.filter((_, i) => i !== index);
            setEditProfileEssentials(updatedItems);
        }
    } else {
        if (newProfileEssentials.length > 1) {
            const updatedItems = newProfileEssentials.filter((_, i) => i !== index);
            setNewProfileEssentials(updatedItems);
        }
    }
  };

  const resetAddForm = () => {
    setNewProfileName('');
    setNewProfileRole('');
    setNewProfileRoutine('');
    setNewProfileEssentials(['']);
  };
  
  const resetEditForm = () => {
    setEditingProfile(null);
    setEditProfileName('');
    setEditProfileRole('');
    setEditProfileRoutine('');
    setEditProfileEssentials(['']);
  }

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
    resetAddForm();
    setIsAddDialogOpen(false);
  };
  
  const handleOpenEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateProfile = () => {
    if (!editingProfile || !editProfileName.trim() || !editProfileRole.trim()) return;

    const updatedProfile: Profile = {
      ...editingProfile,
      name: editProfileName,
      role: editProfileRole,
      routine: editProfileRoutine,
      essentials: editProfileEssentials.filter((item) => item.trim() !== ''),
    };

    const profileIndex = profiles.findIndex(p => p.id === editingProfile.id);
    if (profileIndex !== -1) {
      profiles[profileIndex] = updatedProfile;
      setAllProfiles([...profiles]);
    }
    
    resetEditForm();
    setIsEditDialogOpen(false);
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
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => handleOpenEditDialog(profile)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Card
              className="flex items-center justify-center border-dashed cursor-pointer hover:border-primary hover:text-primary transition-colors"
              onClick={() => setIsAddDialogOpen(true)}
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
                        onChange={(e) => handleEssentialItemChange(index, e.target.value, false)}
                        placeholder={`Item ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEssentialItem(index, false)}
                        disabled={newProfileEssentials.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleAddEssentialItem(false)} className="mt-2">
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={resetAddForm}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddProfile}>Add Profile</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the details for {editingProfile?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editProfileName}
                onChange={(e) => setEditProfileName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Input
                id="edit-role"
                value={editProfileRole}
                onChange={(e) => setEditProfileRole(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-routine" className="text-right">
                Routine
              </Label>
              <Textarea
                id="edit-routine"
                value={editProfileRoutine}
                onChange={(e) => setEditProfileRoutine(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div>
              <Label className="mb-2 block">Essential Items</Label>
              <div className="flex flex-col gap-2">
                {editProfileEssentials.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => handleEssentialItemChange(index, e.target.value, true)}
                      placeholder={`Item ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEssentialItem(index, true)}
                      disabled={editProfileEssentials.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => handleAddEssentialItem(true)} className="mt-2">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={resetEditForm}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

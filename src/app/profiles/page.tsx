import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profiles } from '@/lib/data';

export default function ProfilesPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Family Profiles</h1>
        <p className="text-muted-foreground">
          Manage profiles, routines, and essential items for each family member.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {profiles.map((profile) => (
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
        <Card className="flex items-center justify-center border-dashed">
            <div className="text-center text-muted-foreground">
                <p className="text-4xl">+</p>
                <p>Add New Profile</p>
            </div>
        </Card>
      </div>
    </div>
  );
}

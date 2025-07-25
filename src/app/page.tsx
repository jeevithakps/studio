
'use client';

import { useState } from 'react';
import { MoreHorizontal, Tag } from "lucide-react";
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
import { allItems, type Item } from "@/lib/data";

export default function Home() {
  const [items, setItems] = useState<Item[]>(allItems);

  // This is a temporary solution to re-sync state since we are not using a proper state manager.
  // In a real app, you'd use a state management library or context.
  useState(() => {
    const interval = setInterval(() => {
      if (items.length !== allItems.length) {
        setItems([...allItems]);
      }
    }, 1000);
    return () => clearInterval(interval);
  });


  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
        <p className="text-muted-foreground">
          A real-time overview of all your tracked items.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>All Items</CardTitle>
          <CardDescription>
            Manage your family's belongings and their current status.
          </CardDescription>
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


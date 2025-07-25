
export type Profile = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  routine: string;
  essentials: string[];
};

export type Item = {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'In Place' | 'Misplaced';
  hasTag: boolean;
};

export type ChecklistItem = {
  id: string;
  name: string;
  checked?: boolean;
};

export type Checklist = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  time?: string; // Format HH:mm
};

export type HistoryItem = {
    id: string;
    date: string;
    item: string;
    user: string;
    location: string;
    status: 'In Place' | 'Misplaced';
}

export const profiles: Profile[] = [
  {
    id: '1',
    name: 'Alex',
    role: 'Working Parent',
    avatar: 'https://placehold.co/100x100.png',
    routine: 'Leaves for office at 8:30 AM. Returns at 6:00 PM.',
    essentials: ['Laptop Bag', 'Car Keys', 'Office ID'],
  },
  {
    id: '2',
    name: 'Leo',
    role: 'School Kid',
    avatar: 'https://placehold.co/100x100.png',
    routine: 'Goes to school at 7:30 AM. Returns at 3:00 PM.',
    essentials: ['School Bag', 'Lunch Box', 'Water Bottle'],
  },
  {
    id: '3',
    name: 'Grandma May',
    role: 'Elderly',
    avatar: 'https://placehold.co/100x100.png',
    routine: 'Morning walk at 7:00 AM. Evening stroll at 5:00 PM.',
    essentials: ['Reading Glasses', 'Walking Cane', 'Medication Box'],
  },
];

export const allItems: Item[] = [
  {
    id: 'item-1',
    name: 'Laptop Bag',
    owner: 'Alex',
    location: 'Study Room',
    status: 'In Place',
    hasTag: true,
  },
  {
    id: 'item-2',
    name: 'Car Keys',
    owner: 'Alex',
    location: 'Kitchen Counter',
    status: 'In Place',
    hasTag: true,
  },
  {
    id: 'item-3',
    name: 'School Bag',
    owner: 'Leo',
    location: "Leo's Room",
    status: 'In Place',
    hasTag: true,
  },
  {
    id: 'item-4',
    name: 'Lunch Box',
    owner: 'Leo',
    location: 'Kitchen Counter',
    status: 'Misplaced',
    hasTag: false,
  },
  {
    id: 'item-5',
    name: 'Reading Glasses',
    owner: 'Grandma May',
    location: 'Living Room Sofa',
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-6',
    name: 'Walking Cane',
    owner: 'Grandma May',
    location: 'Entrance',
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-x1',
    name: 'Water Bottle',
    owner: 'Leo',
    location: 'Kitchen Counter',
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-x2',
    name: 'Homework Folder',
    owner: 'Leo',
    location: "Leo's Room",
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-y1',
    name: 'Office ID',
    owner: 'Alex',
    location: 'Study Room',
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-y2',
    name: 'Wallet',
    owner: 'Alex',
    location: 'Entryway Table',
    status: 'In Place',
    hasTag: true,
  },
  {
    id: 'item-z1',
    name: 'House Keys',
    owner: 'Grandma May',
    location: 'Key Hook',
    status: 'In Place',
    hasTag: false,
  },
  {
    id: 'item-z2',
    name: 'Light Jacket',
    owner: 'Grandma May',
    location: 'Closet',
    status: 'In Place',
    hasTag: false,
  },
];

export const checklistsData: Checklist[] = [
    {
        id: 'cl-1',
        title: 'Morning School Run',
        description: "For Leo before he leaves for school.",
        items: [
            { id: 'item-3', name: 'School Bag' },
            { id: 'item-4', name: 'Lunch Box' },
            { id: 'item-x1', name: 'Water Bottle' },
            { id: 'item-x2', name: 'Homework Folder' },
        ],
        time: '07:15',
    },
    {
        id: 'cl-2',
        title: 'Work Departure',
        description: "For Alex before leaving for the office.",
        items: [
            { id: 'item-1', name: 'Laptop Bag' },
            { id: 'item-2', name: 'Car Keys' },
            { id: 'item-y1', name: 'Office ID' },
            { id: 'item-y2', name: 'Wallet' },
        ],
        time: '08:30',
    },
    {
        id: 'cl-3',
        title: 'Evening Walk',
        description: "For Grandma May's evening stroll.",
        items: [
            { id: 'item-5', name: 'Reading Glasses' },
            { id: 'item-z1', name: 'House Keys' },
            { id: 'item-z2', name: 'Light Jacket' },
        ],
        time: '17:00'
    },
    {
        id: 'cl-4',
        title: 'Review Homework',
        description: 'Check Leo\'s homework.',
        items: [
            { id: 'item-x2', name: 'Homework Folder' }
        ],
        time: '19:00',
    }
];

export const history: HistoryItem[] = [
    {
        id: 'h-1',
        date: '2024-07-28T09:00:00Z',
        item: 'Car Keys',
        user: 'Alex',
        location: 'Kitchen Counter',
        status: 'In Place'
    },
    {
        id: 'h-2',
        date: '2024-07-28T08:30:00Z',
        item: 'Lunch Box',
        user: 'Leo',
        location: 'Dining Table',
        status: 'Misplaced'
    },
    {
        id: 'h-3',
        date: '2024-07-27T17:00:00Z',
        item: 'Reading Glasses',
        user: 'Grandma May',
        location: 'Living Room Sofa',
        status: 'In Place'
    },
    {
        id: 'h-4',
        date: '2024-07-27T08:00:00Z',
        item: 'Laptop Bag',
        user: 'Alex',
        location: 'Study Room',
        status: 'In Place'
    },
    {
        id: 'h-5',
        date: '2024-07-26T15:00:00Z',
        item: 'School Bag',
        user: 'Leo',
        location: 'Leo\'s Room',
        status: 'In Place'
    }
]

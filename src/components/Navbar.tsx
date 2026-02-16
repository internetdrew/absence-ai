import { Button } from '@/components/ui/button';
import { Bus, Info } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';

const children = [
  {
    name: 'Emma Martinez',
    description: '10th Grade - ID: EM-12345',
    route: 14,
    schedule: [
      {
        title: 'English Literature',
        period: 1,
        timeframe: '8:00 AM - 8:45 AM',
        teacher: 'Ms. Johnson',
      },
      {
        title: 'Algebra II',
        period: 2,
        timeframe: '8:50 AM - 9:35 AM',
        teacher: 'Mr. Chen',
      },
      {
        title: 'World History',
        period: 3,
        timeframe: '9:40 AM - 10:25 AM',
        teacher: 'Ms. Williams',
      },
      {
        title: 'Biology',
        period: 4,
        timeframe: '10:30 AM - 11:15 AM',
        teacher: 'Mr. Rodriguez',
      },
      {
        title: 'Lunch',
        period: 5,
        timeframe: '11:20 AM - 12:00 PM',
        teacher: 'N/A',
      },
      {
        title: 'Spanish III',
        period: 6,
        timeframe: '12:05 PM - 12:50 PM',
        teacher: 'Ms. Garcia',
      },
      {
        title: 'Physical Education',
        period: 7,
        timeframe: '12:55 PM - 1:40 PM',
        teacher: 'Coach Thompson',
      },
      {
        title: 'Computer Science',
        period: 8,
        timeframe: '1:45 PM - 2:30 PM',
        teacher: 'Mr. Park',
      },
    ],
  },
  {
    name: 'Luca Martinez',
    description: '9th Grade - ID: LM-67890',
    route: 14,
    schedule: [
      {
        title: 'Language Arts',
        period: 1,
        timeframe: '8:00 AM - 8:45 AM',
        teacher: 'Ms. Lee',
      },
      {
        title: 'Pre-Algebra',
        period: 2,
        timeframe: '8:50 AM - 9:35 AM',
        teacher: 'Mr. Martinez',
      },
      {
        title: 'Science',
        period: 3,
        timeframe: '9:40 AM - 10:25 AM',
        teacher: 'Dr. Zhang',
      },
      {
        title: 'Social Studies',
        period: 4,
        timeframe: '10:30 AM - 11:15 AM',
        teacher: 'Mr. Thompson',
      },
      {
        title: 'Lunch',
        period: 5,
        timeframe: '11:20 AM - 12:00 PM',
        teacher: 'N/A',
      },
      {
        title: 'Art',
        period: 6,
        timeframe: '12:05 PM - 12:50 PM',
        teacher: 'Ms. Brown',
      },
      {
        title: 'Music',
        period: 7,
        timeframe: '12:55 PM - 1:40 PM',
        teacher: 'Mr. Davis',
      },
      {
        title: 'Physical Education',
        period: 8,
        timeframe: '1:45 PM - 2:30 PM',
        teacher: 'Coach Foster',
      },
    ],
  },
];

const Navbar = () => {
  return (
    <nav className='p-4 flex items-center justify-end'>
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            size='xs'
            variant='outline'
            className='text-pink-600 hover:text-pink-600'
          >
            <Info /> Demo Info
          </Button>
        </DrawerTrigger>
        <DrawerContent className='max-w-lg mx-auto'>
          <ScrollArea className='h-[55vh]'>
            <DrawerHeader className='group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left'>
              <DrawerTitle>Demo Info</DrawerTitle>
              <DrawerDescription>
                This demo is built to demonstrate how agentic systems can be
                used to save human time in multi-step processes. In this demo,
                you can play the role of a parent putting in for a day off for
                one or more of their children.
              </DrawerDescription>
            </DrawerHeader>
            <div className='p-4'>
              <h3 className='font-medium mb-1'>You</h3>
              <h4 className='font-medium text-neutral-600'>Maria Martinez</h4>
              <p className='text-muted-foreground text-sm'>
                Proud mom of Emma and Luca.
              </p>
              <h3 className='font-medium mt-6 mb-1'>Your Children</h3>
              <div className='space-y-12'>
                {children.map(child => {
                  return (
                    <div key={child.name}>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h4 className='font-medium text-neutral-600'>
                            {child.name}
                          </h4>
                          <p className='text-muted-foreground text-sm'>
                            {child.description}
                          </p>
                        </div>
                        <Badge variant='secondary'>
                          <Bus data-icon='inline-start' />
                          Route {child.route}
                        </Badge>
                      </div>

                      <div className='mt-2'>
                        <h5 className='font-medium mb-2 text-sm text-muted-foreground'>
                          Daily Schedule
                        </h5>
                        {child.schedule.map((item, index) => (
                          <div
                            key={index}
                            className='p-2 flex items-center ring-1 ring-neutral-300/50 rounded-md mb-2'
                          >
                            <span className='bg-pink-600/60 p-3 text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium mr-4 ml-1'>
                              {index + 1}
                            </span>{' '}
                            <div className='text-sm flex flex-col w-full'>
                              <div className='flex items-center justify-between'>
                                <span className='font-medium'>
                                  {item.title}
                                </span>
                                <span className='text-xs text-muted-foreground'>
                                  {item.timeframe}
                                </span>
                              </div>
                              <span className='text-muted-foreground '>
                                {item.teacher}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* <ItemGroup className='gap-2'>
                {children.map(child => (
                  <Item key={child.name} variant='outline'>
                    <ItemContent>
                      <ItemTitle>{child.name}</ItemTitle>
                      <ItemDescription>{child.description}</ItemDescription>

                      <h4 className='mt-4 font-medium text-muted-foreground'>
                        Daily Schedule
                      </h4>
                      <ul>
                        {child.schedule.map((item, index) => (
                          <li key={index} className='py-2 flex items-center'>
                            <span className='text-pink-600 font-medium mr-4 ml-1'>
                              {index + 1}
                            </span>{' '}
                            <div className='flex flex-col gap-1'>
                              <div>
                                <span className='font-medium'>
                                  {item.title}
                                </span>
                                <span className='ml-1 text-xs text-muted-foreground '>
                                  ({item.teacher})
                                </span>
                              </div>
                              <span className='text-xs text-muted-foreground'>
                                {item.timeframe}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup> */}
            </div>
            <DrawerFooter>
              {/* <Button>Submit</Button>
              <DrawerClose>
                <Button variant='outline'>Cancel</Button>
              </DrawerClose> */}
            </DrawerFooter>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default Navbar;

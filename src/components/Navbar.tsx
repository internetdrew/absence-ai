import { Button } from '@/components/ui/button';
import { Bus, Info } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from './ui/badge';
import { CHILDREN } from '@/constants';

const Navbar = () => {
  return (
    <nav className='p-4 flex items-center justify-end'>
      <Drawer>
        <DrawerTrigger asChild>
          <Button size='xs' variant='outline'>
            <Info /> Demo Info
          </Button>
        </DrawerTrigger>
        <DrawerContent className='max-w-lg mx-auto'>
          <ScrollArea className='h-[80dvh] pb-6'>
            <DrawerHeader className='group-data-[vaul-drawer-direction=bottom]/drawer-content:text-left'>
              <DrawerTitle>Demo Info</DrawerTitle>
              <DrawerDescription>
                This demo is built to demonstrate how agentic systems can be
                used to save human time in multi-step processes. In this demo,
                you can play the role of a parent (who is logged into their
                account) putting in for a day off for one or more of their
                children.
                <br />
                <br />
                The tasks that follow a call like this could possibly take a
                staff member up to around 5 minutes to complete, per absence,
                but with the help of LLMs, we can automate this process and
                decide where we put a human in the process (perhaps for final
                approval or check).
                <br />
                <br />
                This is just one example of how AI can be used to save time and
                reduce friction in our daily lives.
              </DrawerDescription>
            </DrawerHeader>
            <div className='p-4'>
              <h3 className='font-semibold mb-1'>You</h3>
              <h4 className='font-medium text-neutral-600'>Maria Martinez</h4>
              <p className='text-muted-foreground text-sm'>
                Proud mom of Emma and Luca.
              </p>
              <h3 className='font-semibold mt-6 mb-1'>Your Children</h3>
              <div className='space-y-12'>
                {CHILDREN.map(child => {
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
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </nav>
  );
};

export default Navbar;

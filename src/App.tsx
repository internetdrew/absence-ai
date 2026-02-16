import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import Navbar from './components/Navbar';
import { Button } from './components/ui/button';
import { AudioLines, NotepadText, PhoneOff, Send } from 'lucide-react';
import { Textarea } from './components/ui/textarea';

function App() {
  return (
    <>
      <Navbar />
      <span className='mx-auto text-sm mt-4 text-center block font-medium'>
        An AI-Powered Demo
      </span>
      <h1 className='text-2xl font-bold text-center mt-6'>
        School Absence System
      </h1>
      <p className='text-center text-sm text-muted-foreground mt-2 max-w-sm mx-auto px-6 sm:px-4 md:px-0'>
        A demonstration of how AI can streamline the process of reporting and
        managing student absences.
      </p>

      <div className='max-w-xl mx-auto mt-12 mb-4 px-4'>
        <Card>
          <CardHeader className='px-4'>
            <CardTitle>Report a Student Absence</CardTitle>
            <CardDescription>
              Give us the details and we'll take care of the rest.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon' className='size-4'>
                  <NotepadText />
                </EmptyMedia>
                <EmptyTitle className='text-base'>Log a new absence</EmptyTitle>
                <EmptyDescription>
                  Type a message or tap the voice button to tell us which
                  student(s) will be absent, when, and why...
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
          <CardFooter className='flex flex-col gap-4 px-4'>
            <Textarea
              placeholder='Enter absence details here...'
              className='field-sizing-content resize-none'
            />
            <div className='ml-auto'>
              {/* <Button
                size={'icon'}
                variant='ghost'
                className='rounded-full active:scale-90 transition-transform'
                >
                <Send />
                </Button> */}
              <Button
                size={'sm'}
                className='active:scale-95 transition-transform'
              >
                <AudioLines />
                Start voice chat
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}

export default App;

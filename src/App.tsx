import { useState } from 'react';
import Navbar from './components/Navbar';
import ChatCard from './components/ChatCard';
import Absences from './components/Absences';
import { Button } from './components/ui/button';
import type { Absence } from './types';

function App() {
  const [absences, setAbsences] = useState<Absence[]>([]);

  return (
    <>
      <Navbar />

      <h1 className='text-2xl font-bold text-center mt-6'>
        School Absence System
      </h1>
      <p className='text-center text-sm text-muted-foreground mt-2 max-w-sm mx-auto px-6 sm:px-4 md:px-0'>
        A demonstration of how AI can streamline the process of reporting and
        managing student absences.
      </p>

      <div className='max-w-lg mx-auto mt-12 mb-4 px-4'>
        {absences.length > 0 ? (
          <>
            <Absences absences={absences} />
            <div className='flex item-center justify-center'>
              <Button onClick={() => setAbsences([])}>
                Report Another Absence
              </Button>
            </div>
          </>
        ) : (
          <ChatCard setAbsences={setAbsences} />
        )}
      </div>
    </>
  );
}

export default App;

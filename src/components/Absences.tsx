import type { Absence } from '@/types';
import AbsenceCard from './AbsenceCard';

const Absences = ({ absences }: { absences: Absence[] }) => {
  const dateSortedAbsences = [...absences].sort((a, b) => {
    const dateA = new Date(a.start_date).getTime();
    const dateB = new Date(b.start_date).getTime();
    return dateA - dateB;
  });

  return (
    <div>
      <div className='max-w-md mx-auto'>
        <span className='font-medium text-muted-foreground text-sm'>
          Absence{absences.length !== 1 ? 's' : ''} Reported
        </span>
        <ul className='space-y-2 mt-2 mb-6'>
          {dateSortedAbsences.map((absence, index) => (
            <AbsenceCard
              key={`absence-${index}`}
              absence={absence}
              index={index}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Absences;

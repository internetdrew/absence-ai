import {
  BellElectric,
  Calendar,
  ClipboardList,
  Stethoscope,
  User,
  Watch,
} from 'lucide-react';
import type { Absence } from '@/types';
import { format } from 'date-fns';

const absenceTypeMapping: Record<Absence['type'], string> = {
  full_day: 'Full Day',
  partial_day: 'Partial Day',
};

const AbsenceCard = ({
  absence,
  index,
}: {
  absence: Absence;
  index: number;
}) => {
  return (
    <li
      key={`absence-${index}`}
      className='border rounded-lg overflow-hidden bg-stone-500/10 p-1'
    >
      <header className='flex items-center gap-2 text-sm font-medium px-2'>
        <User className='w-4 h-4 fill-stone-50 text-stone-600' />
        {absence.student_name}
      </header>

      <div className='bg-stone-50 rounded-md mt-2 py-1 text-stone-600 text-sm'>
        <div className='flex items-center gap-2 p-2'>
          <Calendar className='w-4 h-4 fill-transparent' />

          {(() => {
            const [year, month, day] = absence.start_date
              .split('-')
              .map(Number);
            return format(new Date(year, month - 1, day), 'MMMM d, yyyy');
          })()}
        </div>
        <div className='flex items-center gap-2 p-2'>
          <ClipboardList className='w-4 h-4 fill-transparent' />
          {absence.reason.charAt(0).toUpperCase() + absence.reason.slice(1)}
        </div>
        <div className='flex items-center gap-2 p-2'>
          <Watch className='w-4 h-4 fill-transparent' />
          {absenceTypeMapping[absence.type]}
        </div>
        <div className='flex items-center gap-2 p-2'>
          <BellElectric className='w-4 h-4 fill-transparent' />
          {absence.periods_affected === 'All'
            ? 'All Periods'
            : `Periods ${absence.periods_affected.join(', ')}`}
        </div>
        {absence.nurse_notes && (
          <div className='flex items-center gap-2 p-2'>
            <Stethoscope className='w-4 h-4 fill-transparent shrink-0' />
            <p>
              {absence.nurse_notes.has_fever
                ? 'Fever reported. '
                : 'No fever. '}
              {absence.nurse_notes.has_vomiting
                ? 'Vomiting reported. '
                : 'No vomiting. '}
              {absence.nurse_notes.tested_positive_for?.covid
                ? 'Tested positive for COVID. '
                : 'Not tested positive for COVID. '}
              {absence.nurse_notes.tested_positive_for?.flu
                ? 'Tested positive for flu. '
                : 'Not tested positive for flu. '}
              {absence.nurse_notes.other_symptoms
                ? `${absence.nurse_notes.other_symptoms.charAt(0).toUpperCase() + absence.nurse_notes.other_symptoms.slice(1)}.`
                : 'No other symptoms reported.'}
            </p>
          </div>
        )}
      </div>
    </li>
  );
};

export default AbsenceCard;

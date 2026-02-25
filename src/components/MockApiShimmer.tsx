import { AnimatePresence, motion } from 'motion/react';
import { ShimmeringText } from './ui/shimmering-text';
import { useEffect, useState } from 'react';
import {
  BusFront,
  CircleCheck,
  Hospital,
  Mail,
  ShieldCheck,
  SquareLibrary,
  Utensils,
} from 'lucide-react';

const updateSteps = [
  {
    icon: <SquareLibrary className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Updating PowerSchool SIS attendance record',
  },
  {
    icon: <Mail className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Notifying teachers via email',
  },
  {
    icon: <BusFront className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Updating bus route information',
  },
  {
    icon: <Utensils className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Waiving lunch charges in cafeteria system',
  },
  {
    icon: <Hospital className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Logging medical absence with school nurse',
  },
  {
    icon: <ShieldCheck className='w-3.5 h-3.5 fill-transparent' />,
    message: 'Notifying front desk security of early dismissal',
  },
  {
    icon: <CircleCheck className='w-3.5 h-3.5 fill-transparent' />,
    message: 'All systems updated',
  },
];

const MockApiShimmer = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (stepIndex >= updateSteps.length - 1) return;
    const interval = setInterval(() => {
      setStepIndex(prev => {
        if (prev < updateSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [stepIndex]);

  return (
    <div className='mt-2 px-2 pb-0.5'>
      <>
        <AnimatePresence mode='wait'>
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className='flex items-center gap-1.5 text-xs text-muted-foreground'
          >
            {updateSteps[stepIndex].icon}
            <ShimmeringText
              text={updateSteps[stepIndex].message}
              className='text-xs'
            />
          </motion.div>
        </AnimatePresence>
      </>
    </div>
  );
};

export default MockApiShimmer;

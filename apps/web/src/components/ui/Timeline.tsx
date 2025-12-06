import { Check } from 'lucide-react';
import clsx from 'clsx';

interface TimelineStep {
  label: string;
  completed: boolean;
  current?: boolean;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="relative">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div key={index} className="relative flex items-start mb-8 last:mb-0">
            {/* Linha conectora */}
            {!isLast && (
              <div
                className={clsx(
                  'absolute left-4 top-10 w-0.5 h-full -ml-px',
                  step.completed ? 'bg-primary' : 'bg-gray-300'
                )}
              />
            )}

            {/* Círculo/ícone */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2',
                  {
                    'bg-primary border-primary': step.completed,
                    'bg-white border-primary': step.current && !step.completed,
                    'bg-white border-gray-300': !step.current && !step.completed,
                  }
                )}
              >
                {step.completed ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <div
                    className={clsx('w-3 h-3 rounded-full', {
                      'bg-primary': step.current,
                      'bg-gray-300': !step.current,
                    })}
                  />
                )}
              </div>
            </div>

            {/* Texto */}
            <div className="ml-4 flex-1">
              <p
                className={clsx('font-semibold', {
                  'text-dark': step.completed || step.current,
                  'text-gray-500': !step.completed && !step.current,
                })}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}


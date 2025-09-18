import { OutlineButton, PrimaryButton } from '@/components/custom/Buttons'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { defineStepper } from '@stepperize/react'
import { CircleCheckIcon, CircleIcon } from 'lucide-react'
import { Fragment } from 'react'
import FilterOutputColumnsForm from './FilterOutputColumnsForm'
import MapStagesForm from './MapStagesForm'
import MatchInputColumnsForm from './MatchInputColumnsForm'

const { Scoped, useStepper, steps } = defineStepper(
  { id: 'step1', label: 'Step 1', schema: '' },
  { id: 'step2', label: 'Step 2', schema: '' },
  { id: 'step3', label: 'Step 3', schema: '' }
)

const IntegrateCrmForm = () => {
  const stepper = useStepper()

  return (
    <Scoped>
      <nav aria-label='Integrate CRM steps' className='group my-2'>
        <ol
          className='flex w-[40%] items-center justify-between rounded-2xl border p-2'
          aria-orientation='horizontal'
        >
          {stepper.all.map((step, index, array) => (
            <Fragment key={step.id}>
              <li className='flex items-center justify-center'>
                <Button
                  type='button'
                  role='tab'
                  variant='link'
                  aria-current={stepper.current.id === step.id ? 'step' : undefined}
                  aria-posinset={index + 1}
                  aria-setsize={steps.length}
                  aria-selected={stepper.current.id === step.id}
                  className={`m-0 flex h-4 w-4 items-center justify-center p-0`}
                  onClick={() => stepper.goTo(step.id)}
                >
                  {index < stepper.current.index ? (
                    <CircleCheckIcon className='text-success' absoluteStrokeWidth strokeWidth={2} />
                  ) : index === stepper.current.index ? (
                    <CircleIcon
                      absoluteStrokeWidth
                      strokeWidth={4}
                      className='rounded-full bg-accent text-primary'
                    />
                  ) : (
                    <div className='h-full w-full rounded-full bg-secondary' />
                  )}
                </Button>
                <span
                  className={`px-2 text-sm font-normal ${
                    index < stepper.current.index
                      ? 'text-success'
                      : index === stepper.current.index
                        ? 'text-foreground'
                        : 'text-secondary-foreground'
                  }`}
                >
                  {step.label}
                </span>
              </li>
              {index < array.length - 1 && (
                <Separator
                  className={`m-0 h-1 flex-1 rounded-full p-0 ${
                    index < stepper.current.index ? 'bg-success-background' : 'bg-secondary'
                  }`}
                />
              )}
            </Fragment>
          ))}
        </ol>
      </nav>
      {stepper.switch({
        step1: () => <MatchInputColumnsForm onSuccess={() => {}} />,
        step2: () => <FilterOutputColumnsForm onSuccess={() => {}} />,
        step3: () => <MapStagesForm onSuccess={() => {}} />,
      })}
      <DialogFooter>
        <div className='flex flex-row justify-end gap-4'>
          <OutlineButton className='w-30' onClick={stepper.prev} disabled={stepper.isFirst}>
            Previous
          </OutlineButton>
          <PrimaryButton className='w-30' onClick={stepper.next}>
            {stepper.isLast ? 'Done' : 'Next'}
          </PrimaryButton>
        </div>
      </DialogFooter>
    </Scoped>
  )
}

export default IntegrateCrmForm

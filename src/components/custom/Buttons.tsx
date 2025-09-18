import { Button, ButtonProps } from '@/components/ui/button'
import { CheckCircle2Icon, CircleXIcon, Loader2 } from 'lucide-react'

export const PrimaryButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={`h-fit rounded-full px-2 py-1 font-light hover:bg-accent hover:text-foreground ${className}`}
      {...props}
    />
  )
}

export const ClearButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      variant={'outline'}
      className={`h-fit rounded-full border border-destructive bg-transparent px-2 py-1 font-light text-destructive hover:bg-destructive-accent hover:text-destructive ${className}`}
      {...props}
    />
  )
}

export const OutlineButton: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      variant={'outline'}
      className={`h-fit rounded-full border border-foreground px-2 py-1 font-normal text-foreground hover:bg-accent ${className}`}
      {...props}
    />
  )
}

export const InProgressState: React.FC<ButtonProps & { rate: number }> = ({
  className,
  rate,
  ...props
}) => {
  return (
    <Button
      className={`h-fit w-full cursor-default rounded-full bg-success-background px-2 py-1 font-normal text-success shadow-none hover:bg-success-background ${className}`}
      {...props}
    >
      <Loader2 className='animate-spin' /> In Progress ({rate}%)
    </Button>
  )
}

export const ConnectedState: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={`h-fit w-fit cursor-default rounded-full bg-success-background px-2 py-1 font-normal text-success shadow-none hover:bg-success-background ${className}`}
      {...props}
    >
      <CheckCircle2Icon /> Connected
    </Button>
  )
}

export const LiveState: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={`h-fit w-fit cursor-default rounded-full bg-success-background px-2 py-1 font-normal text-success shadow-none hover:bg-success-background ${className}`}
      {...props}
    >
      <CheckCircle2Icon /> Connected
    </Button>
  )
}

export const ErrorState: React.FC<ButtonProps> = ({ className, ...props }) => {
  return (
    <Button
      className={`h-fit w-full cursor-default rounded-full bg-destructive-accent px-2 py-1 font-normal text-destructive shadow-none hover:bg-destructive-accent ${className}`}
      {...props}
    >
      <CircleXIcon /> Error
    </Button>
  )
}

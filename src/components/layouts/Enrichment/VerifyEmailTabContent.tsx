import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'

import { ClearButton, PrimaryButton } from '@/components/custom/Buttons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import DisabledTabs from './DisabledTabs'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
})

const SingleForm = ({ onSuccess, onReset }: { onSuccess: () => void; onReset?: () => void }) => {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  const onCancel = () => {
    if (onReset) onReset()
    form.reset()
  }

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log('Form submitted:', data)
    onSuccess()
    if (form.formState.isValid) form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 py-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium text-secondary-foreground after:ml-1 after:text-red-500 after:content-["*"]'>
                Enter Name
              </FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder='Type Here'
                  {...field}
                  className='border-none bg-background'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='font-medium text-secondary-foreground after:ml-1 after:text-red-500 after:content-["*"]'>
                Enter Email Id
              </FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='Type Here'
                  {...field}
                  className='border-none bg-background'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex justify-end gap-4'>
          <ClearButton onClick={onCancel}>Cancel</ClearButton>
          <PrimaryButton type='submit'>Submit</PrimaryButton>
        </div>
      </form>
    </Form>
  )
}

const VerifyEmailTabContent = () => {
  const tabStyles =
    'rounded-full px-4 data-[state=inactive]:text-foreground data-[state=inactive]:font-normal data-[state=active]:bg-accent'
  const [resultDisabled, setResultDisabled] = useState(true)

  return (
    <div className='flex flex-row gap-x-8'>
      <div className='mt-4 flex flex-1 flex-col'>
        <h3 className='text-lg font-semibold'>Choose Method</h3>
        <p className='py-4 text-sm'>
          Single entry: Enrich a single entity. Bulk: Upload a csv or xlsx list with data{' '}
        </p>
        <Tabs defaultValue={'Single'} className='w-full'>
          <TabsList className='h-fit gap-x-4 rounded-full bg-background px-2 py-1'>
            <TabsTrigger value={'Single'} className={tabStyles}>
              Single
            </TabsTrigger>
            <TabsTrigger value={'Bulk'} className={tabStyles}>
              Bulk
            </TabsTrigger>
          </TabsList>
          <TabsContent value={'Single'}>
            <SingleForm
              onSuccess={() => setResultDisabled(false)}
              onReset={() => setResultDisabled(true)}
            />
          </TabsContent>
          <TabsContent value={'Bulk'}>{/* <MediaUpload /> */}</TabsContent>
        </Tabs>
      </div>
      <div className='mt-4 flex flex-1 flex-col'>
        <Tabs defaultValue={'Profile Card'} className='w-full'>
          <div className='flex flex-row items-start justify-between'>
            <h3 className='text-lg font-semibold'>Result</h3>
            {resultDisabled ? (
              <DisabledTabs />
            ) : (
              <TabsList className='h-fit gap-x-4 rounded-full bg-background px-2 py-1'>
                <TabsTrigger value={'Profile Card'} className={tabStyles} disabled={resultDisabled}>
                  Profile Card
                </TabsTrigger>
                <TabsTrigger value={'JSON'} className={tabStyles} disabled={resultDisabled}>
                  JSON
                </TabsTrigger>
              </TabsList>
            )}
          </div>
          <div className='h-4' />
          {resultDisabled ? (
            <p className='text-sm text-secondary-foreground'>
              Search a prospect to see the details!
            </p>
          ) : (
            <>
              <TabsContent value={'Profile Card'}>
                <div>Profile Card tab content</div>
              </TabsContent>
              <TabsContent value={'JSON'}>
                <div>JSON tab content</div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default VerifyEmailTabContent

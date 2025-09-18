import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle2 } from 'lucide-react';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { createCampaign } from '@/services/campaigns';

const SourceSchema = z.object({
  source_id: z.string().uuid().optional(),
  source_type: z.enum(['file_upload', 'audience']),
  file_name: z.string().nullable().optional(),
  audience_id: z.string().nullable().optional(),
  created_at: z.date().optional(),
});

const CampaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().max(150, 'Description must be under 150 characters'),
  type: z.enum(['outbound', 'performance']),
  start_date: z.date(),
  channel: z.enum(['ai_call', 'call', 'email', 'whatsapp']),
  channel_configuration: z.object({
    agent: z.enum(['sales', 'presales']).optional(),
  }).optional(),
  sources: z.array(SourceSchema),
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type Source = z.infer<typeof SourceSchema>;

const CreateCampaignView: React.FC = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const mutation = useMutation({
    mutationKey: ['campaign'],
    mutationFn: async (data: Campaign) => {
      return createCampaign({
        ...data,
        sources: data.sources || [],
      });
    },
    onSuccess: () => {
      toast.success('Campaign created Successfully!');
      setStep(1);
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign. Please try again.');
    }
  });

  const onSubmit = (data: Campaign) => {
    mutation.mutate(data);
  };

  const form = useForm<Campaign>({
    resolver: zodResolver(CampaignSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'outbound',
      channel: 'ai_call',
      start_date: new Date(),
      sources: [],
      channel_configuration: {},
    },
  });

  const steps = [
    { number: 1, title: "Campaign Details" },
    { number: 2, title: "Channel Setup" },
    { number: 3, title: "Sources" },
  ];

  const addSource = (sourceType: 'file_upload' | 'audience') => {
    const currentSources = form.getValues('sources') || [];
    const newSource: Source = {
      source_type: sourceType,
      created_at: new Date(),
    };
    form.setValue('sources', [...currentSources, newSource]);
  };

  const removeSource = (sourceIdToRemove: string) => {
    const currentSources = form.getValues('sources') || [];
    form.setValue('sources', 
      currentSources.filter(source => source.source_id !== sourceIdToRemove)
    );
  };

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold text-slate-800 mb-2'>Create Campaign</h1>
        <p className='text-slate-500 mb-8'>Set up your new marketing campaign in just a few steps</p>

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 transition-all duration-300 -z-10"
              style={{ width: `${(step - 1) / (totalSteps - 1) * 100}%` }}
            ></div>

            {steps.map((s) => (
              <div key={s.number} className="flex flex-col items-center space-y-2">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full shadow-sm
                    ${s.number < step ? 'bg-blue-500 text-white' :
                      s.number === step ? 'bg-white border-2 border-blue-500 text-blue-500' :
                        'bg-white border border-slate-200 text-slate-400'}
                    transition-all duration-200
                  `}
                >
                  {s.number < step ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    s.number
                  )}
                </div>
                <span className={`text-sm font-medium ${s.number <= step ? 'text-slate-800' : 'text-slate-400'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-none shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-600 pb-8 pt-6">
            <CardTitle className="text-white text-xl">
              {step === 1 ? "Campaign Details" : 
               step === 2 ? "Channel Setup" : 
               "Campaign Sources"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 -mt-4 bg-white rounded-t-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Campaign Details Step */}
                {step === 1 && (
                  <div className="space-y-5">
                    <FormField
                      name="name"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Campaign Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter campaign name"
                              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Brief campaign description"
                              className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="type"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Campaign Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500/20 focus:border-blue-500">
                              {field.value}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="outbound">Outbound</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="start_date"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem className='space-x-4'>
                          <FormLabel>Start Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="ghost">
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Channel Setup Step */}
                {step === 2 && (
                  <div className="space-y-5">
                    <FormField
                      name="channel"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700">Communication Channel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="border-slate-200 focus:ring-blue-500/20 focus:border-blue-500">
                              {field.value}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ai_call">AI Call</SelectItem>
                              <SelectItem value="call">Human Call</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />

                    {form.watch('channel') === 'ai_call' && (
                      <FormField
                        name="channel_configuration.agent"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700">Agent Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <SelectTrigger className="border-slate-200 focus:ring-blue-500/20 focus:border-blue-500">
                                {field.value || 'Select agent type'}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sales">Sales Agent</SelectItem>
                                <SelectItem value="presales">Presales Agent</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {/* Sources Step */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant={'default'}
                        onClick={() => addSource('audience')}
                      >
                        Add Audience Source
                      </Button>
                      <Button 
                        type="button" 
                        variant={'default'}
                        onClick={() => addSource('file_upload')}
                      >
                        Add File Upload Source
                      </Button>
                    </div>

                    {form.watch('sources')?.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-700">Added Sources</h3>
                        {form.watch('sources')?.map((source) => (
                          <div 
                            key={source.source_id} 
                            className="flex justify-between items-center p-3 bg-slate-100 rounded-md"
                          >
                            <span className="capitalize">
                              {source.source_type.replace('_', ' ')}
                            </span>
                            <Button 
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeSource(source.source_id!)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 mt-8 border-t border-slate-100">
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step < totalSteps && (
                    <Button
                      type="button"
                      onClick={() => setStep(step + 1)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Continue
                    </Button>
                  )}
                  
                  {step === totalSteps && (
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Create Campaign
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateCampaignView;

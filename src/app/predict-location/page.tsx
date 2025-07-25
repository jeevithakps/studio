'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { BrainCircuit, Loader2, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getPrediction } from '@/actions/predict';
import type { PredictLocationOutput } from '@/ai/flows/predict-location';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast"


const formSchema = z.object({
  itemCharacteristics: z.string().min(2, {
    message: 'Please describe the item (e.g., "small blue wallet").',
  }),
  userHabits: z.string().min(2, {
    message: 'Describe any relevant habits (e.g., "often leaves keys on the counter").',
  }),
  additionalContext: z.string().optional(),
});

export default function PredictLocationPage() {
  const [prediction, setPrediction] = useState<PredictLocationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemCharacteristics: '',
      userHabits: '',
      additionalContext: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await getPrediction({
        ...values,
        timeOfDay: new Date().toLocaleTimeString(),
      });
      setPrediction(result);
    } catch (error) {
      console.error('Prediction failed:', error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "The AI could not make a prediction. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Location Prediction</h1>
        <p className="text-muted-foreground">
          Use AI to predict where your misplaced item might be.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible for a better prediction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="itemCharacteristics"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Characteristics</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., My red car keys" {...field} />
                      </FormControl>
                      <FormDescription>
                        Size, color, type of item, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userHabits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User Habits</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Usually drops things on the entryway table after work."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Where does the owner usually keep this item?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="additionalContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Context (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., The kids were playing in the living room earlier."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Any other clues? Last time seen, recent activities, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Predicting...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Predict Location
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">AI is thinking...</p>
            </div>
          ) : prediction ? (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="text-primary" />
                  Prediction Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{prediction.predictedLocation}</h3>
                  <p className="text-sm text-muted-foreground">Most Likely Location</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Confidence Level</span>
                        <span>{Math.round(prediction.confidenceLevel * 100)}%</span>
                    </div>
                    <Progress value={prediction.confidenceLevel * 100} />
                </div>
                <div>
                  <h4 className="font-semibold">Reasoning</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{prediction.reasoning}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              <BrainCircuit className="mx-auto h-12 w-12" />
              <p className="mt-4">Your prediction will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Building, Home, HardHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { NIGERIAN_STATES } from '@/types/mortgage';
import type { ApplicationFormData } from '../ApplicationWizard';

const propertySchema = z.object({
  propertyFound: z.boolean().default(false),
  propertyType: z.enum(['off_plan', 'completed', 'construction']),
  propertyValue: z.coerce.number().min(5000000, 'Minimum property value ₦5,000,000'),
  loanAmount: z.coerce.number().min(3000000, 'Minimum loan amount ₦3,000,000'),
  tenure: z.coerce.number().min(5, 'Minimum 5 years').max(30, 'Maximum 30 years'),
  state: z.string().min(1, 'Please select a state'),
  city: z.string().min(2, 'City is required'),
  propertyAddress: z.string().optional(),
}).refine((data) => data.loanAmount <= data.propertyValue * 0.85, {
  message: 'Loan amount cannot exceed 85% of property value/budget',
  path: ['loanAmount'],
}).refine((data) => !data.propertyFound || (data.propertyFound && data.propertyAddress && data.propertyAddress.length >= 10), {
  message: 'Please provide a detailed address for the property',
  path: ['propertyAddress'],
});
type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const propertyTypes = [
  { 
    value: 'completed', 
    label: 'Completed Property', 
    description: 'Ready to move in',
    icon: Home 
  },
  { 
    value: 'off_plan', 
    label: 'Off-Plan', 
    description: 'Under construction by developer',
    icon: Building 
  },
  { 
    value: 'construction', 
    label: 'Self-Build', 
    description: 'Building your own home',
    icon: HardHat 
  },
];

export function PropertyStep({ formData, updateFormData, onNext, onPrev }: PropertyStepProps) {
  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      propertyFound: formData.propertyFound || false,
      propertyType: formData.propertyType,
      propertyValue: formData.propertyValue || 25000000,
      loanAmount: formData.loanAmount || 20000000,
      tenure: formData.tenure || 15,
      state: formData.state,
      city: formData.city,
      propertyAddress: formData.propertyAddress || '',
    },
  });

  const propertyFound = form.watch('propertyFound');
  const propertyValue = form.watch('propertyValue');
  const loanAmount = form.watch('loanAmount');
  const tenure = form.watch('tenure');

  const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
  const maxLoan = propertyValue * 0.85;

  const onSubmit = (data: PropertyFormData) => {
    updateFormData(data);
    onNext();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Estimate monthly payment (simplified)
  const estimatedRate = 0.16; // 16% annual
  const monthlyRate = estimatedRate / 12;
  const months = tenure * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Property & Loan Details</CardTitle>
        <CardDescription>
          Tell us about the property you want to finance and your preferred loan terms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Have you found a property toggle */}
            <FormField
              control={form.control}
              name="propertyFound"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-primary/5">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Have you found a property yet?
                    </FormLabel>
                    <FormDescription>
                      Turn this on if you already have a specific property you want to buy.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Property Type Selection */}
            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                    {propertyTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => field.onChange(type.value)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all",
                          field.value === type.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <type.icon className={cn(
                          "w-8 h-8",
                          field.value === type.value ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="text-center">
                          <p className="font-medium text-sm">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="propertyValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{propertyFound ? "Property Asking Price (₦)" : "Target Property Budget (₦)"}</FormLabel>
                    <FormControl>
                      <Input type="number" min={5000000} step={1000000} {...field} />
                    </FormControl>
                    <FormDescription>{formatCurrency(Number(field.value))}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="loanAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Amount Required (₦)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={3000000} 
                        max={maxLoan}
                        step={500000} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {formatCurrency(Number(field.value))} ({ltv.toFixed(1)}% LTV)
                      <span className={cn(
                        "ml-2",
                        ltv > 80 ? "text-destructive" : "text-primary"
                      )}>
                        • Max: {formatCurrency(maxLoan)}
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tenure Slider */}
            <FormField
              control={form.control}
              name="tenure"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel>Loan Tenure</FormLabel>
                    <span className="text-sm font-medium text-primary">{field.value} years</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={5}
                      max={30}
                      step={1}
                      className="mt-2"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5 years</span>
                    <span>30 years</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Payment Preview */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(monthlyPayment || 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on ~16% interest rate. Actual rate varies by lender.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NIGERIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City/LGA</FormLabel>
                    <FormControl>
                      <Input placeholder="Lekki" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {propertyFound && (
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the full property address or development name"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button type="submit" className="gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

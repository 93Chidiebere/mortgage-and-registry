import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Briefcase, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { ApplicationFormData } from '../ApplicationWizard';

const employmentSchema = z.object({
  employmentType: z.enum(['salaried', 'self_employed']),
  employerName: z.string().min(2, 'Employer/Business name is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  yearsEmployed: z.coerce.number().min(0.5, 'Minimum 6 months employment required'),
  monthlyIncome: z.coerce.number().min(100000, 'Minimum income ₦100,000'),
  additionalIncome: z.coerce.number().min(0),
  existingObligations: z.coerce.number().min(0),
});

type EmploymentFormData = z.infer<typeof employmentSchema>;

interface EmploymentStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function EmploymentStep({ formData, updateFormData, onNext, onPrev }: EmploymentStepProps) {
  const form = useForm<EmploymentFormData>({
    resolver: zodResolver(employmentSchema),
    defaultValues: {
      employmentType: formData.employmentType,
      employerName: formData.employerName,
      jobTitle: formData.jobTitle,
      yearsEmployed: formData.yearsEmployed,
      monthlyIncome: formData.monthlyIncome,
      additionalIncome: formData.additionalIncome,
      existingObligations: formData.existingObligations,
    },
  });

  const employmentType = form.watch('employmentType');

  const onSubmit = (data: EmploymentFormData) => {
    updateFormData(data);
    onNext();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Employment & Income</CardTitle>
        <CardDescription>
          Tell us about your employment and income. This helps us match you with suitable mortgage products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Employment Type Selection */}
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <button
                      type="button"
                      onClick={() => field.onChange('salaried')}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                        field.value === 'salaried'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Briefcase className={cn(
                        "w-8 h-8",
                        field.value === 'salaried' ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="text-center">
                        <p className="font-medium">Salaried</p>
                        <p className="text-xs text-muted-foreground">I work for a company</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('self_employed')}
                      className={cn(
                        "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                        field.value === 'self_employed'
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Building2 className={cn(
                        "w-8 h-8",
                        field.value === 'self_employed' ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="text-center">
                        <p className="font-medium">Self-Employed</p>
                        <p className="text-xs text-muted-foreground">I own a business</p>
                      </div>
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {employmentType === 'salaried' ? 'Employer Name' : 'Business Name'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={employmentType === 'salaried' ? 'ABC Corporation Ltd' : 'My Business Ltd'} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {employmentType === 'salaried' ? 'Job Title' : 'Role/Position'}
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="yearsEmployed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years in Current Role</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min={0} placeholder="2.5" {...field} />
                    </FormControl>
                    <FormDescription>Minimum 6 months required</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Net Income (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="500000" {...field} />
                    </FormControl>
                    <FormDescription>
                      {field.value > 0 && formatCurrency(Number(field.value))}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Monthly Income (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Rental income, side business, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="existingObligations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Existing Monthly Obligations (₦)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="50000" {...field} />
                    </FormControl>
                    <FormDescription>Loans, credit cards, rent, etc.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

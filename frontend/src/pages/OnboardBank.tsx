import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useOnboardLender } from '@/hooks/useApi';
import { toast } from 'sonner';

const lenderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  shortName: z.string().min(2, 'Short name is required'),
  type: z.enum(['pmb', 'commercial']),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Phone number is required'),
  address: z.string().min(5, 'Address is required'),
  leadFee: z.coerce.number().min(0, 'Lead fee must be 0 or greater'),
});

type LenderFormValues = z.infer<typeof lenderSchema>;

export default function OnboardBank() {
  const onboardLender = useOnboardLender();
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LenderFormValues>({
    resolver: zodResolver(lenderSchema),
    defaultValues: {
      type: 'pmb',
      leadFee: 150000
    }
  });

  const onSubmit = (data: LenderFormValues) => {
    onboardLender.mutate(data, {
      onSuccess: (res) => {
        toast.success('Bank onboarded successfully!');
        setCredentials({ email: data.email, password: res.defaultPassword });
        reset();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to onboard bank');
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Onboard New Bank</h1>
      
      {credentials && (
        <Card className="mb-6 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Bank Successfully Onboarded!</CardTitle>
            <CardDescription className="text-green-600">
              Please securely share these generated credentials with the bank's manager.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded border">
              <p><strong>Login Email:</strong> {credentials.email}</p>
              <p><strong>Temporary Password:</strong> {credentials.password}</p>
            </div>
            <Button className="mt-4" onClick={() => setCredentials(null)}>Dismiss</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
          <CardDescription>Enter the official details of the bank to register them on the marketplace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Full Name</label>
                <Input {...register('name')} placeholder="e.g. First Primary Mortgage Bank" />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Short Name</label>
                <Input {...register('shortName')} placeholder="e.g. First PMB" />
                {errors.shortName && <p className="text-sm text-red-500">{errors.shortName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Bank Type</label>
                <select 
                  {...register('type')} 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="pmb">Primary Mortgage Bank (PMB)</option>
                  <option value="commercial">Commercial Bank</option>
                </select>
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input {...register('email')} type="email" placeholder="manager@bank.com" />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input {...register('phone')} placeholder="+234..." />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lead Fee (NGN)</label>
                <Input {...register('leadFee')} type="number" />
                {errors.leadFee && <p className="text-sm text-red-500">{errors.leadFee.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Head Office Address</label>
              <Input {...register('address')} placeholder="123 Victoria Island..." />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={onboardLender.isPending}>
              {onboardLender.isPending ? 'Onboarding...' : 'Onboard Bank'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

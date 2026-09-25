import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, ArrowRight, ArrowLeft, CheckCircle2, Upload, 
  User, Mail, Phone, Globe, MapPin, FileText, Shield
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { NIGERIAN_STATES } from '@/types/mortgage';

interface FormData {
  // Step 1: Company Info
  companyName: string;
  shortName: string;
  licenseType: 'pmb' | 'commercial' | '';
  rcNumber: string;
  cbnLicense: string;
  
  // Step 2: Contact Details
  email: string;
  phone: string;
  website: string;
  address: string;
  state: string;
  
  // Step 3: Representative
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  
  // Step 4: Products & Terms
  mortgageTypes: string[];
  coverageStates: string[];
  minLoanAmount: string;
  maxLoanAmount: string;
  subscriptionPlan: 'basic' | 'premium' | '';
  
  // Step 5: Confirmation
  termsAccepted: boolean;
  dataProcessingAccepted: boolean;
}

const initialFormData: FormData = {
  companyName: '',
  shortName: '',
  licenseType: '',
  rcNumber: '',
  cbnLicense: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  state: '',
  contactName: '',
  contactRole: '',
  contactEmail: '',
  contactPhone: '',
  mortgageTypes: [],
  coverageStates: [],
  minLoanAmount: '',
  maxLoanAmount: '',
  subscriptionPlan: '',
  termsAccepted: false,
  dataProcessingAccepted: false,
};

const steps = [
  { title: 'Company Info', icon: Building2 },
  { title: 'Contact Details', icon: Mail },
  { title: 'Representative', icon: User },
  { title: 'Products', icon: FileText },
  { title: 'Confirmation', icon: Shield },
];

export default function LenderOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: 'mortgageTypes' | 'coverageStates', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.companyName && formData.shortName && formData.licenseType && formData.rcNumber;
      case 1:
        return formData.email && formData.phone && formData.address && formData.state;
      case 2:
        return formData.contactName && formData.contactRole && formData.contactEmail && formData.contactPhone;
      case 3:
        return formData.mortgageTypes.length > 0 && formData.coverageStates.length > 0 && formData.subscriptionPlan;
      case 4:
        return formData.termsAccepted && formData.dataProcessingAccepted;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to localStorage (mock)
    const pendingLenders = JSON.parse(localStorage.getItem('pending_lenders') || '[]');
    pendingLenders.push({
      ...formData,
      id: `pending-${Date.now()}`,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem('pending_lenders', JSON.stringify(pendingLenders));

    // Notify admin about new application
    addNotification({
      userId: 'admin-1',
      title: 'New Lender Application',
      message: `${formData.companyName} has submitted an onboarding application for review.`,
      type: 'info',
      link: '/admin/dashboard',
    });
    
    toast({
      title: "Application Submitted!",
      description: "We'll review your application and contact you within 2-3 business days.",
    });
    
    setIsSubmitting(false);
    navigate('/for-lenders');
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Badge variant="secondary" className="mb-4">
            <Building2 className="h-3 w-3 mr-1" /> Lender Onboarding
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Join Nigeria's Leading Mortgage Marketplace
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Partner with us to reach thousands of verified homebuyers. Complete this form to start your onboarding process.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10" />
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-col items-center gap-2 ${
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    index < currentStep
                      ? 'bg-primary border-primary text-primary-foreground'
                      : index === currentStep
                      ? 'bg-background border-primary'
                      : 'bg-muted border-muted'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>
              {currentStep === 0 && "Tell us about your organization"}
              {currentStep === 1 && "How can we reach you?"}
              {currentStep === 2 && "Who will be our primary contact?"}
              {currentStep === 3 && "What mortgage products do you offer?"}
              {currentStep === 4 && "Review and submit your application"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Company Info */}
            {currentStep === 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., ABC Mortgage Bank Plc"
                      value={formData.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shortName">Short Name *</Label>
                    <Input
                      id="shortName"
                      placeholder="e.g., ABC Mortgage"
                      value={formData.shortName}
                      onChange={(e) => updateField('shortName', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseType">License Type *</Label>
                  <Select
                    value={formData.licenseType}
                    onValueChange={(v) => updateField('licenseType', v as 'pmb' | 'commercial')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select license type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pmb">Primary Mortgage Bank (PMB)</SelectItem>
                      <SelectItem value="commercial">Commercial Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rcNumber">RC Number *</Label>
                    <Input
                      id="rcNumber"
                      placeholder="e.g., RC 123456"
                      value={formData.rcNumber}
                      onChange={(e) => updateField('rcNumber', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cbnLicense">CBN License Number</Label>
                    <Input
                      id="cbnLicense"
                      placeholder="e.g., PMB/2024/001"
                      value={formData.cbnLicense}
                      onChange={(e) => updateField('cbnLicense', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10"
                        placeholder="info@company.com"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        placeholder="+234 1 234 5678"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      className="pl-10"
                      placeholder="https://www.company.com"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Head Office Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      className="pl-10 min-h-[80px]"
                      placeholder="Enter full address"
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 3: Representative */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Full Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="e.g., John Doe"
                      value={formData.contactName}
                      onChange={(e) => updateField('contactName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactRole">Job Title *</Label>
                    <Input
                      id="contactRole"
                      placeholder="e.g., Head of Mortgage Operations"
                      value={formData.contactRole}
                      onChange={(e) => updateField('contactRole', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="john.doe@company.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateField('contactEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="+234 801 234 5678"
                      value={formData.contactPhone}
                      onChange={(e) => updateField('contactPhone', e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Products */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <Label>Mortgage Types Offered *</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Conventional', 'Islamic (Sharia-compliant)'].map(type => (
                      <Badge
                        key={type}
                        variant={formData.mortgageTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayField('mortgageTypes', type)}
                      >
                        {formData.mortgageTypes.includes(type) && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Coverage States *</Label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    <Badge
                      variant={formData.coverageStates.length === NIGERIAN_STATES.length ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (formData.coverageStates.length === NIGERIAN_STATES.length) {
                          updateField('coverageStates', []);
                        } else {
                          updateField('coverageStates', [...NIGERIAN_STATES]);
                        }
                      }}
                    >
                      {formData.coverageStates.length === NIGERIAN_STATES.length && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      All States
                    </Badge>
                    {NIGERIAN_STATES.map(state => (
                      <Badge
                        key={state}
                        variant={formData.coverageStates.includes(state) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleArrayField('coverageStates', state)}
                      >
                        {state}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minLoan">Minimum Loan Amount</Label>
                    <Input
                      id="minLoan"
                      placeholder="e.g., 5,000,000"
                      value={formData.minLoanAmount}
                      onChange={(e) => updateField('minLoanAmount', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoan">Maximum Loan Amount</Label>
                    <Input
                      id="maxLoan"
                      placeholder="e.g., 200,000,000"
                      value={formData.maxLoanAmount}
                      onChange={(e) => updateField('maxLoanAmount', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subscription Plan *</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all ${
                        formData.subscriptionPlan === 'basic' ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => updateField('subscriptionPlan', 'basic')}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold">Basic</h4>
                        <p className="text-sm text-muted-foreground">₦150,000 per closed lead</p>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• Standard lead access</li>
                          <li>• Basic analytics</li>
                          <li>• Email support</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card
                      className={`cursor-pointer transition-all ${
                        formData.subscriptionPlan === 'premium' ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => updateField('subscriptionPlan', 'premium')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Premium</h4>
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">₦200,000 per closed lead</p>
                        <ul className="text-sm mt-2 space-y-1">
                          <li>• Priority lead routing</li>
                          <li>• Featured placement</li>
                          <li>• Dedicated manager</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">Application Summary</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Company</p>
                      <p className="font-medium">{formData.companyName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">License Type</p>
                      <p className="font-medium">{formData.licenseType === 'pmb' ? 'Primary Mortgage Bank' : 'Commercial Bank'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact Person</p>
                      <p className="font-medium">{formData.contactName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coverage</p>
                      <p className="font-medium">
                        {formData.coverageStates.length === NIGERIAN_STATES.length 
                          ? 'Nationwide' 
                          : `${formData.coverageStates.length} states`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Subscription</p>
                      <p className="font-medium capitalize">{formData.subscriptionPlan}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => updateField('termsAccepted', checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      I agree to the Terms of Service and Partner Agreement. I confirm that all information provided is accurate and that I am authorized to submit this application on behalf of my organization.
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataProcessing"
                      checked={formData.dataProcessingAccepted}
                      onCheckedChange={(checked) => updateField('dataProcessingAccepted', checked as boolean)}
                    />
                    <Label htmlFor="dataProcessing" className="text-sm leading-relaxed cursor-pointer">
                      I consent to the processing of company data in accordance with the Privacy Policy and agree to comply with data protection requirements for handling customer information.
                    </Label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

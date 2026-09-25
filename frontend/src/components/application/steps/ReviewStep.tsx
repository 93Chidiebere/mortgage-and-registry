import { ChevronLeft, Send, Loader2, CheckCircle2, User, Briefcase, Home, Shield, FileText, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { mockLenders } from '@/data/mockData';
import type { ApplicationFormData } from '../ApplicationWizard';

interface ReviewStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({ formData, onPrev, onSubmit, isSubmitting }: ReviewStepProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSelectedLenderNames = () => {
    return formData.selectedLenders
      .map(id => mockLenders.find(l => l.id === id)?.name)
      .filter(Boolean);
  };

  const sections = [
    {
      icon: User,
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: formData.fullName },
        { label: 'Email', value: formData.email },
        { label: 'Phone', value: formData.phone },
        { label: 'Date of Birth', value: formData.dateOfBirth },
        { label: 'Marital Status', value: formData.maritalStatus },
        { label: 'Dependents', value: formData.numberOfDependents.toString() },
      ],
    },
    {
      icon: Briefcase,
      title: 'Employment & Income',
      items: [
        { label: 'Employment Type', value: formData.employmentType === 'salaried' ? 'Salaried' : 'Self-Employed' },
        { label: 'Employer/Business', value: formData.employerName },
        { label: 'Position', value: formData.jobTitle },
        { label: 'Years Employed', value: `${formData.yearsEmployed} years` },
        { label: 'Monthly Income', value: formatCurrency(formData.monthlyIncome) },
        { label: 'Additional Income', value: formatCurrency(formData.additionalIncome) },
        { label: 'Existing Obligations', value: formatCurrency(formData.existingObligations) },
      ],
    },
    {
      icon: Home,
      title: 'Property & Loan Details',
      items: [
        { label: 'Property Found?', value: formData.propertyFound ? 'Yes' : 'No' },
        { label: 'Property Type', value: formData.propertyType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
        { label: formData.propertyFound ? 'Asking Price' : 'Target Budget', value: formatCurrency(formData.propertyValue) },
        { label: 'Loan Amount', value: formatCurrency(formData.loanAmount) },
        { label: 'Loan Tenure', value: `${formData.tenure} years` },
        { label: 'LTV Ratio', value: `${((formData.loanAmount / formData.propertyValue) * 100).toFixed(1)}%` },
        { label: 'Location', value: `${formData.city}, ${formData.state}` },
        ...(formData.propertyFound ? [{ label: 'Property Address', value: formData.propertyAddress }] : []),
      ],
    },
    {
      icon: FileText,
      title: 'Documents',
      items: [
        { label: 'Uploaded Documents', value: `${formData.documents.length} files` },
      ],
    },
    {
      icon: Building2,
      title: 'Selected Lenders',
      items: getSelectedLenderNames().map(name => ({ label: '', value: name || '' })),
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Review Your Application
        </CardTitle>
        <CardDescription>
          Please review all your information before submitting. Your application will be sent to the selected lenders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                {section.title === 'Selected Lenders' ? (
                  <div className="flex flex-wrap gap-2">
                    {getSelectedLenderNames().map((name, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center py-1">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-right max-w-[200px] truncate">
                          {item.value}
                        </span>
                        {'verified' in item && item.verified && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {index < sections.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>

        {/* Consent Section */}
        <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <p className="text-sm text-muted-foreground">
            By submitting this application, you consent to sharing your information with the selected lenders 
            for mortgage processing purposes. Your data is encrypted and handled according to our privacy policy.
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrev} className="gap-2" disabled={isSubmitting}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button 
            type="button" 
            onClick={onSubmit}
            disabled={isSubmitting}
            className="gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { EmploymentStep } from './steps/EmploymentStep';
import { PropertyStep } from './steps/PropertyStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { LenderSelectionStep } from './steps/LenderSelectionStep';
import { ReviewStep } from './steps/ReviewStep';
import type { MortgageApplication, Document } from '@/types/mortgage';

interface ApplicationFormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  maritalStatus: string;
  numberOfDependents: number;
  
  // Employment
  employmentType: 'salaried' | 'self_employed';
  employerName: string;
  jobTitle: string;
  yearsEmployed: number;
  monthlyIncome: number;
  additionalIncome: number;
  existingObligations: number;
  
  // Property
  propertyType: 'off_plan' | 'completed' | 'construction';
  propertyValue: number;
  loanAmount: number;
  tenure: number;
  state: string;
  city: string;
  propertyAddress: string;
  propertyFound: boolean;
  
  // Documents
  documents: Document[];
  
  // Lender Selection
  selectedLenders: string[];
  mortgageType: 'conventional' | 'islamic';
}

const STEPS = [
  { id: 'personal', title: 'Personal Info', icon: '👤' },
  { id: 'employment', title: 'Employment', icon: '💼' },
  { id: 'property', title: 'Property', icon: '🏠' },
  { id: 'documents', title: 'Documents', icon: '📄' },
  { id: 'lenders', title: 'Select Lenders', icon: '🏦' },
  { id: 'review', title: 'Review & Submit', icon: '✅' },
];

const STORAGE_KEY = 'mortgage_application_draft';

const initialFormData: ApplicationFormData = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  maritalStatus: '',
  numberOfDependents: 0,
  employmentType: 'salaried',
  employerName: '',
  jobTitle: '',
  yearsEmployed: 0,
  monthlyIncome: 0,
  additionalIncome: 0,
  existingObligations: 0,
  propertyType: 'completed',
  propertyValue: 0,
  loanAmount: 0,
  tenure: 15,
  state: '',
  city: '',
  propertyAddress: '',
  propertyFound: false,
  documents: [],
  selectedLenders: [],
  mortgageType: 'conventional',
};

export function ApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data);
        setCurrentStep(parsed.step || 0);
        setLastSaved(new Date(parsed.savedAt));
        toast({
          title: 'Draft Restored',
          description: 'Your previous progress has been restored.',
        });
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  // Auto-save on form data change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);

  const saveDraft = () => {
    const draft = {
      data: formData,
      step: currentStep,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setLastSaved(new Date());
  };

  const updateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  const handleSubmit = async () => {
    // Ensure user is logged in before submitting
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in or create an account to submit your application. Your progress is saved!',
        variant: 'destructive',
      });
      // Save draft just in case
      saveDraft();
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const applicationPayload = {
        employmentType: formData.employmentType,
        propertyType: formData.propertyType,
        propertyValue: formData.propertyValue,
        loanAmount: formData.loanAmount,
        tenure: formData.tenure,
        monthlyIncome: formData.monthlyIncome,
        existingObligations: formData.existingObligations,
        state: formData.state,
        city: formData.city,
        propertyAddress: formData.propertyAddress,
        selectedLenders: formData.selectedLenders,
      };

      // Send to Railway Backend
      await api.post('/applications', applicationPayload);
      
      // Clear draft upon successful submission
      localStorage.removeItem(STORAGE_KEY);
      
      toast({
        title: 'Application Submitted!',
        description: 'Your mortgage application has been securely sent to the selected lenders.',
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStep = () => {
    const props = { formData, updateFormData, onNext: nextStep, onPrev: prevStep };
    
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep {...props} />;
      case 1:
        return <EmploymentStep {...props} />;
      case 2:
        return <PropertyStep {...props} />;
      case 3:
        return <DocumentsStep {...props} />;
      case 4:
        return <LenderSelectionStep {...props} />;
      case 5:
        return <ReviewStep {...props} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Mortgage Application</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Save className="w-4 h-4" />
            {lastSaved ? (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Auto-saving...</span>
            )}
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-4" />
        
        {/* Step Indicators */}
        <div className="hidden md:flex items-center justify-between">
          {STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              disabled={index > currentStep}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                index <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                    ? "bg-primary/20 text-primary ring-2 ring-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {index < currentStep ? <Check className="w-5 h-5" /> : step.icon}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  index === currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </span>
            </button>
          ))}
        </div>
        
        {/* Mobile Step Indicator */}
        <div className="md:hidden flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {STEPS[currentStep].title}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export type { ApplicationFormData };

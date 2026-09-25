import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, FileText, Clock, CheckCircle2, AlertCircle, 
  Home, Building2, Calendar, User, Briefcase, MapPin,
  Download, Award, Eye
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { mockApplications, mockLenders, mockProducts } from '@/data/mockData';
import { APPLICATION_STATUSES, MortgageApplication } from '@/types/mortgage';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const statusSteps = [
  { key: 'submitted', label: 'Submitted', icon: FileText, description: 'Application received and being processed' },
  { key: 'under_review', label: 'Under Review', icon: Clock, description: 'Lender is reviewing your application' },
  { key: 'conditional_approval', label: 'Conditional Approval', icon: AlertCircle, description: 'Pre-approved pending document verification' },
  { key: 'valuation', label: 'Property Valuation', icon: Home, description: 'Property is being valued by assessor' },
  { key: 'offer_issued', label: 'Offer Issued', icon: Award, description: 'Mortgage offer ready for acceptance' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, description: 'Mortgage disbursed successfully' },
];

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<MortgageApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to find in localStorage first, then fallback to mock data
    const storedApps = JSON.parse(localStorage.getItem('applications') || '[]');
    const allApps = [...storedApps, ...mockApplications];
    const found = allApps.find(app => app.id === id);
    
    setApplication(found || null);
    setIsLoading(false);
  }, [id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!application) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Application Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The application you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = APPLICATION_STATUSES[application.status];
  const currentStatusIndex = statusSteps.findIndex(s => s.key === application.status);
  const progress = ((currentStatusIndex + 1) / statusSteps.length) * 100;
  const selectedLenders = application.selectedLenders
    .map(id => mockLenders.find(l => l.id === id))
    .filter(Boolean);

  // Calculate monthly payment estimate
  const interestRate = 0.165; // 16.5% average
  const monthlyRate = interestRate / 12;
  const totalPayments = application.tenure * 12;
  const monthlyPayment = application.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

  // Check if eligible for pre-approval certificate
  const isPreApproved = ['conditional_approval', 'valuation', 'offer_issued', 'completed'].includes(application.status);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Home className="h-8 w-8" />
                {application.propertyAddress || `${application.city}, ${application.state}`}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Applied on {new Date(application.createdAt).toLocaleDateString('en-NG', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={
                  statusInfo.color === 'success' ? 'default' :
                  statusInfo.color === 'warning' ? 'secondary' :
                  statusInfo.color === 'destructive' ? 'destructive' : 'outline'
                }
                className="text-sm px-4 py-1"
              >
                {statusInfo.label}
              </Badge>
              {isPreApproved && (
                <Button asChild>
                  <Link to={`/application/${application.id}/certificate`}>
                    <Award className="h-4 w-4 mr-2" /> View Certificate
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Progress</CardTitle>
                <CardDescription>Track your mortgage application journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
                
                <div className="relative mt-8">
                  {statusSteps.map((step, index) => {
                    const isComplete = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const StepIcon = step.icon;
                    
                    return (
                      <div key={step.key} className="flex gap-4 pb-8 last:pb-0">
                        <div className="relative flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isComplete 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                            <StepIcon className="h-5 w-5" />
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-2 ${
                              isComplete ? 'bg-primary' : 'bg-muted'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className={`font-semibold ${isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {isCurrent && (
                            <Badge variant="secondary" className="mt-2">Current Stage</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Details */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Home className="h-4 w-4" /> Property Information
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Property Type</p>
                      <p className="font-semibold capitalize">{application.propertyType.replace('_', ' ')}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Property Value</p>
                      <p className="font-semibold">{formatCurrency(application.propertyValue)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-semibold">{application.city}, {application.state}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold">{application.propertyAddress || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Loan Details */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Loan Information
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground">Loan Amount</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(application.loanAmount)}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Tenure</p>
                      <p className="font-semibold">{application.tenure} years</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">LTV Ratio</p>
                      <p className="font-semibold">{Math.round((application.loanAmount / application.propertyValue) * 100)}%</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Employment Details */}
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Employment & Income
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Employment Type</p>
                      <p className="font-semibold capitalize">{application.employmentType.replace('_', ' ')}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="font-semibold">{formatCurrency(application.monthlyIncome)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Lenders */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Lenders</CardTitle>
                <CardDescription>Your application was sent to these lenders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedLenders.map(lender => {
                    if (!lender) return null;
                    const lenderProducts = mockProducts.filter(p => p.lenderId === lender.id);
                    const bestRate = Math.min(...lenderProducts.map(p => p.interestRate));
                    
                    return (
                      <div key={lender.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{lender.shortName}</h4>
                          <Badge variant="outline">{lender.type.toUpperCase()}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{lender.name}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Best Rate</span>
                          <span className="font-medium text-primary">{bestRate}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Estimate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                  <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyPayment)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Based on 16.5% average rate</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal</span>
                    <span className="font-medium">{formatCurrency(application.loanAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interest (est.)</span>
                    <span className="font-medium">{formatCurrency(monthlyPayment * totalPayments - application.loanAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost (est.)</span>
                    <span className="font-semibold">{formatCurrency(monthlyPayment * totalPayments)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Approval Certificate */}
            {isPreApproved && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Pre-Approval Certificate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have been conditionally approved. Download your pre-approval certificate to show property sellers.
                  </p>
                  <Button asChild className="w-full">
                    <Link to={`/application/${application.id}/certificate`}>
                      <Eye className="h-4 w-4 mr-2" /> View Certificate
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {application.documents && application.documents.length > 0 ? (
                  <div className="space-y-2">
                    {application.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                        </div>
                        {doc.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/compare">
                    <Building2 className="h-4 w-4 mr-2" /> Compare More Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/dashboard">
                    <FileText className="h-4 w-4 mr-2" /> Back to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

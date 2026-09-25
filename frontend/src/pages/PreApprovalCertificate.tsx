import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, Share2, Award, Shield, 
  CheckCircle2, Calendar, Building2, Home, Printer
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { mockApplications, mockLenders } from '@/data/mockData';
import { MortgageApplication } from '@/types/mortgage';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

export default function PreApprovalCertificate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [application, setApplication] = useState<MortgageApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedApps = JSON.parse(localStorage.getItem('applications') || '[]');
    const allApps = [...storedApps, ...mockApplications];
    const found = allApps.find(app => app.id === id);
    setApplication(found || null);
    setIsLoading(false);
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Pre-Approval Certificate - MortgageNG',
      text: `I've been pre-approved for a mortgage of ${application ? formatCurrency(application.loanAmount) : ''} via MortgageNG!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied!',
          description: 'Certificate link has been copied to clipboard.',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-96 bg-muted rounded" />
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
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Certificate Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The pre-approval certificate you're looking for doesn't exist.
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

  const isPreApproved = ['conditional_approval', 'valuation', 'offer_issued', 'completed'].includes(application.status);

  if (!isPreApproved) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Not Yet Pre-Approved</h3>
              <p className="text-muted-foreground mb-4">
                Your application hasn't reached the pre-approval stage yet. Please check back later.
              </p>
              <Button asChild>
                <Link to={`/application/${application.id}`}>View Application Status</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const selectedLender = mockLenders.find(l => application.selectedLenders.includes(l.id));
  const issueDate = new Date(application.updatedAt);
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  const certificateNumber = `MNG-${application.id.toUpperCase()}-${issueDate.getFullYear()}`;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header - Hidden in print */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 print:hidden"
        >
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                Pre-Approval Certificate
              </h1>
              <p className="text-muted-foreground">
                Share this certificate with property sellers and agents
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" /> Print
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Certificate */}
        <div ref={certificateRef} className="max-w-3xl mx-auto">
          <Card className="border-2 border-primary/20 print:border-none print:shadow-none">
            <CardContent className="p-8 md:p-12">
              {/* Certificate Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold text-primary">MortgageNG</h2>
                    <p className="text-xs text-muted-foreground">Nigeria's Mortgage Marketplace</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-primary">Pre-Approval Certificate</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                  Certificate of Pre-Approval
                </h1>
                <p className="text-muted-foreground">
                  This certifies that the applicant has been conditionally approved for mortgage financing
                </p>
              </div>

              <Separator className="my-8" />

              {/* Approval Details */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pre-Approved Amount</p>
                  <p className="text-4xl md:text-5xl font-bold text-primary">
                    {formatCurrency(application.loanAmount)}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 p-6 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Property Value</p>
                    <p className="font-semibold">{formatCurrency(application.propertyValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Loan-to-Value Ratio</p>
                    <p className="font-semibold">{Math.round((application.loanAmount / application.propertyValue) * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tenure</p>
                    <p className="font-semibold">{application.tenure} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Property Location</p>
                    <p className="font-semibold">{application.city}, {application.state}</p>
                  </div>
                </div>

                {/* Lender Info */}
                {selectedLender && (
                  <div className="p-6 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Approved by</p>
                        <p className="font-semibold text-lg">{selectedLender.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedLender.type === 'pmb' ? 'Primary Mortgage Bank' : 'Commercial Bank'}</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Validity & Certificate Info */}
                <div className="grid md:grid-cols-3 gap-4 p-6 bg-muted/50 rounded-lg text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Certificate Number</p>
                    <p className="font-mono font-semibold text-sm">{certificateNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                    <p className="font-semibold">{issueDate.toLocaleDateString('en-NG', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Valid Until</p>
                    <p className="font-semibold">{expiryDate.toLocaleDateString('en-NG', { 
                      year: 'numeric', month: 'long', day: 'numeric' 
                    })}</p>
                  </div>
                </div>

                {/* Conditions */}
                <div className="p-6 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-600" />
                    Conditions of Pre-Approval
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      Subject to satisfactory property valuation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      Subject to verification of all submitted documents
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      Subject to no material change in financial circumstances
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      This certificate is not a binding offer of credit
                    </li>
                  </ul>
                </div>

                {/* Verification Footer */}
                <div className="text-center pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    To verify this certificate, visit:
                  </p>
                  <p className="font-mono text-sm text-primary">
                    mortgageng.lovable.app/verify/{certificateNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions - Hidden in print */}
        <div className="max-w-3xl mx-auto mt-6 flex justify-center gap-4 print:hidden">
          <Button variant="outline" asChild>
            <Link to={`/application/${application.id}`}>
              <Home className="h-4 w-4 mr-2" /> View Application
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}

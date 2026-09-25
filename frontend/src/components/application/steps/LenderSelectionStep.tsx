import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Building2, Check, Star, TrendingUp, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { mockProducts, mockLenders } from '@/data/mockData';
import type { ApplicationFormData } from '../ApplicationWizard';
import type { MortgageProduct } from '@/types/mortgage';

interface LenderSelectionStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

interface EligibleProduct extends MortgageProduct {
  monthlyPayment: number;
  totalCost: number;
  approvalChance: 'high' | 'medium' | 'low';
}

export function LenderSelectionStep({ formData, updateFormData, onNext, onPrev }: LenderSelectionStepProps) {
  const [selectedLenders, setSelectedLenders] = useState<string[]>(formData.selectedLenders || []);
  const [mortgageType, setMortgageType] = useState<'conventional' | 'islamic'>(formData.mortgageType || 'conventional');
  const [eligibleProducts, setEligibleProducts] = useState<EligibleProduct[]>([]);

  useEffect(() => {
    // Filter and calculate eligible products
    const filtered = mockProducts
      .filter(product => {
        // Check mortgage type
        if (product.mortgageType !== mortgageType) return false;
        
        // Check state eligibility
        if (!product.eligibleStates.includes(formData.state)) return false;
        
        // Check loan amount range
        if (formData.loanAmount < product.minLoanAmount || formData.loanAmount > product.maxLoanAmount) return false;
        
        // Check tenure range
        if (formData.tenure < product.minTenure || formData.tenure > product.maxTenure) return false;
        
        // Check income requirement
        if (formData.monthlyIncome < product.minIncome) return false;
        
        // Check LTV
        const ltv = (formData.loanAmount / formData.propertyValue) * 100;
        if (ltv > product.maxLTV) return false;
        
        return product.isActive;
      })
      .map(product => {
        // Calculate monthly payment
        const monthlyRate = product.interestRate / 100 / 12;
        const months = formData.tenure * 12;
        const monthlyPayment = formData.loanAmount * 
          (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
          (Math.pow(1 + monthlyRate, months) - 1);
        
        // Calculate total cost
        const totalInterest = (monthlyPayment * months) - formData.loanAmount;
        const fees = (product.processingFee / 100 * formData.loanAmount) +
                    (product.legalFee / 100 * formData.loanAmount) +
                    (product.insuranceFee / 100 * formData.loanAmount) +
                    product.adminFee;
        const totalCost = formData.loanAmount + totalInterest + fees;
        
        // Calculate approval chance
        const dti = (formData.existingObligations + monthlyPayment) / formData.monthlyIncome;
        let approvalChance: 'high' | 'medium' | 'low' = 'medium';
        if (dti < 0.35 && formData.bvnVerified && formData.ninVerified) {
          approvalChance = 'high';
        } else if (dti > 0.50) {
          approvalChance = 'low';
        }
        
        return {
          ...product,
          monthlyPayment,
          totalCost,
          approvalChance,
        };
      })
      .sort((a, b) => a.monthlyPayment - b.monthlyPayment);

    setEligibleProducts(filtered);
  }, [formData, mortgageType]);

  const toggleLender = (lenderId: string) => {
    setSelectedLenders(prev => {
      if (prev.includes(lenderId)) {
        return prev.filter(id => id !== lenderId);
      }
      if (prev.length >= 3) {
        return prev; // Max 3 lenders
      }
      return [...prev, lenderId];
    });
  };

  const handleContinue = () => {
    updateFormData({ selectedLenders, mortgageType });
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

  const getLender = (lenderId: string) => {
    return mockLenders.find(l => l.id === lenderId);
  };

  const getApprovalColor = (chance: 'high' | 'medium' | 'low') => {
    switch (chance) {
      case 'high': return 'text-primary bg-primary/10';
      case 'medium': return 'text-amber-600 bg-amber-500/10';
      case 'low': return 'text-destructive bg-destructive/10';
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Select Lenders
        </CardTitle>
        <CardDescription>
          Choose up to 3 lenders to receive your application. We've matched you with the best options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mortgage Type Tabs */}
        <Tabs 
          value={mortgageType} 
          onValueChange={(v) => setMortgageType(v as 'conventional' | 'islamic')}
          className="mb-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conventional">Conventional Mortgage</TabsTrigger>
            <TabsTrigger value="islamic">Islamic (Halal) Finance</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Selection Summary */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm">
            Selected: <span className="font-medium">{selectedLenders.length}/3</span> lenders
          </span>
          {selectedLenders.length === 3 && (
            <span className="text-xs text-amber-600">Maximum reached</span>
          )}
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {eligibleProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No eligible products found for your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your loan amount or tenure.</p>
            </div>
          ) : (
            eligibleProducts.map((product, index) => {
              const lender = getLender(product.lenderId);
              const isSelected = selectedLenders.includes(product.lenderId);
              
              return (
                <div
                  key={product.id}
                  onClick={() => toggleLender(product.lenderId)}
                  className={cn(
                    "border rounded-xl p-4 cursor-pointer transition-all",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {index === 0 && (
                          <Badge variant="secondary" className="bg-accent text-accent-foreground">
                            <Star className="w-3 h-3 mr-1" /> Best Match
                          </Badge>
                        )}
                        {product.isPromotional && (
                          <Badge variant="outline" className="text-primary border-primary">
                            Promotional
                          </Badge>
                        )}
                        <Badge className={getApprovalColor(product.approvalChance)}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {product.approvalChance === 'high' ? 'High' : product.approvalChance === 'medium' ? 'Medium' : 'Low'} Approval
                        </Badge>
                      </div>
                      
                      <h4 className="font-semibold">{lender?.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.name}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Percent className="w-3 h-3" /> Interest Rate
                          </p>
                          <p className="font-semibold text-sm">
                            {product.interestRate}% <span className="text-xs font-normal">({product.rateType})</span>
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Tenure
                          </p>
                          <p className="font-semibold text-sm">{product.minTenure}-{product.maxTenure} years</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Monthly Payment</p>
                          <p className="font-semibold text-sm text-primary">{formatCurrency(product.monthlyPayment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                          <p className="font-semibold text-sm">{formatCurrency(product.totalCost)}</p>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Selection Indicator */}
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      isSelected 
                        ? "border-primary bg-primary text-primary-foreground" 
                        : "border-muted-foreground"
                    )}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="outline" onClick={onPrev} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button 
            type="button" 
            onClick={handleContinue}
            disabled={selectedLenders.length === 0}
            className="gap-2"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

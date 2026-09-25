import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, AlertCircle, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockProducts } from '@/data/mockData';
import { Link } from 'react-router-dom';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  if (monthlyRate === 0) return principal / numPayments;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function Calculator() {
  // Affordability Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState(500000);
  const [existingObligations, setExistingObligations] = useState(50000);
  const [desiredTenure, setDesiredTenure] = useState([20]);
  const [downPaymentPercent, setDownPaymentPercent] = useState([20]);

  // Mortgage Calculator State
  const [propertyValue, setPropertyValue] = useState(50000000);
  const [loanAmount, setLoanAmount] = useState(40000000);
  const [interestRate, setInterestRate] = useState([16]);
  const [loanTenure, setLoanTenure] = useState([15]);

  // Affordability Calculations
  const affordabilityResults = useMemo(() => {
    const avgRate = 16.5; // Average market rate
    const maxDTI = 0.4; // 40% debt-to-income ratio
    const availableForMortgage = (monthlyIncome * maxDTI) - existingObligations;
    
    if (availableForMortgage <= 0) {
      return {
        maxMortgage: 0,
        estimatedMonthly: 0,
        dti: (existingObligations / monthlyIncome) * 100,
        maxPropertyValue: 0,
        status: 'ineligible' as const,
        eligibleProducts: []
      };
    }

    // Reverse calculate max mortgage from max monthly payment
    const monthlyRate = avgRate / 100 / 12;
    const numPayments = desiredTenure[0] * 12;
    const maxMortgage = availableForMortgage * ((Math.pow(1 + monthlyRate, numPayments) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments)));
    
    const maxPropertyValue = maxMortgage / (1 - downPaymentPercent[0] / 100);
    const dti = ((existingObligations + availableForMortgage) / monthlyIncome) * 100;
    
    const eligibleProducts = mockProducts.filter(p => 
      p.isActive && 
      maxMortgage >= p.minLoanAmount &&
      monthlyIncome >= p.minIncome
    ).slice(0, 3);

    return {
      maxMortgage,
      estimatedMonthly: availableForMortgage,
      dti,
      maxPropertyValue,
      status: dti <= 30 ? 'excellent' as const : dti <= 40 ? 'good' as const : 'caution' as const,
      eligibleProducts
    };
  }, [monthlyIncome, existingObligations, desiredTenure, downPaymentPercent]);

  // Mortgage Calculator Results
  const mortgageResults = useMemo(() => {
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate[0], loanTenure[0]);
    const totalPayment = monthlyPayment * loanTenure[0] * 12;
    const totalInterest = totalPayment - loanAmount;
    const ltv = (loanAmount / propertyValue) * 100;

    return {
      monthlyPayment,
      totalPayment,
      totalInterest,
      ltv,
      downPayment: propertyValue - loanAmount
    };
  }, [propertyValue, loanAmount, interestRate, loanTenure]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <CalcIcon className="h-5 w-5" />
            <span className="font-medium">Free Mortgage Tools</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Mortgage Calculators
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your home purchase with our powerful calculators. Find out how much you can afford and estimate your monthly payments.
          </p>
        </motion.div>

        <Tabs defaultValue="affordability" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="affordability">Affordability</TabsTrigger>
            <TabsTrigger value="mortgage">Mortgage</TabsTrigger>
          </TabsList>

          {/* Affordability Calculator */}
          <TabsContent value="affordability">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Financial Details</CardTitle>
                  <CardDescription>
                    Enter your income and existing commitments to see what you can afford.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Monthly Income (Net)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Existing Monthly Obligations
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={existingObligations}
                        onChange={(e) => setExistingObligations(Number(e.target.value))}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Include car loans, credit cards, other mortgages, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Preferred Tenure: {desiredTenure[0]} years
                    </label>
                    <Slider
                      value={desiredTenure}
                      onValueChange={setDesiredTenure}
                      min={5}
                      max={30}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>5 years</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Down Payment: {downPaymentPercent[0]}%
                    </label>
                    <Slider
                      value={downPaymentPercent}
                      onValueChange={setDownPaymentPercent}
                      min={10}
                      max={50}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10%</span>
                      <span>50%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                <Card className={`border-2 ${
                  affordabilityResults.status === 'excellent' ? 'border-green-500 bg-green-50 dark:bg-green-950' :
                  affordabilityResults.status === 'good' ? 'border-primary bg-primary/5' :
                  affordabilityResults.status === 'caution' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                  'border-destructive bg-destructive/5'
                }`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Your Affordability</CardTitle>
                      <Badge variant={
                        affordabilityResults.status === 'excellent' ? 'default' :
                        affordabilityResults.status === 'good' ? 'secondary' :
                        'destructive'
                      }>
                        {affordabilityResults.status === 'excellent' ? 'Excellent' :
                         affordabilityResults.status === 'good' ? 'Good' :
                         affordabilityResults.status === 'caution' ? 'Caution' : 'Review Needed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Maximum Mortgage Amount</p>
                      <p className="text-4xl font-bold text-primary">
                        {formatCurrency(affordabilityResults.maxMortgage)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Max Property Value</p>
                        <p className="text-xl font-bold">{formatCurrency(affordabilityResults.maxPropertyValue)}</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Est. Monthly Payment</p>
                        <p className="text-xl font-bold">{formatCurrency(affordabilityResults.estimatedMonthly)}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Debt-to-Income Ratio</span>
                        <span className="font-medium">{affordabilityResults.dti.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(affordabilityResults.dti, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Recommended: Below 40%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligible Products */}
                {affordabilityResults.eligibleProducts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        You May Qualify For
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {affordabilityResults.eligibleProducts.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.lenderName}</p>
                          </div>
                          <Badge variant="outline">{product.interestRate}%</Badge>
                        </div>
                      ))}
                      <Button asChild className="w-full mt-4">
                        <Link to="/apply">
                          Start Application <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Mortgage Calculator */}
          <TabsContent value="mortgage">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                  <CardDescription>
                    Enter your loan details to calculate monthly payments.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Property Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={propertyValue}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPropertyValue(val);
                          if (loanAmount > val * 0.85) {
                            setLoanAmount(val * 0.8);
                          }
                        }}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Loan Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(Math.min(Number(e.target.value), propertyValue * 0.85))}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 85% of property value (LTV)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Interest Rate: {interestRate[0]}% per annum
                    </label>
                    <Slider
                      value={interestRate}
                      onValueChange={setInterestRate}
                      min={10}
                      max={25}
                      step={0.5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>10%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Loan Tenure: {loanTenure[0]} years
                    </label>
                    <Slider
                      value={loanTenure}
                      onValueChange={setLoanTenure}
                      min={3}
                      max={30}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>3 years</span>
                      <span>30 years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <div className="space-y-6">
                <Card className="border-2 border-primary bg-primary/5">
                  <CardHeader>
                    <CardTitle>Payment Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
                      <p className="text-5xl font-bold text-primary">
                        {formatCurrency(mortgageResults.monthlyPayment)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        for {loanTenure[0]} years
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Payment</p>
                        <p className="text-xl font-bold">{formatCurrency(mortgageResults.totalPayment)}</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Interest</p>
                        <p className="text-xl font-bold text-orange-600">{formatCurrency(mortgageResults.totalInterest)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">Down Payment</p>
                        <p className="text-xl font-bold">{formatCurrency(mortgageResults.downPayment)}</p>
                      </div>
                      <div className="p-4 bg-background rounded-lg">
                        <p className="text-sm text-muted-foreground">LTV Ratio</p>
                        <p className="text-xl font-bold">{mortgageResults.ltv.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        This is an estimate. Actual payments may vary based on lender fees, insurance, and other charges.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Button asChild size="lg" className="w-full">
                  <Link to="/compare">
                    Compare Mortgage Products <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

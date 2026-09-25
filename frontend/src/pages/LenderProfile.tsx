import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Globe, Star, CheckCircle2, 
  ArrowRight, Shield, Clock, Percent, TrendingUp, Heart
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockLenders, mockProducts } from '@/data/mockData';
import { useFavorites } from '@/contexts/FavoritesContext';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function LenderProfile() {
  const { id } = useParams<{ id: string }>();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const lender = mockLenders.find(l => l.id === id);
  const lenderProducts = mockProducts.filter(p => p.lenderId === id && p.isActive);
  
  if (!lender) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Lender Not Found</h1>
          <p className="text-muted-foreground mb-6">The lender you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/compare">Browse All Lenders</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const lowestRate = lenderProducts.length > 0 
    ? Math.min(...lenderProducts.map(p => p.interestRate)) 
    : 0;
  const maxTenure = lenderProducts.length > 0 
    ? Math.max(...lenderProducts.map(p => p.maxTenure)) 
    : 0;
  const minDownPayment = lenderProducts.length > 0 
    ? Math.min(...lenderProducts.map(p => p.minDownPayment)) 
    : 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-display text-3xl md:text-4xl font-bold">{lender.name}</h1>
                {lender.subscription === 'premium' && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                    <Star className="h-3 w-3 mr-1" /> Premium Partner
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {lender.address}
                </span>
                <Badge variant="outline">{lender.type === 'pmb' ? 'Primary Mortgage Bank' : 'Commercial Bank'}</Badge>
              </div>
            </div>
            <Button asChild size="lg">
              <Link to="/apply">
                Apply Now <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <Percent className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{lowestRate}%</p>
              <p className="text-sm text-muted-foreground">Lowest Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{maxTenure} yrs</p>
              <p className="text-sm text-muted-foreground">Max Tenure</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{minDownPayment}%</p>
              <p className="text-sm text-muted-foreground">Min Down Payment</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{lenderProducts.length}</p>
              <p className="text-sm text-muted-foreground">Products</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="products">Mortgage Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            {lenderProducts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No active products available at this time.</p>
                </CardContent>
              </Card>
            ) : (
              lenderProducts.map((product, index) => {
                const monthlyPayment = calculateMonthlyPayment(20000000, product.interestRate, 15);
                const isFav = isFavorite(product.id);
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                  {product.isPromotional && (
                                    <Badge variant="secondary">
                                      <Star className="h-3 w-3 mr-1" /> Promotional
                                    </Badge>
                                  )}
                                  {product.mortgageType === 'islamic' && (
                                    <Badge variant="outline">Islamic (Halal)</Badge>
                                  )}
                                  <Badge variant="outline">{product.rateType} rate</Badge>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleFavorite(product.id)}
                              >
                                <Heart className={`h-5 w-5 ${isFav ? 'fill-destructive text-destructive' : ''}`} />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Interest Rate</p>
                                <p className="text-xl font-bold text-primary">{product.interestRate}%</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Tenure</p>
                                <p className="text-xl font-bold">{product.minTenure}-{product.maxTenure} yrs</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Loan Range</p>
                                <p className="font-semibold text-sm">
                                  {formatCurrency(product.minLoanAmount)} - {formatCurrency(product.maxLoanAmount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Est. Monthly</p>
                                <p className="text-xl font-bold">{formatCurrency(monthlyPayment)}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {product.features.map((feature, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 lg:w-40">
                            <Button asChild>
                              <Link to="/apply">Apply Now</Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link to="/calculator">Calculate</Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {lender.shortName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Overview</h4>
                  <p className="text-muted-foreground">
                    {lender.name} is a {lender.type === 'pmb' ? 'Primary Mortgage Bank' : 'Commercial Bank'} licensed 
                    by the Central Bank of Nigeria to provide mortgage financing solutions to Nigerians. 
                    {lender.subscription === 'premium' && ' As a premium partner on MortgageNG, they offer competitive rates and dedicated support for homebuyers.'}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Key Highlights</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        CBN Licensed {lender.type === 'pmb' ? 'Primary Mortgage Bank' : 'Commercial Bank'}
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {lenderProducts.length} Active Mortgage Products
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Rates from {lowestRate}% per annum
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Tenures up to {maxTenure} years
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Coverage Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {lenderProducts.length > 0 && (
                        [...new Set(lenderProducts.flatMap(p => p.eligibleStates))].slice(0, 10).map(state => (
                          <Badge key={state} variant="outline">{state}</Badge>
                        ))
                      )}
                      {lenderProducts.length > 0 && 
                        [...new Set(lenderProducts.flatMap(p => p.eligibleStates))].length > 10 && (
                        <Badge variant="secondary">
                          +{[...new Set(lenderProducts.flatMap(p => p.eligibleStates))].length - 10} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Partnership Status</h4>
                  <div className="flex items-center gap-4">
                    <Badge variant={lender.subscription === 'premium' ? 'default' : 'secondary'} className="text-sm">
                      {lender.subscription === 'premium' ? '★ Premium Partner' : 'Basic Partner'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Member since {lender.createdAt.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Get in touch with {lender.shortName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{lender.address}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <a href={`tel:${lender.phone}`} className="text-sm text-primary hover:underline">
                          {lender.phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <a href={`mailto:${lender.email}`} className="text-sm text-primary hover:underline">
                          {lender.email}
                        </a>
                      </div>
                    </div>
                    
                    {lender.website && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Website</p>
                          <a 
                            href={lender.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {lender.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Quick Contact</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Interested in this lender's products? Start your application through MortgageNG for a streamlined experience.
                    </p>
                    <div className="space-y-3">
                      <Button asChild className="w-full">
                        <Link to="/apply">Start Application</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/calculator">Check Affordability</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

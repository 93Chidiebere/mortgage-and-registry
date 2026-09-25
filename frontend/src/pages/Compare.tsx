import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, Check, X, Building2, Percent, Clock, TrendingUp, Star, Heart } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { mockProducts, mockLenders } from '@/data/mockData';
import { NIGERIAN_STATES, MortgageProduct } from '@/types/mortgage';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/contexts/FavoritesContext';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function Compare() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [mortgageType, setMortgageType] = useState<string>('all');
  const [rateType, setRateType] = useState<string>('all');
  const [loanAmount, setLoanAmount] = useState([20000000]);
  const [tenure, setTenure] = useState([15]);
  const [sortBy, setSortBy] = useState<'rate' | 'monthly' | 'total'>('rate');
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toggleFavorite, isFavorite, favorites } = useFavorites();
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      if (!product.isActive) return false;
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !product.lenderName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedState !== 'all' && !product.eligibleStates.includes(selectedState)) return false;
      if (mortgageType !== 'all' && product.mortgageType !== mortgageType) return false;
      if (rateType !== 'all' && product.rateType !== rateType) return false;
      if (loanAmount[0] < product.minLoanAmount || loanAmount[0] > product.maxLoanAmount) return false;
      if (tenure[0] < product.minTenure || tenure[0] > product.maxTenure) return false;
      return true;
    }).sort((a, b) => {
      const monthlyA = calculateMonthlyPayment(loanAmount[0], a.interestRate, tenure[0]);
      const monthlyB = calculateMonthlyPayment(loanAmount[0], b.interestRate, tenure[0]);
      const totalA = monthlyA * tenure[0] * 12;
      const totalB = monthlyB * tenure[0] * 12;
      
      if (sortBy === 'rate') return a.interestRate - b.interestRate;
      if (sortBy === 'monthly') return monthlyA - monthlyB;
      return totalA - totalB;
    });
  }, [searchTerm, selectedState, mortgageType, rateType, loanAmount, tenure, sortBy]);

  const toggleCompare = (productId: string) => {
    setCompareList(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : prev.length < 3 ? [...prev, productId] : prev
    );
  };

  const getLender = (lenderId: string) => mockLenders.find(l => l.id === lenderId);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Compare Mortgage Products
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the best mortgage deal from Nigeria's leading banks and PMBs. Compare rates, terms, and fees side by side.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{mockProducts.filter(p => p.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/10 border-secondary/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary-foreground">{mockLenders.filter(l => l.isActive).length}</p>
              <p className="text-sm text-muted-foreground">Partner Lenders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{Math.min(...mockProducts.map(p => p.interestRate))}%</p>
              <p className="text-sm text-muted-foreground">Lowest Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{Math.max(...mockProducts.map(p => p.maxTenure))} yrs</p>
              <p className="text-sm text-muted-foreground">Max Tenure</p>
            </CardContent>
          </Card>
        </div>

        {/* Loan Parameters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  Loan Amount: {formatCurrency(loanAmount[0])}
                </label>
                <Slider
                  value={loanAmount}
                  onValueChange={setLoanAmount}
                  min={3000000}
                  max={200000000}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>₦3M</span>
                  <span>₦200M</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-3">
                  Tenure: {tenure[0]} years
                </label>
                <Slider
                  value={tenure}
                  onValueChange={setTenure}
                  min={3}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 years</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by lender or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Select value={sortBy} onValueChange={(v: 'rate' | 'monthly' | 'total') => setSortBy(v)}>
            <SelectTrigger className="w-full md:w-48">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rate">Lowest Rate</SelectItem>
              <SelectItem value="monthly">Lowest Monthly</SelectItem>
              <SelectItem value="total">Lowest Total Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <Select value={selectedState} onValueChange={setSelectedState}>
                      <SelectTrigger>
                        <SelectValue placeholder="All States" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {NIGERIAN_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Mortgage Type</label>
                    <Select value={mortgageType} onValueChange={setMortgageType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="islamic">Islamic (Halal)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate Type</label>
                    <Select value={rateType} onValueChange={setRateType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Rates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rates</SelectItem>
                        <SelectItem value="fixed">Fixed Rate</SelectItem>
                        <SelectItem value="variable">Variable Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Compare Bar */}
        {compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
          >
            <Card className="bg-primary text-primary-foreground shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="font-medium">{compareList.length}/3 selected</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCompareList([])}
                >
                  Clear
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={compareList.length < 2}
                >
                  Compare Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} products
          </p>

          {filteredProducts.map((product, index) => {
            const lender = getLender(product.lenderId);
            const monthlyPayment = calculateMonthlyPayment(loanAmount[0], product.interestRate, tenure[0]);
            const totalCost = monthlyPayment * tenure[0] * 12;
            const isSelected = compareList.includes(product.id);
            const isFav = isFavorite(product.id);

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Lender Info */}
                      <div className="flex items-center gap-4 lg:w-64">
                        <Link to={`/lender/${product.lenderId}`}>
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 transition-colors">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </Link>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <Link 
                            to={`/lender/${product.lenderId}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {product.lenderName}
                          </Link>
                          <div className="flex gap-1 mt-1">
                            {product.isPromotional && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" /> Promo
                              </Badge>
                            )}
                            {product.mortgageType === 'islamic' && (
                              <Badge variant="outline" className="text-xs">Halal</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Percent className="h-3 w-3" /> Interest Rate
                          </p>
                          <p className="text-xl font-bold text-primary">{product.interestRate}%</p>
                          <p className="text-xs text-muted-foreground">{product.rateType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Tenure
                          </p>
                          <p className="text-xl font-bold">{product.minTenure}-{product.maxTenure}</p>
                          <p className="text-xs text-muted-foreground">years</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Payment</p>
                          <p className="text-xl font-bold">{formatCurrency(monthlyPayment)}</p>
                          <p className="text-xs text-muted-foreground">estimated</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Total Cost
                          </p>
                          <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
                          <p className="text-xs text-muted-foreground">over {tenure[0]} years</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-40">
                        <Button asChild className="w-full">
                          <Link to="/apply">Apply Now</Link>
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant={isSelected ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleCompare(product.id)}
                            className="flex-1"
                          >
                            {isSelected ? <Check className="h-4 w-4 mr-1" /> : null}
                            {isSelected ? 'Selected' : 'Compare'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(product.id)}
                            className="shrink-0"
                          >
                            <Heart className={`h-4 w-4 ${isFav ? 'fill-destructive text-destructive' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {product.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <Check className="h-3 w-3 mr-1 text-primary" />
                            {feature}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">
                          Min Down: {product.minDownPayment}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          LTV: {product.maxLTV}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No products match your criteria. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

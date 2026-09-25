import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, ArrowRight, Building2, Percent, Clock, TrendingUp, Star, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/contexts/FavoritesContext';
import { mockProducts, mockLenders } from '@/data/mockData';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export default function Favorites() {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  
  const favoriteProducts = mockProducts.filter(p => favorites.includes(p.id));
  const getLender = (lenderId: string) => mockLenders.find(l => l.id === lenderId);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-destructive fill-destructive" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">My Favorites</h1>
              </div>
              <p className="text-muted-foreground">
                {favorites.length === 0 
                  ? "You haven't saved any mortgage products yet" 
                  : `You have ${favorites.length} saved product${favorites.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            {favorites.length > 0 && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={clearFavorites}>
                  <Trash2 className="h-4 w-4 mr-2" /> Clear All
                </Button>
                <Button asChild>
                  <Link to="/apply">
                    Apply Now <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Browse mortgage products and click the heart icon to save them here for easy comparison.
              </p>
              <Button asChild>
                <Link to="/compare">
                  Browse Products <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Favorite Products */}
        <div className="space-y-4">
          {favoriteProducts.map((product, index) => {
            const lender = getLender(product.lenderId);
            const monthlyPayment = calculateMonthlyPayment(20000000, product.interestRate, 15);
            const totalCost = monthlyPayment * 15 * 12;

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
                          <p className="text-xs text-muted-foreground">at ₦20M loan</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> Total Cost
                          </p>
                          <p className="text-xl font-bold">{formatCurrency(totalCost)}</p>
                          <p className="text-xs text-muted-foreground">over 15 years</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:w-40">
                        <Button asChild className="w-full">
                          <Link to="/apply">Apply Now</Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFavorite(product.id)}
                          className="w-full text-destructive hover:text-destructive"
                        >
                          <Heart className="h-4 w-4 mr-1 fill-current" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex flex-wrap gap-2">
                        {product.features.map((feature, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1 text-primary" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        {favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold mb-2">Ready to proceed?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Apply once and we'll match you with your favorite lenders.
                </p>
                <Button asChild>
                  <Link to="/apply">
                    Start Your Application <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

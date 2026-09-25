import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, CheckCircle2, AlertCircle, ArrowRight, 
  Home, Building2, Calendar, TrendingUp, Plus, Eye 
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { mockApplications, mockProducts, mockLenders } from '@/data/mockData';
import { APPLICATION_STATUSES } from '@/types/mortgage';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

const statusSteps = [
  { key: 'submitted', label: 'Submitted', icon: FileText },
  { key: 'under_review', label: 'Under Review', icon: Clock },
  { key: 'conditional_approval', label: 'Conditional', icon: AlertCircle },
  { key: 'valuation', label: 'Valuation', icon: Home },
  { key: 'offer_issued', label: 'Offer Issued', icon: CheckCircle2 },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Get user's applications (demo data)
  const userApplications = mockApplications.filter(app => app.userId === 'user-1');

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const getStatusProgress = (status: string) => {
    const index = getStatusIndex(status);
    return ((index + 1) / statusSteps.length) * 100;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Track your mortgage applications and manage your profile.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userApplications.length}</p>
                  <p className="text-xs text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userApplications.filter(a => a.status === 'under_review').length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userApplications.filter(a => a.status === 'completed').length}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Building2 className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(userApplications.flatMap(a => a.selectedLenders)).size}</p>
                  <p className="text-xs text-muted-foreground">Lenders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Applications */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Your Applications</h2>
              <Button asChild>
                <Link to="/apply">
                  <Plus className="h-4 w-4 mr-2" /> New Application
                </Link>
              </Button>
            </div>

            {userApplications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your homeownership journey by submitting your first application.
                  </p>
                  <Button asChild>
                    <Link to="/apply">Start Application</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              userApplications.map((app, index) => {
                const statusInfo = APPLICATION_STATUSES[app.status];
                const selectedLenderNames = app.selectedLenders
                  .map(id => mockLenders.find(l => l.id === id)?.shortName)
                  .filter(Boolean);

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <Home className="h-5 w-5" />
                              {app.propertyAddress || `${app.city}, ${app.state}`}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              Applied {new Date(app.createdAt).toLocaleDateString('en-NG', { 
                                year: 'numeric', month: 'short', day: 'numeric' 
                              })}
                            </CardDescription>
                          </div>
                          <Badge variant={
                            statusInfo.color === 'success' ? 'default' :
                            statusInfo.color === 'warning' ? 'secondary' :
                            statusInfo.color === 'destructive' ? 'destructive' : 'outline'
                          }>
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Property Value</p>
                            <p className="font-semibold">{formatCurrency(app.propertyValue)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Loan Amount</p>
                            <p className="font-semibold">{formatCurrency(app.loanAmount)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tenure</p>
                            <p className="font-semibold">{app.tenure} years</p>
                          </div>
                        </div>

                        {/* Progress Tracker */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Application Progress</span>
                            <span>{Math.round(getStatusProgress(app.status))}%</span>
                          </div>
                          <Progress value={getStatusProgress(app.status)} className="h-2" />
                          <div className="flex justify-between">
                            {statusSteps.slice(0, 5).map((step, i) => {
                              const isComplete = getStatusIndex(app.status) >= i;
                              const isCurrent = getStatusIndex(app.status) === i;
                              return (
                                <div 
                                  key={step.key}
                                  className={`flex flex-col items-center ${
                                    isComplete ? 'text-primary' : 'text-muted-foreground'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                    isComplete ? 'bg-primary text-primary-foreground' : 
                                    isCurrent ? 'bg-primary/20 text-primary' : 'bg-muted'
                                  }`}>
                                    {i + 1}
                                  </div>
                                  <span className="text-[10px] mt-1 hidden md:block">{step.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Selected Lenders */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Lenders:</span>
                            <div className="flex gap-1">
                              {selectedLenderNames.map(name => (
                                <Badge key={name} variant="outline" className="text-xs">
                                  {name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/application/${app.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* KYC Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Verification Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">BVN Verification</span>
                  {user?.bvnVerified ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NIN Verification</span>
                  {user?.ninVerified ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">KYC Status</span>
                  <Badge variant={
                    user?.kycStatus === 'verified' ? 'default' :
                    user?.kycStatus === 'expired' ? 'destructive' : 'secondary'
                  }>
                    {user?.kycStatus === 'verified' ? 'Complete' :
                     user?.kycStatus === 'expired' ? 'Expired' : 'Pending'}
                  </Badge>
                </div>
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
                    <TrendingUp className="h-4 w-4 mr-2" /> Compare Products
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/calculator">
                    <Building2 className="h-4 w-4 mr-2" /> Affordability Check
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link to="/learn">
                    <FileText className="h-4 w-4 mr-2" /> Mortgage Guide
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended For You</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockProducts.filter(p => p.isPromotional).slice(0, 2).map(product => (
                  <div key={product.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{product.name}</span>
                      <Badge variant="secondary" className="text-xs">{product.interestRate}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.lenderName}</p>
                  </div>
                ))}
                <Button asChild variant="link" className="w-full p-0">
                  <Link to="/compare">
                    View All Products <ArrowRight className="h-4 w-4 ml-1" />
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

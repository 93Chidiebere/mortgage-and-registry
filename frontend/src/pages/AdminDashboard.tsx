import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, FileText, Shield, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Eye, Settings, Download, Search, Filter,
  BarChart3, Activity, Clock, Ban, RefreshCw, UserPlus, Mail, Phone,
  MapPin, Globe, ChevronRight, Play, User
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useRevenue } from '@/hooks/useApi';
import { mockLenders, mockProducts, mockApplications, mockLeads, mockUsers } from '@/data/mockData';

interface PendingLender {
  id: string;
  companyName: string;
  shortName: string;
  licenseType: 'pmb' | 'commercial' | '';
  rcNumber: string;
  cbnLicense: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  state: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  mortgageTypes: string[];
  coverageStates: string[];
  minLoanAmount: string;
  maxLoanAmount: string;
  subscriptionPlan: 'basic' | 'premium' | '';
  status: 'pending_review' | 'approved' | 'rejected' | 'more_info';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

// Default mock pending lenders for demo
const defaultPendingLenders: PendingLender[] = [
  {
    id: 'pending-1',
    companyName: 'Gateway Mortgage Bank Plc',
    shortName: 'Gateway Mortgage',
    licenseType: 'pmb',
    rcNumber: 'RC 987654',
    cbnLicense: 'PMB/2024/045',
    email: 'info@gatewaymortgage.com.ng',
    phone: '+234 1 890 1234',
    website: 'https://gatewaymortgage.com.ng',
    address: '45 Broad Street, Lagos Island',
    state: 'Lagos',
    contactName: 'Emeka Okafor',
    contactRole: 'Managing Director',
    contactEmail: 'emeka.okafor@gatewaymortgage.com.ng',
    contactPhone: '+234 803 456 7890',
    mortgageTypes: ['Conventional'],
    coverageStates: ['Lagos', 'Ogun', 'Oyo', 'FCT'],
    minLoanAmount: '5000000',
    maxLoanAmount: '80000000',
    subscriptionPlan: 'premium',
    status: 'pending_review',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: 'pending-2',
    companyName: 'Unity Homes Finance Ltd',
    shortName: 'Unity Homes',
    licenseType: 'pmb',
    rcNumber: 'RC 654321',
    cbnLicense: '',
    email: 'contact@unityhomes.com',
    phone: '+234 9 567 8901',
    website: '',
    address: '12 Wuse II, Abuja',
    state: 'FCT',
    contactName: 'Fatima Ibrahim',
    contactRole: 'Head of Operations',
    contactEmail: 'fatima@unityhomes.com',
    contactPhone: '+234 807 654 3210',
    mortgageTypes: ['Conventional', 'Islamic (Sharia-compliant)'],
    coverageStates: ['FCT', 'Kaduna', 'Kano', 'Niger', 'Nasarawa'],
    minLoanAmount: '3000000',
    maxLoanAmount: '50000000',
    subscriptionPlan: 'basic',
    status: 'pending_review',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: 'pending-3',
    companyName: 'Southern Trust Mortgage',
    shortName: 'Southern Trust',
    licenseType: 'pmb',
    rcNumber: 'RC 112233',
    cbnLicense: 'PMB/2024/052',
    email: 'info@southerntrust.ng',
    phone: '+234 84 234 5678',
    website: 'https://southerntrust.ng',
    address: '8 Aba Road, Port Harcourt',
    state: 'Rivers',
    contactName: 'Blessing Nwosu',
    contactRole: 'Business Development Manager',
    contactEmail: 'blessing@southerntrust.ng',
    contactPhone: '+234 812 345 6789',
    mortgageTypes: ['Conventional'],
    coverageStates: ['Rivers', 'Bayelsa', 'Delta', 'Cross River', 'Akwa Ibom'],
    minLoanAmount: '2000000',
    maxLoanAmount: '40000000',
    subscriptionPlan: 'basic',
    status: 'approved',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    reviewNotes: 'All documents verified. CBN license confirmed.',
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [lenderFilter, setLenderFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingLenders, setPendingLenders] = useState<PendingLender[]>([]);
  const [selectedPending, setSelectedPending] = useState<PendingLender | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [pendingFilter, setPendingFilter] = useState<string>('all');
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  // Fetch real revenue
  const { data: revenueData } = useRevenue();
  const realPlatformRevenue = revenueData?.totalRevenue || 0;

  // Load pending lenders
  useEffect(() => {
    const saved = localStorage.getItem('pending_lenders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with defaults, avoiding duplicates
        const savedIds = parsed.map((p: PendingLender) => p.id);
        const merged = [
          ...parsed,
          ...defaultPendingLenders.filter(d => !savedIds.includes(d.id)),
        ];
        setPendingLenders(merged);
      } catch {
        setPendingLenders(defaultPendingLenders);
      }
    } else {
      setPendingLenders(defaultPendingLenders);
    }
  }, []);

  // Save pending lenders changes
  const savePendingLenders = (updated: PendingLender[]) => {
    setPendingLenders(updated);
    localStorage.setItem('pending_lenders', JSON.stringify(updated));
  };

  const handleApprove = (lender: PendingLender) => {
    const updated = pendingLenders.map(l =>
      l.id === lender.id
        ? { ...l, status: 'approved' as const, reviewedAt: new Date().toISOString(), reviewNotes }
        : l
    );
    savePendingLenders(updated);
    
    addNotification({
      userId: 'admin-1',
      title: 'Lender Approved',
      message: `${lender.companyName} has been approved and added to the platform.`,
      type: 'success',
      link: '/admin/dashboard',
    });

    toast({
      title: 'Lender Approved',
      description: `${lender.companyName} has been approved and will be onboarded to the platform.`,
    });
    setReviewDialogOpen(false);
    setSelectedPending(null);
    setReviewNotes('');
  };

  const handleReject = (lender: PendingLender) => {
    const updated = pendingLenders.map(l =>
      l.id === lender.id
        ? { ...l, status: 'rejected' as const, reviewedAt: new Date().toISOString(), reviewNotes }
        : l
    );
    savePendingLenders(updated);
    
    addNotification({
      userId: 'admin-1',
      title: 'Lender Rejected',
      message: `${lender.companyName} application has been rejected.`,
      type: 'warning',
      link: '/admin/dashboard',
    });

    toast({
      title: 'Application Rejected',
      description: `${lender.companyName}'s application has been rejected.`,
      variant: 'destructive',
    });
    setReviewDialogOpen(false);
    setSelectedPending(null);
    setReviewNotes('');
  };

  const handleRequestInfo = (lender: PendingLender) => {
    const updated = pendingLenders.map(l =>
      l.id === lender.id
        ? { ...l, status: 'more_info' as const, reviewedAt: new Date().toISOString(), reviewNotes }
        : l
    );
    savePendingLenders(updated);
    
    toast({
      title: 'More Info Requested',
      description: `A request for additional information has been sent to ${lender.companyName}.`,
    });
    setReviewDialogOpen(false);
    setSelectedPending(null);
    setReviewNotes('');
  };

  const pendingCount = pendingLenders.filter(l => l.status === 'pending_review').length;

  const filteredPending = useMemo(() => {
    return pendingLenders.filter(l => {
      if (pendingFilter !== 'all' && l.status !== pendingFilter) return false;
      if (searchTerm && !l.companyName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [pendingLenders, pendingFilter, searchTerm]);

  // Platform Statistics
  const platformStats = {
    totalLenders: mockLenders.length,
    activeLenders: mockLenders.filter(l => l.isActive).length,
    totalProducts: mockProducts.length,
    activeProducts: mockProducts.filter(p => p.isActive).length,
    totalApplications: mockApplications.length,
    totalLeads: mockLeads.length,
    totalUsers: mockUsers.filter(u => u.role === 'consumer').length,
    totalVolume: mockLeads.reduce((sum, l) => sum + l.loanAmount, 0),
    platformRevenue: realPlatformRevenue,
    pendingApprovals: pendingCount,
  };

  const alerts = [
    { id: 1, type: 'warning', message: 'Duplicate BVN detected for 2 applications', time: '2 hours ago' },
    { id: 2, type: 'info', message: `${pendingCount} lender applications awaiting review`, time: 'Now' },
    { id: 3, type: 'error', message: 'Income verification failed for app-123', time: '1 day ago' },
  ];

  const filteredLenders = useMemo(() => {
    return mockLenders.filter(lender => {
      if (lenderFilter === 'active' && !lender.isActive) return false;
      if (lenderFilter === 'inactive' && lender.isActive) return false;
      if (searchTerm && !lender.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [lenderFilter, searchTerm]);

  const getStatusBadge = (status: PendingLender['status']) => {
    switch (status) {
      case 'pending_review':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending Review</Badge>;
      case 'approved':
        return <Badge className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'more_info':
        return <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600"><AlertTriangle className="h-3 w-3" /> More Info Needed</Badge>;
    }
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
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Platform Administration</h1>
              <p className="text-muted-foreground text-sm">Manage lenders, monitor compliance, and oversee platform operations</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => navigate('/admin/onboard-bank')} className="gap-2">
              <Building2 className="h-4 w-4" />
              Onboard Bank
            </Button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <Building2 className="h-5 w-5 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{platformStats.activeLenders}</p>
              <p className="text-sm opacity-80">Active Lenders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <FileText className="h-5 w-5 mb-2 text-muted-foreground" />
              <p className="text-3xl font-bold">{platformStats.activeProducts}</p>
              <p className="text-sm text-muted-foreground">Active Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="h-5 w-5 mb-2 text-muted-foreground" />
              <p className="text-3xl font-bold">{platformStats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Registered Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TrendingUp className="h-5 w-5 mb-2 text-muted-foreground" />
              <p className="text-3xl font-bold">{platformStats.totalLeads}</p>
              <p className="text-sm text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
          <Card className={pendingCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : ''}>
            <CardContent className="p-4">
              <UserPlus className="h-5 w-5 mb-2 text-amber-600" />
              <p className="text-3xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Approvals</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/20">
            <CardContent className="p-4">
              <BarChart3 className="h-5 w-5 mb-2 text-secondary-foreground" />
              <p className="text-3xl font-bold">{formatCurrency(platformStats.platformRevenue)}</p>
              <p className="text-sm text-muted-foreground">Platform Revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <div className="flex items-center gap-3">
                      {alert.type === 'error' && <XCircle className="h-4 w-4 text-destructive" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                      {alert.type === 'info' && <Activity className="h-4 w-4 text-blue-600" />}
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals" className="relative">
              Lender Approvals
              {pendingCount > 0 && (
                <span className="ml-1.5 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 inline-flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="lenders">Lender Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="demo" className="gap-1">
              <Play className="h-3.5 w-3.5" />
              Demo Mode
            </TabsTrigger>
          </TabsList>

          {/* Demo Mode Tab */}
          <TabsContent value="demo">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h2 className="font-display text-xl font-bold mb-2">Platform Demo Mode</h2>
                <p className="text-muted-foreground text-sm">
                  Experience the platform as a customer or mortgage institution. You'll be switched to that role and can navigate the full flow. Return here anytime via the role switcher in the navbar.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Consumer Demo */}
                <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/60" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Customer Journey</CardTitle>
                        <CardDescription>Experience as a homebuyer</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Browse & compare mortgage products
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Use the affordability calculator
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Submit a mortgage application
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Track application status on dashboard
                      </li>
                    </ul>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => {
                          switchRole('consumer');
                          toast({ title: 'Switched to Consumer', description: 'You are now viewing as a homebuyer.' });
                          navigate('/dashboard');
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Start as Customer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          switchRole('consumer');
                          navigate('/compare');
                        }}
                      >
                        Compare
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lender Demo */}
                <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent to-accent/60" />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Mortgage Institution</CardTitle>
                        <CardDescription>Experience as a lender/PMB</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        View lender dashboard & analytics
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Manage mortgage products & rates
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Review incoming loan applications
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        Manage leads & conversions
                      </li>
                    </ul>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => {
                          switchRole('lender');
                          toast({ title: 'Switched to Lender', description: 'You are now viewing as a mortgage institution.' });
                          navigate('/lender/dashboard');
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Start as Lender
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          switchRole('lender');
                          navigate('/lender-onboarding');
                        }}
                      >
                        Onboarding
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                    To return to the Admin dashboard, use the <strong>role switcher</strong> in the top-right dropdown menu and select <strong>Admin</strong>.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pending Approvals Card */}
              {pendingCount > 0 && (
                <Card className="border-amber-500/50 bg-amber-500/5 md:col-span-2 lg:col-span-3">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-6 w-6 text-amber-600" />
                      <div>
                        <p className="font-medium">{pendingCount} lender application{pendingCount > 1 ? 's' : ''} awaiting review</p>
                        <p className="text-sm text-muted-foreground">New banks want to join the marketplace</p>
                      </div>
                    </div>
                    <Button onClick={() => setActiveTab('approvals')} className="gap-1">
                      Review Now <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Applications by Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applications by Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { status: 'Draft', count: 12, color: 'bg-muted-foreground' },
                    { status: 'Under Review', count: 8, color: 'bg-amber-500' },
                    { status: 'Approved', count: 15, color: 'bg-green-500' },
                    { status: 'Rejected', count: 3, color: 'bg-destructive' },
                  ].map(item => (
                    <div key={item.status} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="flex-1 text-sm">{item.status}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Lenders */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Performing Lenders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockLenders.slice(0, 4).map((lender, i) => (
                    <div key={lender.id} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm">{lender.shortName}</span>
                      <Badge variant="outline">{mockLeads.filter(l => l.lenderId === lender.id).length} leads</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'New application submitted', user: 'Adeola J.', time: '5 min ago' },
                    { action: 'Lead accepted', user: 'First PMB', time: '1 hour ago' },
                    { action: 'KYC verified', user: 'System', time: '2 hours ago' },
                    { action: 'New lender application', user: 'Gateway Mortgage', time: '2 days ago' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p>{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.user} • {item.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Volume by State */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Loan Volume by State</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { state: 'Lagos', volume: 450000000, percent: 45 },
                      { state: 'FCT', volume: 280000000, percent: 28 },
                      { state: 'Rivers', volume: 150000000, percent: 15 },
                      { state: 'Ogun', volume: 70000000, percent: 7 },
                    ].map(item => (
                      <div key={item.state} className="p-4 bg-muted rounded-lg">
                        <p className="font-medium">{item.state}</p>
                        <p className="text-xl font-bold text-primary">{item.percent}%</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.volume)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'API Uptime', value: '99.9%' },
                    { label: 'Avg Response Time', value: '142ms' },
                    { label: 'Active Sessions', value: '234' },
                    { label: 'Error Rate', value: '0.02%' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lender Approvals Tab */}
          <TabsContent value="approvals">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      Lender Onboarding Applications
                    </CardTitle>
                    <CardDescription>Review and approve new lender registrations</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={pendingFilter} onValueChange={setPendingFilter}>
                      <SelectTrigger className="w-44">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Applications</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="more_info">More Info Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredPending.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No applications match the current filter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPending
                      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                      .map(lender => (
                      <Card key={lender.id} className={lender.status === 'pending_review' ? 'border-amber-500/30' : ''}>
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{lender.companyName}</h3>
                                  <p className="text-sm text-muted-foreground">{lender.shortName}</p>
                                </div>
                                {getStatusBadge(lender.status)}
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Shield className="h-3.5 w-3.5" />
                                  <span>{lender.licenseType === 'pmb' ? 'PMB' : 'Commercial'} • {lender.rcNumber}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  <span className="truncate">{lender.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <MapPin className="h-3.5 w-3.5" />
                                  <span>{lender.state}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>Submitted {new Date(lender.submittedAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {lender.mortgageTypes.map(t => (
                                  <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                                ))}
                                <Badge variant="secondary" className="text-xs">
                                  {lender.coverageStates.length} state{lender.coverageStates.length > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {lender.subscriptionPlan} plan
                                </Badge>
                              </div>

                              {lender.reviewNotes && (
                                <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Review Notes</p>
                                  <p>{lender.reviewNotes}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex md:flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPending(lender);
                                  setReviewNotes(lender.reviewNotes || '');
                                  setReviewDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Review
                              </Button>
                              {lender.status === 'pending_review' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(lender)}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lender Management Tab */}
          <TabsContent value="lenders">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Registered Lenders</CardTitle>
                    <CardDescription>Manage partner banks and PMBs</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search lenders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={lenderFilter} onValueChange={setLenderFilter}>
                      <SelectTrigger className="w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Lenders</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lender</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Lead Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLenders.map(lender => (
                      <TableRow key={lender.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{lender.name}</p>
                              <p className="text-sm text-muted-foreground">{lender.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="uppercase">
                            {lender.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={lender.subscription === 'premium' ? 'default' : 'secondary'}>
                            {lender.subscription}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mockProducts.filter(p => p.lenderId === lender.id).length}
                        </TableCell>
                        <TableCell>{formatCurrency(lender.leadFee)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch checked={lender.isActive} />
                            <span className="text-sm">{lender.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">KYC Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-500/10 rounded-lg">
                      <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-xs text-muted-foreground">Verified</p>
                    </div>
                    <div className="p-4 bg-yellow-500/10 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">23</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-4 bg-red-500/10 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">5</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Access Logs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: 'Document accessed', user: 'First PMB', target: 'app-001', time: '10 min ago' },
                    { action: 'KYC data shared', user: 'System', target: 'lead-234', time: '1 hour ago' },
                    { action: 'Application viewed', user: 'NHFC', target: 'app-156', time: '2 hours ago' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.user} → {log.target}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fraud Detection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-medium">Duplicate BVN Alert</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      BVN 22345678901 found in 2 different applications
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">
                      Review
                    </Button>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Income Inconsistency</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Declared income doesn't match bank statement for app-089
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consent Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active consents</span>
                    <span className="font-medium">234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Expired consents</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Revoked consents</span>
                    <span className="font-medium">3</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh Expired
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Regulatory Reports</CardTitle>
                <CardDescription>Generate and download CBN-compliant reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Monthly Transaction Report', period: 'January 2024', status: 'Ready' },
                    { name: 'KYC Compliance Report', period: 'Q4 2023', status: 'Ready' },
                    { name: 'Lender Performance Report', period: 'January 2024', status: 'Processing' },
                    { name: 'Fraud Analysis Report', period: 'Q4 2023', status: 'Ready' },
                    { name: 'Platform Analytics', period: 'January 2024', status: 'Ready' },
                    { name: 'Revenue Summary', period: 'January 2024', status: 'Ready' },
                  ].map((report, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{report.name}</p>
                            <p className="text-sm text-muted-foreground">{report.period}</p>
                          </div>
                          <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                          disabled={report.status !== 'Ready'}
                        >
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Lender Application</DialogTitle>
            </DialogHeader>
            {selectedPending && (
              <div className="space-y-6">
                {/* Company Overview */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedPending.companyName}</h3>
                      <p className="text-sm text-muted-foreground">{selectedPending.shortName}</p>
                    </div>
                    {getStatusBadge(selectedPending.status)}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Company Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License Type</span>
                        <span className="font-medium uppercase">{selectedPending.licenseType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">RC Number</span>
                        <span className="font-medium">{selectedPending.rcNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CBN License</span>
                        <span className="font-medium">{selectedPending.cbnLicense || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">State</span>
                        <span className="font-medium">{selectedPending.state}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subscription</span>
                        <Badge variant={selectedPending.subscriptionPlan === 'premium' ? 'default' : 'secondary'} className="capitalize">
                          {selectedPending.subscriptionPlan}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Contact Info</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPending.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPending.phone}</span>
                      </div>
                      {selectedPending.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedPending.website}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedPending.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Primary Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{selectedPending.contactName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium">{selectedPending.contactRole}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{selectedPending.contactEmail}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{selectedPending.contactPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Products & Coverage</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Mortgage Types</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPending.mortgageTypes.map(t => (
                            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Coverage States</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPending.coverageStates.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      {selectedPending.minLoanAmount && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Loan Range</span>
                          <span className="font-medium">
                            {formatCurrency(parseInt(selectedPending.minLoanAmount))} - {formatCurrency(parseInt(selectedPending.maxLoanAmount))}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Review Notes */}
                <div className="space-y-2">
                  <Label>Review Notes</Label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this application (e.g., verification results, concerns, conditions)..."
                    className="min-h-[100px]"
                  />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRequestInfo(selectedPending)}
                    disabled={selectedPending.status === 'approved'}
                    className="gap-1"
                  >
                    <AlertTriangle className="h-4 w-4" /> Request More Info
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedPending)}
                    disabled={selectedPending.status === 'approved'}
                    className="gap-1"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedPending)}
                    disabled={selectedPending.status === 'approved'}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}

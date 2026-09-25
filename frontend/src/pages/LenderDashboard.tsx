import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, TrendingUp, DollarSign, Filter, Search,
  CheckCircle2, XCircle, Clock, Eye, Download, Building2,
  BarChart3, MapPin, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts, mockLenders } from '@/data/mockData';
import { useLenderLeads, useUpdateLeadStatus } from '@/hooks/useApi';
import { Lead, MortgageProduct } from '@/types/mortgage';
import { ProductManagement } from '@/components/ProductManagement';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
};

export default function LenderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Get lender info
  const lender = mockLenders.find(l => l.id === (user?.lenderId || 'lender-1'));
  const [lenderProducts, setLenderProducts] = useState<MortgageProduct[]>(
    mockProducts.filter(p => p.lenderId === lender?.id)
  );
  
  const { data: leadsData } = useLenderLeads();
  const updateStatus = useUpdateLeadStatus();
  
  const lenderLeads: Lead[] = leadsData || [];

  const handleUpdateStatus = (id: string, newStatus: string) => {
    updateStatus.mutate({ id, status: newStatus }, {
      onSuccess: () => {
        if (selectedLead) setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    });
  };

  const filteredLeads = useMemo(() => {
    return lenderLeads.filter(lead => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (searchTerm && !lead.userName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !lead.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [lenderLeads, statusFilter, searchTerm]);

  const stats = {
    totalLeads: lenderLeads.length,
    newLeads: lenderLeads.filter(l => l.status === 'new').length,
    acceptedLeads: lenderLeads.filter(l => l.status === 'accepted').length,
    closedDeals: lenderLeads.filter(l => l.status === 'closed').length,
    totalVolume: lenderLeads.reduce((sum, l) => sum + l.loanAmount, 0),
    avgLoanSize: lenderLeads.length > 0 ? lenderLeads.reduce((sum, l) => sum + l.loanAmount, 0) / lenderLeads.length : 0,
  };

  const getStatusBadge = (status: Lead['status']) => {
    const styles = {
      new: { variant: 'secondary' as const, icon: Clock },
      accepted: { variant: 'default' as const, icon: CheckCircle2 },
      rejected: { variant: 'destructive' as const, icon: XCircle },
      in_progress: { variant: 'outline' as const, icon: TrendingUp },
      approved: { variant: 'default' as const, icon: CheckCircle2 },
      closed: { variant: 'default' as const, icon: CheckCircle2 },
    };
    const style = styles[status];
    const Icon = style.icon;
    return (
      <Badge variant={style.variant} className="capitalize">
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getProbabilityBadge = (prob: Lead['approvalProbability']) => {
    const colors = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[prob]}`}>
        {prob.charAt(0).toUpperCase() + prob.slice(1)} Probability
      </span>
    );
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
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">{lender?.name || 'Lender Dashboard'}</h1>
              <p className="text-muted-foreground text-sm">{lender?.subscription === 'premium' ? 'Premium Partner' : 'Basic Partner'}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3" /> 12%
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.newLeads}</p>
              <p className="text-xs text-muted-foreground">New Leads</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.acceptedLeads}</p>
              <p className="text-xs text-muted-foreground">Accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold mt-2">{stats.closedDeals}</p>
              <p className="text-xs text-muted-foreground">Closed Deals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.totalVolume)}</p>
              <p className="text-xs text-muted-foreground">Total Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold mt-2">{formatCurrency(stats.avgLoanSize)}</p>
              <p className="text-xs text-muted-foreground">Avg. Loan Size</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="leads">Lead Management</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Mortgage Leads</CardTitle>
                    <CardDescription>Review and manage incoming mortgage applications</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search leads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-36">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Loan Details</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map(lead => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.userName}</p>
                            <p className="text-sm text-muted-foreground">{lead.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(lead.loanAmount)}</p>
                            <p className="text-sm text-muted-foreground">
                              Property: {formatCurrency(lead.propertyValue)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getProbabilityBadge(lead.approvalProbability)}</TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString('en-NG', {
                            month: 'short', day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Lead Details</DialogTitle>
                                </DialogHeader>
                                {selectedLead && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Applicant</p>
                                        <p className="font-medium">{selectedLead.userName}</p>
                                        <p className="text-sm">{selectedLead.userEmail}</p>
                                        <p className="text-sm">{selectedLead.userPhone}</p>
                                      </div>
                                      <div className="p-4 bg-muted rounded-lg">
                                        <p className="text-sm text-muted-foreground">Loan Request</p>
                                        <p className="font-medium text-xl">{formatCurrency(selectedLead.loanAmount)}</p>
                                        <p className="text-sm">Property: {formatCurrency(selectedLead.propertyValue)}</p>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {selectedLead.status === 'new' && (
                                        <>
                                          <Button className="flex-1" onClick={() => handleUpdateStatus(selectedLead.id, 'accepted')} disabled={updateStatus.isPending}>
                                            <CheckCircle2 className="h-4 w-4 mr-2" /> Accept Lead
                                          </Button>
                                          <Button variant="outline" className="flex-1" onClick={() => handleUpdateStatus(selectedLead.id, 'rejected')} disabled={updateStatus.isPending}>
                                            <XCircle className="h-4 w-4 mr-2" /> Reject
                                          </Button>
                                        </>
                                      )}
                                      {(selectedLead.status === 'accepted' || selectedLead.status === 'approved') && (
                                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(selectedLead.id, 'disbursed')} disabled={updateStatus.isPending}>
                                          <DollarSign className="h-4 w-4 mr-2" /> Mark as Disbursed
                                        </Button>
                                      )}
                                      <Button variant="secondary">
                                        <Download className="h-4 w-4 mr-2" /> Download Docs
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
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

          {/* Products Tab */}
          <TabsContent value="products">
            <ProductManagement
              products={lenderProducts}
              lenderId={lender?.id || 'lender-1'}
              lenderName={lender?.name || 'Lender'}
              onProductsChange={setLenderProducts}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Leads Received', value: stats.totalLeads, percent: 100 },
                    { label: 'Leads Accepted', value: stats.acceptedLeads, percent: (stats.acceptedLeads / stats.totalLeads) * 100 || 0 },
                    { label: 'Applications Approved', value: 1, percent: 50 },
                    { label: 'Deals Closed', value: stats.closedDeals, percent: (stats.closedDeals / stats.totalLeads) * 100 || 0 },
                  ].map((step, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{step.label}</span>
                        <span className="font-medium">{step.value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${step.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { state: 'Lagos', leads: 45, percent: 60 },
                      { state: 'FCT', leads: 20, percent: 27 },
                      { state: 'Rivers', leads: 8, percent: 11 },
                      { state: 'Ogun', leads: 2, percent: 2 },
                    ].map(item => (
                      <div key={item.state} className="flex items-center gap-3">
                        <span className="w-16 text-sm">{item.state}</span>
                        <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                          <div 
                            className="h-full bg-primary/80 flex items-center justify-end pr-2"
                            style={{ width: `${item.percent}%` }}
                          >
                            <span className="text-xs text-primary-foreground font-medium">{item.leads}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold text-primary">{formatCurrency(stats.closedDeals * (lender?.leadFee || 150000))}</p>
                      <p className="text-sm text-muted-foreground">Total Lead Fees</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatCurrency(lender?.leadFee || 150000)}</p>
                      <p className="text-sm text-muted-foreground">Per Lead Fee</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{((stats.closedDeals / stats.totalLeads) * 100 || 0).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-2xl font-bold">{formatCurrency(stats.avgLoanSize)}</p>
                      <p className="text-sm text-muted-foreground">Avg. Ticket Size</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

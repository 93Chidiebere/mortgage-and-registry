import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MortgageProduct, NIGERIAN_STATES } from '@/types/mortgage';
import { MapPin } from 'lucide-react';

interface ProductManagementProps {
  products: MortgageProduct[];
  lenderId: string;
  lenderName: string;
  onProductsChange: (products: MortgageProduct[]) => void;
}

const emptyProduct: Partial<MortgageProduct> = {
  name: '',
  interestRate: 18,
  rateType: 'fixed',
  minTenure: 5,
  maxTenure: 20,
  minLoanAmount: 5000000,
  maxLoanAmount: 50000000,
  minDownPayment: 20,
  maxLTV: 80,
  processingFee: 1,
  legalFee: 0.5,
  insuranceFee: 0.25,
  adminFee: 50000,
  eligibleStates: ['Lagos', 'FCT'],
  minIncome: 250000,
  mortgageType: 'conventional',
  isActive: true,
  isPromotional: false,
  features: [],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);

export function ProductManagement({ products, lenderId, lenderName, onProductsChange }: ProductManagementProps) {
  const [editingProduct, setEditingProduct] = useState<Partial<MortgageProduct> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [featureInput, setFeatureInput] = useState('');
  const { toast } = useToast();

  const openNew = () => {
    setEditingProduct({ ...emptyProduct, lenderId, lenderName });
    setIsNew(true);
    setDialogOpen(true);
  };

  const openEdit = (product: MortgageProduct) => {
    setEditingProduct({ ...product });
    setIsNew(false);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingProduct?.name) {
      toast({ title: 'Error', description: 'Product name is required', variant: 'destructive' });
      return;
    }

    if (isNew) {
      const newProduct: MortgageProduct = {
        ...(editingProduct as MortgageProduct),
        id: `prod-${Date.now()}`,
        lenderId,
        lenderName,
        createdAt: new Date(),
      };
      onProductsChange([...products, newProduct]);
      toast({ title: 'Product Created', description: `${newProduct.name} has been added.` });
    } else {
      onProductsChange(products.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } as MortgageProduct : p));
      toast({ title: 'Product Updated', description: `${editingProduct.name} has been updated.` });
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    onProductsChange(products.filter(p => p.id !== id));
    setDeleteConfirm(null);
    toast({ title: 'Product Deleted', description: 'The product has been removed.' });
  };

  const addFeature = () => {
    if (featureInput.trim() && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: [...(editingProduct.features || []), featureInput.trim()],
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: editingProduct.features?.filter((_, i) => i !== index),
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setEditingProduct(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Mortgage Products</CardTitle>
            <CardDescription>Manage your mortgage product offerings</CardDescription>
          </div>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {products.map(product => (
            <Card key={product.id} className={!product.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {product.isPromotional && <Badge variant="secondary">Promotional</Badge>}
                      {product.mortgageType === 'islamic' && <Badge variant="outline">Islamic</Badge>}
                      <Badge variant={product.isActive ? 'default' : 'secondary'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Dialog open={deleteConfirm === product.id} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Product</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to delete "{product.name}"? This action cannot be undone.
                        </p>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                          <Button variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{product.interestRate}% ({product.rateType})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tenure</p>
                    <p className="font-medium">{product.minTenure}-{product.maxTenure} years</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Loan Range</p>
                    <p className="font-medium">{formatCurrency(product.minLoanAmount)} - {formatCurrency(product.maxLoanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Min Income</p>
                    <p className="font-medium">{formatCurrency(product.minIncome)}/mo</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {product.eligibleStates.slice(0, 3).join(', ')}
                    {product.eligibleStates.length > 3 && ` +${product.eligibleStates.length - 3} more`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isNew ? 'Add New Product' : 'Edit Product'}</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Product Name</Label>
                    <Input value={editingProduct.name || ''} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Home Starter Plan" />
                  </div>
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input type="number" step="0.1" value={editingProduct.interestRate || ''} onChange={(e) => updateField('interestRate', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label>Rate Type</Label>
                    <Select value={editingProduct.rateType} onValueChange={(v) => updateField('rateType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Tenure (years)</Label>
                    <Input type="number" value={editingProduct.minTenure || ''} onChange={(e) => updateField('minTenure', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Max Tenure (years)</Label>
                    <Input type="number" value={editingProduct.maxTenure || ''} onChange={(e) => updateField('maxTenure', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Min Loan Amount (₦)</Label>
                    <Input type="number" value={editingProduct.minLoanAmount || ''} onChange={(e) => updateField('minLoanAmount', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Max Loan Amount (₦)</Label>
                    <Input type="number" value={editingProduct.maxLoanAmount || ''} onChange={(e) => updateField('maxLoanAmount', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Min Down Payment (%)</Label>
                    <Input type="number" value={editingProduct.minDownPayment || ''} onChange={(e) => updateField('minDownPayment', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Max LTV (%)</Label>
                    <Input type="number" value={editingProduct.maxLTV || ''} onChange={(e) => updateField('maxLTV', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Processing Fee (%)</Label>
                    <Input type="number" step="0.1" value={editingProduct.processingFee || ''} onChange={(e) => updateField('processingFee', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label>Legal Fee (%)</Label>
                    <Input type="number" step="0.1" value={editingProduct.legalFee || ''} onChange={(e) => updateField('legalFee', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <Label>Admin Fee (₦)</Label>
                    <Input type="number" value={editingProduct.adminFee || ''} onChange={(e) => updateField('adminFee', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Min Monthly Income (₦)</Label>
                    <Input type="number" value={editingProduct.minIncome || ''} onChange={(e) => updateField('minIncome', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <Label>Mortgage Type</Label>
                    <Select value={editingProduct.mortgageType} onValueChange={(v) => updateField('mortgageType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conventional">Conventional</SelectItem>
                        <SelectItem value="islamic">Islamic (Sharia)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch checked={editingProduct.isActive ?? true} onCheckedChange={(v) => updateField('isActive', v)} />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editingProduct.isPromotional ?? false} onCheckedChange={(v) => updateField('isPromotional', v)} />
                    <Label>Promotional</Label>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Features</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add a feature" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} />
                    <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.features?.map((f, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {f}
                        <button onClick={() => removeFeature(i)}><X className="h-3 w-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" /> {isNew ? 'Create Product' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

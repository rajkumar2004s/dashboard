import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import type { Product, Department } from '@shared/schema';

interface ProductContribution {
  productId: string;
  departmentId: string;
  percentage: number;
}

export default function EmployeeForm() {
  const { user } = useAuth();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [contributions, setContributions] = useState<ProductContribution[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: allDepartments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const totalPercentage = contributions.reduce((sum, c) => sum + (c.percentage || 0), 0);

  if (productsLoading || departmentsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
      setContributions(prev => prev.filter(c => c.productId !== productId));
    } else {
      newSelected.add(productId);
      setContributions(prev => [...prev, { productId, departmentId: '', percentage: 0 }]);
    }
    setSelectedProducts(newSelected);
  };

  const handleDepartmentChange = (productId: string, departmentId: string) => {
    setContributions(prev =>
      prev.map(c => c.productId === productId ? { ...c, departmentId } : c)
    );
  };

  const handlePercentageChange = (productId: string, percentage: string) => {
    const value = parseInt(percentage) || 0;
    setContributions(prev =>
      prev.map(c => c.productId === productId ? { ...c, percentage: value } : c)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (totalPercentage !== 100) {
      toast.error('Total contribution must equal 100%');
      return;
    }

    if (contributions.some(c => !c.departmentId)) {
      toast.error('Please select a department for each product');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest('POST', '/api/contributions', {
        employeeId: user?.id,
        contributions: contributions.map(c => ({
          productId: c.productId,
          departmentId: c.departmentId,
          contributionPercent: c.percentage
        }))
      });
      
      toast.success('Contribution submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['/api/contributions'] });
      
      setSelectedProducts(new Set());
      setContributions([]);
    } catch (error) {
      toast.error('Failed to submit contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = totalPercentage === 100 && contributions.every(c => c.departmentId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Submit Contribution</h1>
          <p className="text-muted-foreground">
            Select products and allocate your contribution percentage. Total must equal 100%.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Select Products</CardTitle>
              <CardDescription>Choose which products you contribute to</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {products.map(product => (
                <div key={product.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={product.id}
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleProductToggle(product.id)}
                      data-testid={`checkbox-product-${product.id}`}
                    />
                    <Label htmlFor={product.id} className="font-medium text-base cursor-pointer">
                      {product.name}
                    </Label>
                  </div>

                  {selectedProducts.has(product.id) && (
                    <div className="ml-8 space-y-4 p-4 bg-muted rounded-md">
                      <div className="space-y-2">
                        <Label htmlFor={`dept-${product.id}`}>Department</Label>
                        <Select
                          value={contributions.find(c => c.productId === product.id)?.departmentId || ''}
                          onValueChange={(value) => handleDepartmentChange(product.id, value)}
                        >
                          <SelectTrigger id={`dept-${product.id}`} data-testid={`select-department-${product.id}`}>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {allDepartments
                              .filter(d => d.productId === product.id)
                              .map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`percent-${product.id}`}>Contribution Percentage</Label>
                        <div className="relative">
                          <Input
                            id={`percent-${product.id}`}
                            type="number"
                            min="0"
                            max="100"
                            value={contributions.find(c => c.productId === product.id)?.percentage || ''}
                            onChange={(e) => handlePercentageChange(product.id, e.target.value)}
                            data-testid={`input-percentage-${product.id}`}
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={`${totalPercentage === 100 ? 'border-chart-2 bg-chart-2/10' : totalPercentage > 100 ? 'border-destructive bg-destructive/10' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contribution</p>
                  <p className={`text-3xl font-semibold font-mono ${totalPercentage === 100 ? 'text-chart-2' : totalPercentage > 100 ? 'text-destructive' : 'text-foreground'}`} data-testid="text-total-percentage">
                    {totalPercentage}%
                  </p>
                </div>
                {totalPercentage === 100 && (
                  <div className="text-chart-2 text-sm font-medium">✓ Valid</div>
                )}
                {totalPercentage > 100 && (
                  <div className="text-destructive text-sm font-medium">! Over 100%</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={!isValid || isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Contribution'}
          </Button>
        </form>
      </div>
    </div>
  );
}

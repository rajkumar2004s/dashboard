import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchDepartments, fetchProducts } from "@/services/catalogService";
import { createContributions } from "@/services/contributionService";
import { queryClient } from "@/lib/queryClient";

interface ContributionEntry {
  productId: string;
  percentage: number;
}

export default function EmployeeForm() {
  const { currentUser } = useAuth();
  const profile = currentUser; // Alias for compatibility
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => fetchDepartments(),
    staleTime: 1000 * 60 * 5,
  });

  const department = useMemo(
    () => departments.find((dept) => dept.id === profile?.departmentId),
    [departments, profile?.departmentId]
  );

  const totalPercentage = useMemo(
    () =>
      Array.from(selectedProducts.values()).reduce(
        (total, productId) => total + (entries[productId] ?? 0),
        0
      ),
    [selectedProducts, entries]
  );

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        setEntries((current) => {
          const { [productId]: _removed, ...rest } = current;
          return rest;
        });
      } else {
        next.add(productId);
        setEntries((current) => ({ ...current, [productId]: current[productId] ?? 0 }));
      }
      return next;
    });
  };

  const handlePercentageChange = (productId: string, value: string) => {
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return;
    setEntries((current) => ({ ...current, [productId]: Math.max(0, Math.min(100, numericValue)) }));
  };

  const isValid =
    profile?.departmentId &&
    selectedProducts.size > 0 &&
    totalPercentage === 100 &&
    Array.from(selectedProducts.values()).every((productId) => (entries[productId] ?? 0) > 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id || !profile.departmentId) {
      toast.error("Your profile is missing department details. Please contact an administrator.");
      return;
    }

    if (!isValid) {
      toast.error("Ensure you have allocated 100% across the selected products.");
      return;
    }

    const payload: ContributionEntry[] = Array.from(selectedProducts.values()).map((productId) => ({
      productId,
      percentage: entries[productId] ?? 0,
    }));

    setIsSubmitting(true);
    try {
      await createContributions(
        profile.id,
        payload.map((entry) => ({
          productId: entry.productId,
          departmentId: profile.departmentId!,
          contributionPercent: entry.percentage,
        }))
      );

      toast.success("Contribution submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["contributions", "employee", profile.id] });
      setSelectedProducts(new Set());
      setEntries({});
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit contribution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="rounded-md border border-border bg-card px-6 py-4 text-center text-muted-foreground">
            Sign in to submit your contribution.
          </div>
        </div>
      </div>
    );
  }

  if (productsLoading || departmentsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-muted-foreground">Loading products and departments…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-10 space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Employee Contribution Form</h1>
          <p className="text-sm text-muted-foreground">
            Select the products you have contributed to and allocate your percentage of effort. Your allocation must total 100%.
          </p>
          {department && (
            <div className="text-xs text-muted-foreground">
              <strong>Department:</strong> {department.name}
            </div>
          )}
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Product Allocation</CardTitle>
              <CardDescription>Select one or more products and provide your contribution percentage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {products.map((product) => {
                const isSelected = selectedProducts.has(product.id);
                return (
                  <div key={product.id} className="rounded-md border border-border/60 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`product-${product.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleProductToggle(product.id)}
                        />
                        <Label htmlFor={`product-${product.id}`} className="text-base font-medium">
                          {product.name}
                        </Label>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-4 grid gap-4 rounded-md bg-muted/40 p-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                          <p className="font-medium text-foreground">
                            {department?.name ?? "Department not assigned"}
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`percentage-${product.id}`} className="text-sm font-medium">
                            Contribution Percentage
                          </Label>
                          <div className="relative">
                            <Input
                              id={`percentage-${product.id}`}
                              type="number"
                              min={0}
                              max={100}
                              step={5}
                              value={entries[product.id] ?? ""}
                              onChange={(event) => handlePercentageChange(product.id, event.target.value)}
                              className="pr-10"
                            />
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {products.length === 0 && (
                <div className="rounded-md border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  No products configured yet. Contact your manager for access.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Allocation</p>
                <p
                  className={`text-3xl font-semibold ${
                    totalPercentage === 100 ? "text-chart-2" : totalPercentage > 100 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {totalPercentage}%
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>Allocations must total exactly 100%.</p>
                <p>Current status: {totalPercentage === 100 ? "Ready for submission" : "Incomplete"}</p>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Contribution"}
          </Button>
        </form>
      </div>
    </div>
  );
}

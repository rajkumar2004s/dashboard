import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDepartments, fetchProducts } from "@/services/catalogService";
import type { Department, Product, UserRole } from "@/types/domain";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const ROLE_OPTIONS: Array<{ value: UserRole; label: string; description: string }> = [
  { value: "ceo", label: "CEO", description: "Executive leadership with global visibility and control." },
  { value: "director", label: "Director", description: "Owns a product line and oversees its departments." },
  { value: "manager", label: "Manager", description: "Leads a single department and its employees." },
  { value: "employee", label: "Employee", description: "Individual contributor working within a department." },
];

export default function Onboarding() {
  const { session, profile, needsOnboarding, completeProfile, isLoading } = useAuth();
  const [, navigate] = useLocation();

  const [fullName, setFullName] = useState(session?.user.user_metadata?.full_name ?? "");
  const [role, setRole] = useState<UserRole | "">("");
  const [productId, setProductId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Allow direct access to onboarding - don't redirect away
  // Users can access /onboarding directly to update their profile

  useEffect(() => {
    (async () => {
      const [productList, departmentList] = await Promise.all([fetchProducts(), fetchDepartments()]);
      setProducts(productList);
      setDepartments(departmentList);
    })();
  }, []);

  const filteredDepartments = useMemo(() => {
    if (role === "ceo" || role === "") {
      return [];
    }
    if (role === "director") {
      return departments.filter((dept) => dept.productId === productId);
    }
    if (role === "manager" || role === "employee") {
      return productId ? departments.filter((dept) => dept.productId === productId) : departments;
    }
    return departments;
  }, [departments, role, productId]);

  const roleRequiresProduct = role === "director" || role === "manager";
  const roleRequiresDepartment = role === "manager" || role === "employee";

  const canSubmit =
    Boolean(fullName.trim()) &&
    Boolean(role) &&
    (!roleRequiresProduct || productId) &&
    (!roleRequiresDepartment || departmentId);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!role || !session?.user) {
      toast.error("Please sign in first.");
      return;
    }
    if (!canSubmit) {
      toast.error("Please fill in the required information.");
      return;
    }

    setIsSubmitting(true);
    try {
      await completeProfile({
        name: fullName.trim(),
        role,
        productId: role === "ceo" ? null : productId || null,
        departmentId: roleRequiresDepartment ? departmentId : null,
      });
      toast.success("Profile completed successfully! Redirecting...");
      // Small delay to show success message
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error: any) {
      console.error("Onboarding error:", error);
      const errorMessage = error?.message || error?.error?.message || "Failed to complete onboarding.";
      
      // Check if it's an RLS error
      if (errorMessage.includes("policy") || errorMessage.includes("RLS") || errorMessage.includes("permission")) {
        toast.error("Database permissions issue. Please run the SQL fix in Supabase. See FIX_RLS_NOW.md");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Preparing your workspace...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-3xl shadow-lg border-border">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl">Welcome to NxtWave Workflow</CardTitle>
          <CardDescription>
            Tell us about your role so we can configure dashboards, permissions, and workflows tailored to your responsibilities.
          </CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="uppercase tracking-wide text-xs">
              {session?.user.email}
            </Badge>
            {profile?.role && (
              <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30 text-xs">Existing role: {profile.role}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <Label className="text-sm font-medium">Full Name</Label>
              <Input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="grid gap-4">
              <Label className="text-sm font-medium">Role</Label>
              <Select
                value={role}
                onValueChange={(value: UserRole) => {
                  setRole(value);
                  if (value === "ceo") {
                    setProductId("");
                    setDepartmentId("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role in the organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Roles</SelectLabel>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {roleRequiresProduct && (
              <div className="grid gap-4">
                <Label className="text-sm font-medium">Product</Label>
                <Select
                  value={productId}
                  onValueChange={(value) => {
                    setProductId(value);
                    setDepartmentId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select the product you oversee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Products</SelectLabel>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            {roleRequiresDepartment && (
              <div className="grid gap-4">
                <Label className="text-sm font-medium">Department</Label>
                <Select value={departmentId} onValueChange={(value) => setDepartmentId(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Departments</SelectLabel>
                      {filteredDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? "Configuring Access..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


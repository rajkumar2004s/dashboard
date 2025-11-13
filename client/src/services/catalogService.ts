import { supabase } from "@/lib/supabase";
import type { Department, Product } from "@/types/domain";
import { departments as seedDepartments, products as seedProducts } from "@/data/seedData";

const client = supabase as any;

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await client.from("products").select("*").order("name");

  if (error) {
    console.warn("[supabase] fetchProducts fallback to seed data", error);
    return seedProducts;
  }

  if (!data || data.length === 0) {
    return seedProducts;
  }

  return (data as Array<{ id: string; name: string }>).map((item) => ({
    id: item.id,
    name: item.name,
  }));
}

export async function fetchDepartments(productId?: string): Promise<Department[]> {
  let query = client.from("departments").select("*").order("name");
  if (productId) {
    query = query.eq("product_id", productId);
  }

  const { data, error } = await query;

  if (error) {
    console.warn("[supabase] fetchDepartments fallback to seed data", error);
    return productId ? seedDepartments.filter((dept) => dept.productId === productId) : seedDepartments;
  }

  if (!data || data.length === 0) {
    return productId ? seedDepartments.filter((dept) => dept.productId === productId) : seedDepartments;
  }

  return (data as Array<{ id: string; name: string; product_id: string }>).map((item) => ({
    id: item.id,
    name: item.name,
    productId: item.product_id,
  }));
}


import type { Department, Product } from "@/types/domain";
import { mockProducts, mockDepartments } from "@/data/mockData";

export async function fetchProducts(): Promise<Product[]> {
  return [...mockProducts];
}

export async function fetchDepartments(productId?: string): Promise<Department[]> {
  if (productId) {
    return mockDepartments.filter((dept) => dept.productId === productId);
  }
  return [...mockDepartments];
}

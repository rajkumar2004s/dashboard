import type { 
  Product, InsertProduct,
  Department, InsertDepartment,
  Employee, InsertEmployee,
  Manager, InsertManager,
  Director, InsertDirector,
  Ceo, InsertCeo,
  EmployeeContribution, InsertEmployeeContribution,
  UserProfile,
  ContributionWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";
import { products, departments, employees, managers, directors, ceoUser, sampleContributions } from "@shared/seedData";

export interface IStorage {
  // User authentication
  getUserByEmail(email: string): Promise<UserProfile | undefined>;
  
  // Products
  getProducts(): Promise<Product[]>;
  
  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartmentsByProduct(productId: string): Promise<Department[]>;
  
  // Employees
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  
  // Managers
  getManagers(): Promise<Manager[]>;
  getManager(id: string): Promise<Manager | undefined>;
  
  // Directors
  getDirectors(): Promise<Director[]>;
  getDirector(id: string): Promise<Director | undefined>;
  
  // CEO
  getCeo(): Promise<Ceo | undefined>;
  
  // Contributions
  createContribution(contribution: InsertEmployeeContribution): Promise<EmployeeContribution>;
  getContributions(): Promise<ContributionWithDetails[]>;
  getContributionsByEmployee(employeeId: string): Promise<ContributionWithDetails[]>;
  getContributionsByManager(managerId: string): Promise<ContributionWithDetails[]>;
  getContributionsByDirector(directorId: string): Promise<ContributionWithDetails[]>;
  updateContributionStatus(id: string, status: string, comment?: string): Promise<EmployeeContribution | undefined>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private departments: Map<string, Department>;
  private employees: Map<string, Employee>;
  private managers: Map<string, Manager>;
  private directors: Map<string, Director>;
  private ceo: Ceo | undefined;
  private contributions: Map<string, EmployeeContribution>;

  constructor() {
    this.products = new Map(products.map(p => [p.id, p]));
    this.departments = new Map(departments.map(d => [d.id, { ...d, productId: d.productId, managerId: d.managerId }]));
    this.employees = new Map(employees.map(e => [e.id, { ...e, departmentId: e.departmentId, role: e.role }]));
    this.managers = new Map(managers.map(m => [m.id, { ...m, departmentId: m.departmentId, role: m.role }]));
    this.directors = new Map(directors.map(d => [d.id, { ...d, productId: d.productId, role: d.role }]));
    this.ceo = ceoUser;
    this.contributions = new Map(sampleContributions.map(c => [c.id, {
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    } as EmployeeContribution]));
  }

  async getUserByEmail(email: string): Promise<UserProfile | undefined> {
    const employee = Array.from(this.employees.values()).find(e => e.email === email);
    if (employee) {
      return {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: 'employee',
        departmentId: employee.departmentId,
      };
    }

    const manager = Array.from(this.managers.values()).find(m => m.email === email);
    if (manager) {
      return {
        id: manager.id,
        name: manager.name,
        email: manager.email,
        role: 'manager',
        departmentId: manager.departmentId,
      };
    }

    const director = Array.from(this.directors.values()).find(d => d.email === email);
    if (director) {
      return {
        id: director.id,
        name: director.name,
        email: director.email,
        role: 'director',
        productId: director.productId,
      };
    }

    if (this.ceo && this.ceo.email === email) {
      return {
        id: this.ceo.id,
        name: this.ceo.name,
        email: this.ceo.email,
        role: 'ceo',
      };
    }

    return undefined;
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartmentsByProduct(productId: string): Promise<Department[]> {
    return Array.from(this.departments.values()).filter(d => d.productId === productId);
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getManagers(): Promise<Manager[]> {
    return Array.from(this.managers.values());
  }

  async getManager(id: string): Promise<Manager | undefined> {
    return this.managers.get(id);
  }

  async getDirectors(): Promise<Director[]> {
    return Array.from(this.directors.values());
  }

  async getDirector(id: string): Promise<Director | undefined> {
    return this.directors.get(id);
  }

  async getCeo(): Promise<Ceo | undefined> {
    return this.ceo;
  }

  async createContribution(insertContribution: InsertEmployeeContribution): Promise<EmployeeContribution> {
    const id = randomUUID();
    const contribution: EmployeeContribution = {
      ...insertContribution,
      id,
      status: 'submitted_to_manager',
      rejectionComment: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contributions.set(id, contribution);
    return contribution;
  }

  async getContributions(): Promise<ContributionWithDetails[]> {
    return this.enrichContributions(Array.from(this.contributions.values()));
  }

  async getContributionsByEmployee(employeeId: string): Promise<ContributionWithDetails[]> {
    const contributions = Array.from(this.contributions.values()).filter(
      c => c.employeeId === employeeId
    );
    return this.enrichContributions(contributions);
  }

  async getContributionsByManager(managerId: string): Promise<ContributionWithDetails[]> {
    const manager = this.managers.get(managerId);
    if (!manager) return [];

    const contributions = Array.from(this.contributions.values()).filter(
      c => c.departmentId === manager.departmentId
    );
    return this.enrichContributions(contributions);
  }

  async getContributionsByDirector(directorId: string): Promise<ContributionWithDetails[]> {
    const director = this.directors.get(directorId);
    if (!director) return [];

    const contributions = Array.from(this.contributions.values()).filter(
      c => c.productId === director.productId
    );
    return this.enrichContributions(contributions);
  }

  async updateContributionStatus(id: string, status: string, comment?: string): Promise<EmployeeContribution | undefined> {
    const contribution = this.contributions.get(id);
    if (!contribution) return undefined;

    const updated = {
      ...contribution,
      status,
      rejectionComment: comment || null,
      updatedAt: new Date(),
    };
    this.contributions.set(id, updated);
    return updated;
  }

  private enrichContributions(contributions: EmployeeContribution[]): ContributionWithDetails[] {
    return contributions.map(c => {
      const employee = this.employees.get(c.employeeId);
      const product = this.products.get(c.productId);
      const department = this.departments.get(c.departmentId);

      return {
        ...c,
        employeeName: employee?.name,
        productName: product?.name,
        departmentName: department?.name,
      };
    });
  }
}

export const storage = new MemStorage();

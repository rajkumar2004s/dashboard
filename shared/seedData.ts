// Static seed data for demo purposes - shared between client and server

export const products = [
  { id: "p1", name: "NIAT" },
  { id: "p2", name: "Intensive" },
  { id: "p3", name: "Academy" }
];

export const departments = [
  { id: "d1", name: "Placement Department", productId: "p1", managerId: "m1" },
  { id: "d2", name: "Academics Department", productId: "p3", managerId: "m2" },
  { id: "d3", name: "Instructor Department", productId: "p2", managerId: "m3" }
];

export const employees = [
  { id: "e1", name: "Awais", email: "awais@nxtwave.com", departmentId: "d1", role: "employee" },
  { id: "e2", name: "Nikhil", email: "nikhil@nxtwave.com", departmentId: "d2", role: "employee" },
  { id: "e3", name: "Priya", email: "priya@nxtwave.com", departmentId: "d3", role: "employee" }
];

export const managers = [
  { id: "m1", name: "Ravi", email: "ravi@nxtwave.com", departmentId: "d1", role: "manager" },
  { id: "m2", name: "Anita", email: "anita@nxtwave.com", departmentId: "d2", role: "manager" },
  { id: "m3", name: "Lokesh", email: "lokesh@nxtwave.com", departmentId: "d3", role: "manager" }
];

export const directors = [
  { id: "dir1", name: "Suresh", email: "suresh@nxtwave.com", productId: "p1", role: "director" },
  { id: "dir2", name: "Divya", email: "divya@nxtwave.com", productId: "p2", role: "director" },
  { id: "dir3", name: "Rajesh", email: "rajesh@nxtwave.com", productId: "p3", role: "director" }
];

export const ceoUser = { id: "ceo1", name: "CEO", email: "ceo@nxtwave.com", role: "ceo" };

export const sampleContributions = [
  {
    id: "c1",
    employeeId: "e1",
    productId: "p1",
    departmentId: "d1",
    contributionPercent: 60,
    status: "submitted_to_manager",
    rejectionComment: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z"
  },
  {
    id: "c2",
    employeeId: "e1",
    productId: "p3",
    departmentId: "d1",
    contributionPercent: 40,
    status: "approved_by_manager",
    rejectionComment: null,
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-02T00:00:00.000Z"
  },
  {
    id: "c3",
    employeeId: "e2",
    productId: "p3",
    departmentId: "d2",
    contributionPercent: 100,
    status: "approved_by_director",
    rejectionComment: null,
    createdAt: "2025-01-03T00:00:00.000Z",
    updatedAt: "2025-01-04T00:00:00.000Z"
  }
];

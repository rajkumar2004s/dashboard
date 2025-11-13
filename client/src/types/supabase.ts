export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: "ceo" | "director" | "manager" | "employee";
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: "ceo" | "director" | "manager" | "employee";
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: "ceo" | "director" | "manager" | "employee";
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "departments_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          role: "ceo" | "director" | "manager" | "employee";
          name: string;
          email: string;
          product_id: string | null;
          department_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          role: "ceo" | "director" | "manager" | "employee";
          name: string;
          email: string;
          product_id?: string | null;
          department_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          role?: "ceo" | "director" | "manager" | "employee";
          name?: string;
          email?: string;
          product_id?: string | null;
          department_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "users_auth_user_id_fkey";
            columns: ["auth_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      employee_contributions: {
        Row: {
          id: string;
          employee_id: string;
          product_id: string;
          department_id: string;
          contribution_percent: number;
          status:
            | "submitted_to_manager"
            | "approved_by_manager"
            | "rejected_by_manager"
            | "approved_by_director"
            | "rejected_by_director"
            | "approved_by_ceo"
            | "overridden_by_ceo";
          rejection_comment: string | null;
          manager_id: string | null;
          director_id: string | null;
          ceo_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          product_id: string;
          department_id: string;
          contribution_percent: number;
          status?:
            | "submitted_to_manager"
            | "approved_by_manager"
            | "rejected_by_manager"
            | "approved_by_director"
            | "rejected_by_director"
            | "approved_by_ceo"
            | "overridden_by_ceo";
          rejection_comment?: string | null;
          manager_id?: string | null;
          director_id?: string | null;
          ceo_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          product_id?: string;
          department_id?: string;
          contribution_percent?: number;
          status?:
            | "submitted_to_manager"
            | "approved_by_manager"
            | "rejected_by_manager"
            | "approved_by_director"
            | "rejected_by_director"
            | "approved_by_ceo"
            | "overridden_by_ceo";
          rejection_comment?: string | null;
          manager_id?: string | null;
          director_id?: string | null;
          ceo_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employee_contributions_department_id_fkey";
            columns: ["department_id"];
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_contributions_employee_id_fkey";
            columns: ["employee_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_contributions_product_id_fkey";
            columns: ["product_id"];
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_contributions_manager_id_fkey";
            columns: ["manager_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_contributions_director_id_fkey";
            columns: ["director_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_contributions_ceo_id_fkey";
            columns: ["ceo_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      contribution_details: {
        Row: {
          id: string;
          employee_id: string;
          employee_name: string;
          employee_email: string;
          product_id: string;
          product_name: string;
          department_id: string;
          department_name: string;
          contribution_percent: number;
          status: string;
          rejection_comment: string | null;
          manager_id: string | null;
          director_id: string | null;
          ceo_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_top_contributors: {
        Args: {
          limit_count?: number;
        };
        Returns: {
          user_id: string;
          contributor_name: string;
          contribution_total: number;
          contribution_count: number;
        }[];
      };
    };
  };
}


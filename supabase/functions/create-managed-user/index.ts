import type { Context } from "https://edge-runtime.ddp.supabase.com/v1/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

interface RequestPayload {
  name: string;
  email: string;
  role: "manager" | "employee";
  productId?: string | null;
  departmentId?: string | null;
}

export default async function handler(request: Request, context: Context) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing Supabase configuration", { status: 500 });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const payload: RequestPayload = await request.json();

  if (!payload.email || !payload.name || !payload.role) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    const temporaryPassword = crypto.randomUUID();
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email: payload.email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: payload.name,
      },
    });

    if (authError || !authUser.user) {
      console.error("auth.admin.createUser error", authError);
      return new Response(authError?.message ?? "Unable to create auth user", { status: 400 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("users")
      .insert({
        auth_user_id: authUser.user.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        product_id: payload.productId ?? null,
        department_id: payload.departmentId ?? null,
      })
      .select()
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile insertion error", profileError);
      return new Response(profileError?.message ?? "Unable to create user profile", { status: 400 });
    }

    return new Response(
      JSON.stringify({
        profile,
        temporaryPassword,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-managed-user error", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}


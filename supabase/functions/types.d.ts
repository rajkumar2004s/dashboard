declare module "https://esm.sh/@supabase/supabase-js@2.38.5" {
  export * from "@supabase/supabase-js";
}

declare module "https://edge-runtime.ddp.supabase.com/v1/mod.ts" {
  export interface Context {
    waitUntil(promise: Promise<unknown>): void;
    readonly requestId?: string;
  }
}

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};


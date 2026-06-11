import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const token = new URL(req.url).searchParams.get("token");
  if (!token) {
    return json({ error: "Missing token" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("paid_at")
    .eq("access_token", token)
    .eq("status", "succeeded")
    .maybeSingle();

  if (paymentError) {
    console.error("Failed to check access token:", paymentError);
    return json({ error: "Internal error" }, 500);
  }
  if (!payment) {
    return json({ error: "Access denied" }, 403);
  }

  const accessAgeMs = Date.now() - new Date(payment.paid_at).getTime();
  if (accessAgeMs >= 24 * 60 * 60 * 1000) {
    return json({ error: "Access expired" }, 403);
  }

  const { data: rows, error: rowsError } = await supabase
    .from("payments")
    .select("paid_at, amount")
    .eq("status", "succeeded");

  if (rowsError) {
    console.error("Failed to fetch stats:", rowsError);
    return json({ error: "Internal error" }, 500);
  }

  const byDay = new Map<string, { count: number; amount: number }>();
  let totalAmount = 0;

  for (const row of rows) {
    totalAmount += row.amount;
    const date = new Date(row.paid_at).toISOString().slice(0, 10);
    const day = byDay.get(date) ?? { count: 0, amount: 0 };
    day.count += 1;
    day.amount += row.amount;
    byDay.set(date, day);
  }

  const daily = [...byDay.entries()]
    .map(([date, { count, amount }]) => ({ date, count, amount: amount / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return json({
    total_count: rows.length,
    total_amount: totalAmount / 100,
    daily,
  });
});

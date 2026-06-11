import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { event?: string; object?: { id?: string } };
  try {
    body = await req.json();
  } catch (error) {
    console.error("Failed to parse webhook body:", error);
    return new Response("Bad request", { status: 400 });
  }

  if (body.event !== "payment.succeeded") {
    return new Response("OK", { status: 200 });
  }

  const yookassaPaymentId = body.object?.id;
  if (!yookassaPaymentId) {
    console.error("payment.succeeded webhook without object.id:", body);
    return new Response("OK", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("payments")
    .update({ status: "succeeded", paid_at: new Date().toISOString() })
    .eq("yookassa_payment_id", yookassaPaymentId)
    .select("id");

  if (error) {
    console.error("Failed to update payment:", yookassaPaymentId, error);
  } else if (!data || data.length === 0) {
    console.error("Payment not found for yookassa_payment_id:", yookassaPaymentId);
  }

  // Всегда 200 — иначе ЮKassa будет ретраить вебхук
  return new Response("OK", { status: 200 });
});

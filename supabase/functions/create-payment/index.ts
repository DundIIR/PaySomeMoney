import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const accessToken = crypto.randomUUID();

  const { data: payment, error: insertError } = await supabase
    .from("payments")
    .insert({
      access_token: accessToken,
      amount: 5500,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Failed to insert payment:", insertError);
    return json({ error: "Failed to create payment" }, 500);
  }

  const shopId = Deno.env.get("YOOKASSA_SHOP_ID")!;
  const secretKey = Deno.env.get("YOOKASSA_SECRET_KEY")!;

  let yookassaPayment: { id: string; confirmation: { confirmation_url: string } };
  try {
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${shopId}:${secretKey}`),
        "Idempotence-Key": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { value: "55.00", currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: Deno.env.get("RETURN_URL") ?? "http://localhost:5173/success",
        },
        capture: true,
        description: "Доступ к статистике на 24 часа",
        metadata: { access_token: accessToken },
      }),
    });

    if (!response.ok) {
      console.error("YooKassa error:", response.status, await response.text());
      throw new Error(`YooKassa returned ${response.status}`);
    }

    yookassaPayment = await response.json();
  } catch (error) {
    console.error("Failed to create YooKassa payment:", error);
    await supabase.from("payments").delete().eq("id", payment.id);
    return json({ error: "Failed to create payment" }, 500);
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ yookassa_payment_id: yookassaPayment.id })
    .eq("id", payment.id);

  if (updateError) {
    console.error("Failed to save yookassa_payment_id:", updateError);
    return json({ error: "Failed to create payment" }, 500);
  }

  return json({
    access_token: accessToken,
    confirmation_url: yookassaPayment.confirmation.confirmation_url,
  });
});

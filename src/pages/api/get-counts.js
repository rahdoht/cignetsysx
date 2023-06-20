import { createClient } from "@supabase/supabase-js";

let supabase_exists =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_ROLE;
if (supabase_exists) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE
  );
}

export default async function handler(req, res) {
  return res.status(200).json({ count: 0 });
  // get the number of rows in the gens table
  const { data, count, error } = await supabase
    .from("gens")
    .select("*", { count: "exact", head: true });
  const { data: oldCounts } = await supabase
    .from("renders")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ count: count + oldCounts.views });
}

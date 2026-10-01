import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }
  const { data: profile } = await supabase
  .from("profiles")
  .select("first_name, last_name")
  .eq("id", user.id)
  .single();
  if (!profile?.first_name || !profile?.last_name) {
  redirect("/profile");
}

  return (
    <main>
      <h1>Protected Page</h1>
      <p>You are logged in as: {user.email}</p>
    </main>
  );
}
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import ProfileForm from "../../components/ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <main>
      <h1>Profile</h1>
      <p>{user.email}</p>

      <ProfileForm
  userId={user.id}
  initialFirstName={profile?.first_name ?? ""}
  initialLastName={profile?.last_name ?? ""}
  initialAvatarUrl={profile?.avatar_url ?? ""}
/>
    </main>
  );
}
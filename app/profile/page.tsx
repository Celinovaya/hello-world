import Link from "next/link";
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
        <main className="profile-page">
            <div className="profile-shell">
                <header className="profile-topbar">
                    <div className="profile-brand">CINEMA COLLECTION</div>

                    <Link href="/" className="back-link">
                        ← Back to movies
                    </Link>
                </header>

                <section className="profile-heading">
                    <p className="profile-label">YOUR ACCOUNT</p>
                    <h1>Your Profile</h1>
                    <p>
                        Personalize your movie collection experience.
                    </p>
                </section>

                <section className="profile-card">
                    <div className="account-info">
                        <span className="account-label">SIGNED IN AS</span>
                        <span className="account-email">{user.email}</span>
                    </div>

                    <ProfileForm
                        userId={user.id}
                        initialFirstName={profile?.first_name ?? ""}
                        initialLastName={profile?.last_name ?? ""}
                        initialAvatarUrl={profile?.avatar_url ?? ""}
                    />
                </section>

                <footer className="profile-footer">
                    <span>Built with Next.js</span>
                    <span>•</span>
                    <span>Powered by Supabase</span>
                </footer>
            </div>
        </main>
    );
}
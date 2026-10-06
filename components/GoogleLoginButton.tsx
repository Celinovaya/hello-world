"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

export default function GoogleLoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    loadUser();
  }, []);

  const signInWithGoogle = async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };

  const signOut = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return <div className="auth-loading">Checking account...</div>;
  }

  if (user) {
    return (
        <div className="auth-user-actions">
          <a href="/profile" className="profile-button">
          <span className="profile-dot">
            {user.email?.charAt(0).toUpperCase()}
          </span>
            Profile
          </a>

          <button className="signout-button" onClick={signOut}>
            Sign out
          </button>
        </div>
    );
  }

  return (
      <button className="google-login-button" onClick={signInWithGoogle}>
        <span className="google-icon">G</span>

        <span>
        <small>WELCOME BACK</small>
        Continue with Google
      </span>

        <span className="login-arrow">→</span>
      </button>
  );
}
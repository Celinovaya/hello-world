"use client";

import { createClient } from "../utils/supabase/client";

export default function GoogleLoginButton() {
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

  return (
    <button onClick={signInWithGoogle}>
      Sign in with Google
    </button>
  );
}
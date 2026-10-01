import EmailAuth from "../components/EmailAuth";
import { createClient } from "@supabase/supabase-js";
import GoogleLoginButton from "../components/GoogleLoginButton";
export const dynamic = "force-dynamic";

export default async function Home() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: movies, error } = await supabase
        .from("movies")
        .select("*")
        .order("id");

    if (error) {
        return (
            <main>
                <h1>Movies</h1>
                <p>Error loading movies: {error.message}</p>
            </main>
        );
    }

    return (
        <main>
            <h1>My Movie List</h1>
             
             <GoogleLoginButton />
             <EmailAuth />
            <ul>
                {movies?.map((movie) => (
                    <li key={movie.id}>
                        <strong>{movie.title}</strong> — {movie.genre}
                    </li>
                ))}
            </ul>
        </main>
    );
}
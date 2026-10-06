import { createClient } from "@supabase/supabase-js";
import GoogleLoginButton from "../components/GoogleLoginButton";
import AITaglineLab from "../components/AITaglineLab";
export const dynamic = "force-dynamic";

type Movie = {
    id: number;
    title: string | null;
    genre: string | null;
};

function getMovieIcon(genre: string | null) {
    switch (genre?.toLowerCase()) {
        case "sci-fi":
            return "🚀";
        case "musical":
            return "🎵";
        case "animation":
            return "🌈";
        case "fantasy":
            return "✨";
        case "action":
            return "💥";
        case "adventure":
            return "🗺️";
        default:
            return "🎬";
    }
}

export default async function Home() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: movies, error } = await supabase
        .from("movies")
        .select("id, title, genre")
        .order("id");

    if (error) {
        return (
            <main className="page">
                <div className="error-box">
                    <h1>Something went wrong</h1>
                    <p>{error.message}</p>
                </div>
            </main>
        );
    }

    return (
        <main className="page">
             <section className="hero">
                    <div className="brand">CINEMA COLLECTION</div>

                    <h1>
                        Stories worth
                        <span> remembering.</span>
                    </h1>

                    <p>
                    A personal movie collection powered by Supabase and Next.js.
                </p>

                    <div className="login-area">
                        <GoogleLoginButton />
                    </div>
                </section>

            <section className="movie-section">
                <div className="section-header">
                    <div>
                        <p className="section-label">MY LIBRARY</p>
                        <h2>Movie Collection</h2>
                    </div>

                    <div className="movie-count">
                        {movies?.length ?? 0} movies
                    </div>
                </div>

                <div className="movie-grid">
                    {(movies as Movie[] | null)?.map((movie) => (
                        <article className="movie-card" key={movie.id}>
                            <div className="movie-icon">
                                {getMovieIcon(movie.genre)}
                            </div>

                            <div className="movie-number">
                                #{String(movie.id).padStart(2, "0")}
                            </div>

                            <div className="movie-info">
                <span className="genre">
                  {movie.genre || "Unknown"}
                </span>

                                <h3>{movie.title || "Untitled"}</h3>

                                <p>
                                    Explore this title from my growing movie collection.
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
            <AITaglineLab movies={movies ?? []} />

            <footer>
                <span>Built with Next.js</span>
                <span>•</span>
                <span>Powered by Supabase</span>
            </footer>
        </main>
    );
}
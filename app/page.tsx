import { createClient } from "@supabase/supabase-js";
import GoogleLoginButton from "../components/GoogleLoginButton";
import AITaglineLab from "../components/AITaglineLab";

export const dynamic = "force-dynamic";

type Movie = {
    id: number;
    title: string | null;
    genre: string | null;
};

type HomeProps = {
    searchParams: Promise<{
        q?: string;
        genre?: string;
    }>;
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
        case "romance":
            return "💗";
        case "drama":
            return "🎭";
        case "comedy":
            return "😄";
        case "thriller":
            return "🕯️";
        case "horror":
            return "🌙";
        case "mystery":
            return "🔎";
        case "crime":
            return "🕶️";
        default:
            return "🎬";
    }
}

function getMovieInitials(title: string | null) {
    if (!title) return "MV";

    const words = title
        .replace(/[^\w\s]/g, "")
        .split(" ")
        .filter(Boolean);

    if (words.length === 0) return "MV";

    if (words.length === 1) {
        return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

function getMovieBannerStyle(genre: string | null) {
    switch (genre?.toLowerCase()) {
        case "sci-fi":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(123,145,255,.7), transparent 30%), linear-gradient(135deg, #101631 0%, #24377c 50%, #51338a 100%)",
            };

        case "animation":
            return {
                background:
                    "radial-gradient(circle at 25% 20%, rgba(255,213,111,.7), transparent 28%), linear-gradient(135deg, #4d1f7b 0%, #8b3fd1 50%, #e27bbf 100%)",
            };

        case "romance":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,210,225,.65), transparent 30%), linear-gradient(135deg, #541c3d 0%, #a52f67 52%, #e26c9d 100%)",
            };

        case "drama":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,211,138,.45), transparent 30%), linear-gradient(135deg, #2c1c28 0%, #66414c 50%, #9b704d 100%)",
            };

        case "comedy":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,239,152,.7), transparent 30%), linear-gradient(135deg, #4c2d09 0%, #b66317 50%, #e6a52f 100%)",
            };

        case "thriller":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(203,122,255,.42), transparent 28%), linear-gradient(135deg, #191627 0%, #48234d 50%, #7c3359 100%)",
            };

        case "horror":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,73,73,.32), transparent 28%), linear-gradient(135deg, #100b10 0%, #351018 55%, #681b1b 100%)",
            };

        case "action":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,174,104,.5), transparent 28%), linear-gradient(135deg, #24150d 0%, #693314 50%, #b24d1d 100%)",
            };

        case "adventure":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(134,255,194,.45), transparent 28%), linear-gradient(135deg, #10251d 0%, #1c6545 50%, #3b8a69 100%)",
            };

        case "mystery":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(166,170,255,.42), transparent 28%), linear-gradient(135deg, #15162c 0%, #323563 50%, #5a4c81 100%)",
            };

        case "crime":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(210,210,210,.3), transparent 28%), linear-gradient(135deg, #151515 0%, #343434 50%, #575757 100%)",
            };

        case "fantasy":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(230,194,255,.62), transparent 28%), linear-gradient(135deg, #291643 0%, #653b8b 50%, #a061bc 100%)",
            };

        case "musical":
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(255,195,229,.58), transparent 28%), linear-gradient(135deg, #341a4a 0%, #814c9d 50%, #ca6e9a 100%)",
            };

        default:
            return {
                background:
                    "radial-gradient(circle at 20% 20%, rgba(155,155,255,.4), transparent 28%), linear-gradient(135deg, #171728 0%, #323253 50%, #544b72 100%)",
            };
    }
}

export default async function Home({ searchParams }: HomeProps) {
    const params = await searchParams;

    const query = (params.q ?? "").trim().toLowerCase();
    const selectedGenre = params.genre ?? "All";

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data, error } = await supabase
        .from("movies")
        .select("id, title, genre")
        .order("title", { ascending: true });

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

    const movies = (data ?? []) as Movie[];

    const genres = [
        "All",
        ...Array.from(
            new Set(
                movies
                    .map((movie) => movie.genre)
                    .filter((genre): genre is string => Boolean(genre))
            )
        ).sort(),
    ];

    const filteredMovies = movies.filter((movie) => {
        const matchesSearch =
            !query ||
            movie.title?.toLowerCase().includes(query) ||
            movie.genre?.toLowerCase().includes(query);

        const matchesGenre =
            selectedGenre === "All" || movie.genre === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    return (
        <main className="page">
            <style>{`
                .week5-hero-note {
                    max-width: 720px;
                    margin-top: 18px;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: rgba(255, 255, 255, 0.68);
                }

                .hero-jump-link {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 15px;
                    padding: 11px 16px;
                    border: 1px solid rgba(167, 139, 250, 0.25);
                    border-radius: 12px;
                    background: rgba(124, 58, 237, 0.07);
                    color: #c4b5fd;
                    text-decoration: none;
                    font-size: 0.84rem;
                    font-weight: 700;
                    transition: 0.2s ease;
                }

                .hero-jump-link:hover {
                    background: rgba(124, 58, 237, 0.14);
                    border-color: rgba(167, 139, 250, 0.45);
                }

                .discover-toolbar {
                    margin: 28px 0 34px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.035);
                    backdrop-filter: blur(14px);
                }

                .discover-form {
                    display: grid;
                    grid-template-columns: minmax(220px, 1fr) 190px auto auto;
                    gap: 12px;
                    align-items: center;
                }

                .discover-input,
                .discover-select {
                    width: 100%;
                    height: 48px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    background: rgba(7, 7, 14, 0.72);
                    color: white;
                    padding: 0 15px;
                    font: inherit;
                    outline: none;
                }

                .discover-input:focus,
                .discover-select:focus {
                    border-color: rgba(167, 139, 250, 0.85);
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
                }

                .discover-input::placeholder {
                    color: rgba(255, 255, 255, 0.38);
                }

                .discover-button {
                    height: 48px;
                    padding: 0 22px;
                    border: 0;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #7c3aed, #a855f7);
                    color: white;
                    font-weight: 700;
                    cursor: pointer;
                }

                .discover-button:hover {
                    filter: brightness(1.08);
                }

                .clear-button {
                    height: 48px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 18px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    color: rgba(255, 255, 255, 0.72);
                    text-decoration: none;
                }

                .clear-button:hover {
                    color: white;
                    border-color: rgba(255, 255, 255, 0.25);
                }

                .search-result-note {
                    margin-top: 14px;
                    color: rgba(255, 255, 255, 0.52);
                    font-size: 0.9rem;
                }

                .enhanced-movie-card {
                    overflow: hidden !important;
                    padding: 0 !important;
                    display: flex;
                    flex-direction: column;
                    min-height: 330px;
                    transition:
                        transform 0.2s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .enhanced-movie-card:hover {
                    transform: translateY(-5px);
                    border-color: rgba(166, 126, 255, 0.32);
                    box-shadow: 0 18px 46px rgba(0, 0, 0, 0.26);
                }

                .movie-poster-banner {
                    position: relative;
                    height: 155px;
                    min-height: 155px;
                    overflow: hidden;
                }

                .movie-poster-banner::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(
                            115deg,
                            transparent 0%,
                            rgba(255, 255, 255, 0.08) 48%,
                            transparent 70%
                        );
                }

                .poster-pattern {
                    position: absolute;
                    width: 180px;
                    height: 180px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 50%;
                    right: -55px;
                    top: -70px;
                }

                .poster-pattern::after {
                    content: "";
                    position: absolute;
                    width: 115px;
                    height: 115px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 50%;
                    left: 31px;
                    top: 31px;
                }

                .movie-poster-content {
                    position: absolute;
                    inset: 0;
                    padding: 20px;
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    background:
                        linear-gradient(
                            to top,
                            rgba(0, 0, 0, 0.48),
                            rgba(0, 0, 0, 0.02)
                        );
                }

                .poster-icon {
                    font-size: 32px;
                    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
                }

                .poster-initials {
                    font-size: 44px;
                    line-height: 1;
                    font-weight: 900;
                    letter-spacing: -3px;
                    color: rgba(255, 255, 255, 0.9);
                    text-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
                }

                .movie-card-content {
                    position: relative;
                    padding: 20px;
                    flex: 1;
                }

                .enhanced-movie-card .movie-number {
                    position: absolute;
                    right: 18px;
                    top: 18px;
                    opacity: 0.55;
                }

                .enhanced-movie-card .movie-info {
                    padding-top: 3px;
                }

                .enhanced-movie-card .movie-info h3 {
                    margin-top: 9px;
                    margin-bottom: 9px;
                }

                .how-section {
                    margin: 70px 0 20px;
                }

                .how-header {
                    margin-bottom: 28px;
                }

                .how-header p {
                    color: rgba(255, 255, 255, 0.48);
                    letter-spacing: 0.14em;
                    font-size: 0.78rem;
                    font-weight: 700;
                    margin-bottom: 7px;
                }

                .how-header h2 {
                    margin: 0;
                    font-size: clamp(1.7rem, 3vw, 2.4rem);
                }

                .how-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .how-card {
                    padding: 25px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background:
                        linear-gradient(
                            145deg,
                            rgba(255,255,255,0.055),
                            rgba(255,255,255,0.018)
                        );
                }

                .how-number {
                    display: inline-block;
                    margin-bottom: 25px;
                    font-size: 0.82rem;
                    font-weight: 800;
                    color: #b59cff;
                }

                .how-icon {
                    display: block;
                    font-size: 28px;
                    margin-bottom: 14px;
                }

                .how-card h3 {
                    margin: 0 0 8px;
                    font-size: 1.1rem;
                }

                .how-card p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.56);
                    line-height: 1.6;
                    font-size: 0.93rem;
                }

                .movie-section {
                    margin-top: 85px;
                }

                .empty-movies {
                    grid-column: 1 / -1;
                    padding: 50px 20px;
                    text-align: center;
                    border: 1px dashed rgba(255,255,255,0.14);
                    border-radius: 18px;
                    color: rgba(255,255,255,0.55);
                }

                @media (max-width: 850px) {
                    .discover-form {
                        grid-template-columns: 1fr 1fr;
                    }

                    .discover-input {
                        grid-column: 1 / -1;
                    }

                    .how-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 520px) {
                    .discover-form {
                        grid-template-columns: 1fr;
                    }

                    .discover-input {
                        grid-column: auto;
                    }

                    .discover-button,
                    .clear-button {
                        width: 100%;
                    }
                }
            `}</style>

            <section className="hero">
                <div className="brand">AI CINEMA LAB</div>

                <h1>
                    Discover movies.
                    <span> Reimagine their stories.</span>
                </h1>

                <p className="week5-hero-note">
                    Explore a growing movie collection, create original
                    AI-powered taglines, and vote on the versions that deserve
                    the spotlight.
                </p>

                <div className="login-area">
                    <GoogleLoginButton />
                </div>

                <a className="hero-jump-link" href="#ai-studio">
                    ✦ Start Creating
                </a>
            </section>

            <section className="how-section">
                <div className="how-header">
                    <p>HOW IT WORKS</p>
                    <h2>From movie to AI creation in three steps.</h2>
                </div>

                <div className="how-grid">
                    <div className="how-card">
                        <span className="how-number">01</span>
                        <span className="how-icon">🎬</span>

                        <h3>Choose a Movie</h3>

                        <p>
                            Pick a movie from the collection that inspires you.
                        </p>
                    </div>

                    <div className="how-card">
                        <span className="how-number">02</span>
                        <span className="how-icon">✨</span>

                        <h3>Create with AI</h3>

                        <p>
                            Give AI a creative direction and generate an
                            original movie tagline.
                        </p>
                    </div>

                    <div className="how-card">
                        <span className="how-number">03</span>
                        <span className="how-icon">👍</span>

                        <h3>Vote & Compare</h3>

                        <p>
                            Rate AI-generated ideas and decide which version
                            deserves the spotlight.
                        </p>
                    </div>
                </div>
            </section>

            <div id="ai-studio">
                <AITaglineLab movies={movies} />
            </div>

            <section className="movie-section">
                <div className="section-header">
                    <div>
                        <p className="section-label">DISCOVER</p>
                        <h2>Movie Collection</h2>
                    </div>

                    <div className="movie-count">
                        {movies.length} movies
                    </div>
                </div>

                <div className="discover-toolbar">
                    <form className="discover-form" method="get">
                        <input
                            className="discover-input"
                            type="text"
                            name="q"
                            defaultValue={params.q ?? ""}
                            placeholder="Search movies or genres..."
                            aria-label="Search movies"
                        />

                        <select
                            className="discover-select"
                            name="genre"
                            defaultValue={selectedGenre}
                            aria-label="Filter by genre"
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>

                        <button
                            className="discover-button"
                            type="submit"
                        >
                            Search
                        </button>

                        <a className="clear-button" href="/">
                            Clear
                        </a>
                    </form>

                    <div className="search-result-note">
                        Showing {filteredMovies.length} of {movies.length} movies
                        {selectedGenre !== "All"
                            ? ` · ${selectedGenre}`
                            : ""}
                        {query ? ` · Search: "${params.q}"` : ""}
                    </div>
                </div>

                <div className="movie-grid">
                    {filteredMovies.length > 0 ? (
                        filteredMovies.map((movie) => (
                            <article
                                className="movie-card enhanced-movie-card"
                                key={movie.id}
                            >
                                <div
                                    className="movie-poster-banner"
                                    style={getMovieBannerStyle(movie.genre)}
                                >
                                    <div className="poster-pattern" />

                                    <div className="movie-poster-content">
                                        <div className="poster-icon">
                                            {getMovieIcon(movie.genre)}
                                        </div>

                                        <div className="poster-initials">
                                            {getMovieInitials(movie.title)}
                                        </div>
                                    </div>
                                </div>

                                <div className="movie-card-content">
                                    <div className="movie-number">
                                        #
                                        {String(movie.id).padStart(
                                            2,
                                            "0"
                                        )}
                                    </div>

                                    <div className="movie-info">
                                        <span className="genre">
                                            {movie.genre || "Unknown"}
                                        </span>

                                        <h3>
                                            {movie.title || "Untitled"}
                                        </h3>

                                        <p>
                                            Reimagine this movie with a fresh
                                            AI-generated tagline.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="empty-movies">
                            <div
                                style={{
                                    fontSize: "34px",
                                    marginBottom: "12px",
                                }}
                            >
                                🎬
                            </div>

                            <strong>No movies found.</strong>

                            <p
                                style={{
                                    marginTop: "8px",
                                    marginBottom: 0,
                                }}
                            >
                                Try another movie title or genre.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <footer>
                <span>Built with Next.js</span>
                <span>•</span>
                <span>Powered by Supabase</span>
                <span>•</span>
                <span>AI powered</span>
            </footer>
        </main>
    );
}
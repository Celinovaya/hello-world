"use client";

import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

type Generation = {
    id: string;
    movie_id: number;
    generated_text: string;
    prompt: string;
    created_at: string;
};

type Vote = {
    generation_id: string;
    value: number;
};

type Movie = {
    id: number;
    title: string | null;
    genre: string | null;
};

type Favorite = {
    id: string;
    movieTitle: string;
    genre: string;
    tagline: string;
    upvotes: number;
    downvotes: number;
    score: number;
};

export default function CommunityFavorites() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        async function loadFavorites() {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
            );

            try {
                const [
                    generationsResult,
                    votesResult,
                    moviesResult,
                ] = await Promise.all([
                    supabase
                        .from("generations")
                        .select(
                            "id, movie_id, generated_text, prompt, created_at"
                        ),

                    supabase
                        .from("votes")
                        .select(
                            "generation_id, value"
                        ),

                    supabase
                        .from("movies")
                        .select(
                            "id, title, genre"
                        ),
                ]);

                if (
                    generationsResult.error ||
                    votesResult.error ||
                    moviesResult.error
                ) {
                    setMessage(
                        "Sign in and vote to help build the community rankings."
                    );
                    return;
                }

                const generations =
                    (generationsResult.data ?? []) as Generation[];

                const votes =
                    (votesResult.data ?? []) as Vote[];

                const movies =
                    (moviesResult.data ?? []) as Movie[];

                const movieMap = new Map(
                    movies.map((movie) => [
                        movie.id,
                        movie,
                    ])
                );

                const rankedItems: Favorite[] =
                    generations
                        .map((generation) => {
                            const generationVotes =
                                votes.filter(
                                    (vote) =>
                                        vote.generation_id ===
                                        generation.id
                                );

                            const upvotes =
                                generationVotes.filter(
                                    (vote) =>
                                        vote.value === 1
                                ).length;

                            const downvotes =
                                generationVotes.filter(
                                    (vote) =>
                                        vote.value === -1
                                ).length;

                            const movie =
                                movieMap.get(
                                    generation.movie_id
                                );

                            return {
                                id: generation.id,
                                movieTitle:
                                    movie?.title ??
                                    "Unknown Movie",
                                genre:
                                    movie?.genre ??
                                    "Movie",
                                tagline:
                                generation.generated_text,
                                upvotes,
                                downvotes,
                                score:
                                    upvotes -
                                    downvotes,
                            };
                        })
                        .filter(
                            (item) =>
                                item.upvotes +
                                item.downvotes >
                                0
                        )
                        .sort((a, b) => {
                            if (
                                b.score !== a.score
                            ) {
                                return (
                                    b.score -
                                    a.score
                                );
                            }

                            return (
                                b.upvotes -
                                a.upvotes
                            );
                        });

                // Remove duplicate taglines after ranking.
                // Because the list is already sorted, the highest-ranked
                // version of a duplicate tagline is kept.
                const seenTaglines =
                    new Set<string>();

                const uniqueRanking =
                    rankedItems.filter(
                        (item) => {
                            const normalizedTagline =
                                item.tagline
                                    .trim()
                                    .toLowerCase()
                                    .replace(
                                        /\s+/g,
                                        " "
                                    )
                                    .replace(
                                        /^[“"'‘’]+|[”"'‘’]+$/g,
                                        ""
                                    );

                            if (
                                seenTaglines.has(
                                    normalizedTagline
                                )
                            ) {
                                return false;
                            }

                            seenTaglines.add(
                                normalizedTagline
                            );

                            return true;
                        }
                    );

                const ranking =
                    uniqueRanking.slice(0, 5);

                setFavorites(ranking);

                if (ranking.length === 0) {
                    setMessage(
                        "No community rankings yet. Generate a tagline and cast the first vote."
                    );
                }
            } catch {
                setMessage(
                    "Community rankings are temporarily unavailable."
                );
            } finally {
                setLoading(false);
            }
        }

        loadFavorites();
    }, []);

    return (
        <section className="community-section">
            <style>{`
                .community-section {
                    margin: 85px 0;
                }

                .community-header {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 28px;
                }

                .community-label {
                    margin: 0 0 8px;
                    color: #9f87ff;
                    font-size: 0.76rem;
                    font-weight: 800;
                    letter-spacing: 0.16em;
                }

                .community-header h2 {
                    margin: 0;
                    font-size: clamp(
                        1.9rem,
                        4vw,
                        2.8rem
                    );
                    letter-spacing: -0.04em;
                }

                .community-description {
                    max-width: 520px;
                    margin: 11px 0 0;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.52
                    );
                    line-height: 1.7;
                }

                .community-badge {
                    flex-shrink: 0;
                    padding: 9px 13px;
                    border: 1px solid rgba(
                        167,
                        139,
                        250,
                        0.22
                    );
                    border-radius: 999px;
                    background: rgba(
                        124,
                        58,
                        237,
                        0.08
                    );
                    color: #c4b5fd;
                    font-size: 0.74rem;
                    font-weight: 800;
                }

                .community-grid {
                    display: grid;
                    gap: 14px;
                }

                .favorite-card {
                    display: grid;
                    grid-template-columns:
                        58px
                        minmax(0, 1fr)
                        auto;
                    align-items: center;
                    gap: 20px;
                    padding: 22px 24px;
                    border: 1px solid rgba(
                        255,
                        255,
                        255,
                        0.08
                    );
                    border-radius: 18px;
                    background: linear-gradient(
                        145deg,
                        rgba(
                            255,
                            255,
                            255,
                            0.05
                        ),
                        rgba(
                            255,
                            255,
                            255,
                            0.018
                        )
                    );
                    transition:
                        transform 0.18s ease,
                        border-color 0.18s ease;
                }

                .favorite-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(
                        167,
                        139,
                        250,
                        0.28
                    );
                }

                .favorite-rank {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: rgba(
                        124,
                        58,
                        237,
                        0.1
                    );
                    color: #c4b5fd;
                    font-weight: 900;
                }

                .favorite-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 7px;
                }

                .favorite-movie {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 800;
                }

                .favorite-genre {
                    padding: 4px 8px;
                    border-radius: 999px;
                    background: rgba(
                        255,
                        255,
                        255,
                        0.05
                    );
                    color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );
                    font-size: 0.69rem;
                }

                .favorite-tagline {
                    margin: 0;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.83
                    );
                    font-size: 1rem;
                    line-height: 1.5;
                }

                .favorite-score {
                    min-width: 105px;
                    text-align: right;
                }

                .favorite-score strong {
                    display: block;
                    color: #86efac;
                    font-size: 1rem;
                }

                .favorite-score span {
                    display: block;
                    margin-top: 5px;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.38
                    );
                    font-size: 0.72rem;
                }

                .community-empty {
                    padding: 38px 25px;
                    border: 1px dashed rgba(
                        255,
                        255,
                        255,
                        0.12
                    );
                    border-radius: 18px;
                    text-align: center;
                    color: rgba(
                        255,
                        255,
                        255,
                        0.48
                    );
                    line-height: 1.6;
                }

                .community-loading {
                    color: rgba(
                        255,
                        255,
                        255,
                        0.45
                    );
                }

                @media (max-width: 700px) {
                    .community-header {
                        align-items: flex-start;
                        flex-direction: column;
                    }

                    .favorite-card {
                        grid-template-columns:
                            45px
                            minmax(0, 1fr);
                    }

                    .favorite-score {
                        grid-column: 2;
                        text-align: left;
                    }
                }
            `}</style>

            <div className="community-header">
                <div>
                    <p className="community-label">
                        COMMUNITY
                    </p>

                    <h2>
                        Community Favorites
                    </h2>

                    <p className="community-description">
                        See which AI-generated
                        movie taglines are winning
                        over the community. Rankings
                        update as people vote.
                    </p>
                </div>

                <div className="community-badge">
                    🏆 TOP RATED
                </div>
            </div>

            {loading ? (
                <p className="community-loading">
                    Loading community favorites...
                </p>
            ) : favorites.length > 0 ? (
                <div className="community-grid">
                    {favorites.map(
                        (favorite, index) => (
                            <article
                                key={favorite.id}
                                className="favorite-card"
                            >
                                <div className="favorite-rank">
                                    #{index + 1}
                                </div>

                                <div>
                                    <div className="favorite-meta">
                                        <span className="favorite-movie">
                                            {favorite.movieTitle}
                                        </span>

                                        <span className="favorite-genre">
                                            {favorite.genre}
                                        </span>
                                    </div>

                                    <p className="favorite-tagline">
                                        “{favorite.tagline}”
                                    </p>
                                </div>

                                <div className="favorite-score">
                                    <strong>
                                        👍 {favorite.upvotes}
                                    </strong>

                                    <span>
                                        👎 {favorite.downvotes}
                                        {" · "}
                                        score {favorite.score}
                                    </span>
                                </div>
                            </article>
                        )
                    )}
                </div>
            ) : (
                <div className="community-empty">
                    🏆 {message}
                </div>
            )}
        </section>
    );
}
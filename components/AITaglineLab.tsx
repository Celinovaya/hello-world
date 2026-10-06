"use client";

import { useState } from "react";

type Movie = {
    id: number;
    title: string | null;
    genre: string | null;
};

type Generation = {
    id: string;
    movie_id: number;
    prompt: string;
    generated_text: string;
    created_at: string;
};

export default function AITaglineLab({
                                         movies,
                                     }: {
    movies: Movie[];
}) {
    const [movieId, setMovieId] = useState(
        movies.length > 0 ? movies[0].id.toString() : ""
    );

    const [prompt, setPrompt] = useState(
        "Make it short, emotional, and cinematic."
    );

    const [generation, setGeneration] =
        useState<Generation | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [voting, setVoting] = useState(false);
    const [voteMessage, setVoteMessage] = useState("");

    async function handleGenerate() {
        const movie = movies.find(
            (item) => item.id.toString() === movieId
        );

        if (!movie || !movie.title) {
            setError("Please choose a movie.");
            return;
        }

        if (!prompt.trim()) {
            setError("Please enter a creative direction.");
            return;
        }

        setLoading(true);
        setError("");
        setGeneration(null);
        setVoteMessage("");

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    movieId: movie.id,
                    movieTitle: movie.title,
                    prompt: prompt.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to generate tagline."
                );
            }

            setGeneration(data.generation);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    async function handleVote(value: 1 | -1) {
        if (!generation) {
            return;
        }

        setVoting(true);
        setVoteMessage("");

        try {
            const response = await fetch("/api/vote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    generationId: generation.id,
                    value,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to submit vote."
                );
            }

            setVoteMessage(
                value === 1
                    ? "Thanks for the upvote!"
                    : "Thanks for the feedback!"
            );
        } catch (err) {
            setVoteMessage(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setVoting(false);
        }
    }

    return (
        <section className="ai-lab">
            <div className="ai-lab-heading">
                <div>
                    <p className="section-label">AI CREATIVE STUDIO</p>

                    <h2>AI Tagline Lab</h2>

                    <p className="ai-lab-description">
                        Choose a movie and let AI create a fresh tagline.
                    </p>
                </div>

                <div className="ai-badge">✦ GEMINI</div>
            </div>

            <div className="ai-lab-panel">
                <div className="ai-field">
                    <label htmlFor="movie">Movie</label>

                    <select
                        id="movie"
                        value={movieId}
                        onChange={(event) =>
                            setMovieId(event.target.value)
                        }
                    >
                        {movies.map((movie) => (
                            <option key={movie.id} value={movie.id}>
                                {movie.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="ai-field">
                    <label htmlFor="prompt">
                        Creative direction
                    </label>

                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(event) =>
                            setPrompt(event.target.value)
                        }
                        placeholder="Example: Make it mysterious and cinematic."
                        rows={4}
                    />
                </div>

                <button
                    className="generate-button"
                    onClick={handleGenerate}
                    disabled={loading}
                >
                    {loading
                        ? "Generating..."
                        : "✦ Generate Tagline"}
                </button>

                {error && (
                    <p className="ai-error">{error}</p>
                )}

                {generation && (
                    <div className="generation-result">
                        <p className="generation-label">
                            AI GENERATED
                        </p>

                        <blockquote>
                            “{generation.generated_text}”
                        </blockquote>

                        <p className="generation-prompt">
                            Direction: {generation.prompt}
                        </p>

                        <div className="vote-area">
                            <p>
                                How would you rate this tagline?
                            </p>

                            <div className="vote-buttons">
                                <button
                                    onClick={() => handleVote(1)}
                                    disabled={voting}
                                >
                                    👍 Upvote
                                </button>

                                <button
                                    onClick={() => handleVote(-1)}
                                    disabled={voting}
                                >
                                    👎 Downvote
                                </button>
                            </div>

                            {voteMessage && (
                                <p className="vote-message">
                                    {voteMessage}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
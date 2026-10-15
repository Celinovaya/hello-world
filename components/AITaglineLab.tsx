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

const promptIdeas = [
    {
        label: "Mysterious",
        icon: "🌙",
        prompt: "Make it mysterious, suspenseful, and cinematic.",
    },
    {
        label: "Romantic",
        icon: "💗",
        prompt: "Make it romantic, emotional, and memorable.",
    },
    {
        label: "Epic",
        icon: "⚡",
        prompt: "Make it epic, powerful, and cinematic.",
    },
    {
        label: "Funny",
        icon: "😄",
        prompt: "Make it funny, playful, and clever.",
    },
];

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
    const [selectedVote, setSelectedVote] =
        useState<1 | -1 | null>(null);

    const selectedMovie = movies.find(
        (movie) => movie.id.toString() === movieId
    );

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
        setSelectedVote(null);

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

            setSelectedVote(value);

            setVoteMessage(
                value === 1
                    ? "Upvoted! You can change your vote anytime."
                    : "Feedback saved! You can change your vote anytime."
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

    function applyPromptIdea(newPrompt: string) {
        setPrompt(newPrompt);
        setError("");
    }

    return (
        <section className="ai-studio-section">
            <style>{`
                .ai-studio-section {
                    position: relative;
                    margin: 80px 0;
                }

                .studio-shell {
                    position: relative;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 28px;
                    background:
                        radial-gradient(
                            circle at 85% 0%,
                            rgba(139,92,246,0.18),
                            transparent 30%
                        ),
                        linear-gradient(
                            145deg,
                            rgba(255,255,255,0.055),
                            rgba(255,255,255,0.018)
                        );
                    box-shadow:
                        0 28px 70px rgba(0,0,0,0.22);
                }

                .studio-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 30px;
                    padding: 38px 38px 30px;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                .studio-eyebrow {
                    margin: 0 0 10px;
                    color: #a78bfa;
                    font-size: 0.76rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                }

                .studio-top h2 {
                    margin: 0;
                    font-size: clamp(2rem, 4vw, 3rem);
                    letter-spacing: -0.04em;
                }

                .studio-description {
                    max-width: 570px;
                    margin: 13px 0 0;
                    color: rgba(255,255,255,0.58);
                    line-height: 1.7;
                }

                .studio-badge {
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    border: 1px solid rgba(167,139,250,0.25);
                    border-radius: 999px;
                    background: rgba(124,58,237,0.09);
                    color: #c4b5fd;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                }

                .studio-content {
                    display: grid;
                    grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
                    gap: 28px;
                    padding: 34px 38px 38px;
                }

                .studio-form {
                    min-width: 0;
                }

                .studio-field {
                    margin-bottom: 24px;
                }

                .studio-field label {
                    display: block;
                    margin-bottom: 9px;
                    color: rgba(255,255,255,0.84);
                    font-size: 0.9rem;
                    font-weight: 700;
                }

                .studio-select,
                .studio-textarea {
                    width: 100%;
                    border: 1px solid rgba(255,255,255,0.11);
                    border-radius: 14px;
                    background: rgba(7,7,14,0.68);
                    color: white;
                    font: inherit;
                    outline: none;
                    transition:
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
                }

                .studio-select {
                    height: 52px;
                    padding: 0 15px;
                }

                .studio-textarea {
                    min-height: 126px;
                    padding: 15px;
                    resize: vertical;
                    line-height: 1.6;
                }

                .studio-select:focus,
                .studio-textarea:focus {
                    border-color: rgba(167,139,250,0.85);
                    box-shadow:
                        0 0 0 3px rgba(139,92,246,0.12);
                }

                .selected-movie-note {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 9px;
                    color: rgba(255,255,255,0.43);
                    font-size: 0.82rem;
                }

                .selected-movie-note strong {
                    color: rgba(255,255,255,0.7);
                }

                .idea-label {
                    margin: 0 0 10px;
                    color: rgba(255,255,255,0.46);
                    font-size: 0.8rem;
                    font-weight: 700;
                }

                .prompt-ideas {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 9px;
                    margin-bottom: 24px;
                }

                .prompt-chip {
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 999px;
                    padding: 9px 13px;
                    background: rgba(255,255,255,0.035);
                    color: rgba(255,255,255,0.72);
                    font: inherit;
                    font-size: 0.82rem;
                    cursor: pointer;
                    transition:
                        transform 0.18s ease,
                        border-color 0.18s ease,
                        background 0.18s ease,
                        color 0.18s ease;
                }

                .prompt-chip:hover {
                    transform: translateY(-1px);
                    border-color: rgba(167,139,250,0.42);
                    background: rgba(139,92,246,0.11);
                    color: white;
                }

                .studio-generate-button {
                    width: 100%;
                    min-height: 54px;
                    border: 0;
                    border-radius: 14px;
                    background:
                        linear-gradient(135deg, #7c3aed, #a855f7);
                    color: white;
                    font-size: 0.95rem;
                    font-weight: 800;
                    cursor: pointer;
                    box-shadow:
                        0 12px 28px rgba(124,58,237,0.22);
                    transition:
                        transform 0.18s ease,
                        filter 0.18s ease;
                }

                .studio-generate-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    filter: brightness(1.08);
                }

                .studio-generate-button:disabled {
                    cursor: wait;
                    opacity: 0.65;
                }

                .studio-error {
                    margin: 13px 0 0;
                    padding: 11px 13px;
                    border: 1px solid rgba(248,113,113,0.22);
                    border-radius: 11px;
                    background: rgba(248,113,113,0.07);
                    color: #fca5a5;
                    font-size: 0.85rem;
                    line-height: 1.5;
                }

                .studio-preview {
                    min-height: 100%;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px;
                    background:
                        linear-gradient(
                            145deg,
                            rgba(7,7,14,0.72),
                            rgba(30,22,52,0.66)
                        );
                    padding: 25px;
                }

                .preview-empty {
                    min-height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 35px 15px;
                }

                .preview-empty-icon {
                    width: 58px;
                    height: 58px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 17px;
                    border: 1px solid rgba(167,139,250,0.2);
                    border-radius: 18px;
                    background: rgba(124,58,237,0.08);
                    font-size: 25px;
                }

                .preview-empty h3 {
                    margin: 0 0 8px;
                    font-size: 1rem;
                }

                .preview-empty p {
                    max-width: 280px;
                    margin: 0;
                    color: rgba(255,255,255,0.43);
                    line-height: 1.6;
                    font-size: 0.84rem;
                }

                .creation-label {
                    margin: 0 0 20px;
                    color: #a78bfa;
                    font-size: 0.72rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                }

                .creation-movie {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    margin-bottom: 18px;
                    padding-bottom: 17px;
                    border-bottom: 1px solid rgba(255,255,255,0.07);
                }

                .creation-movie-title {
                    margin: 0;
                    font-size: 0.96rem;
                    font-weight: 700;
                }

                .creation-genre {
                    display: inline-block;
                    margin-top: 5px;
                    color: rgba(255,255,255,0.4);
                    font-size: 0.78rem;
                }

                .creation-ai-badge {
                    flex-shrink: 0;
                    padding: 6px 9px;
                    border-radius: 999px;
                    background: rgba(139,92,246,0.1);
                    color: #c4b5fd;
                    font-size: 0.68rem;
                    font-weight: 800;
                }

                .creation-quote {
                    margin: 0;
                    padding: 5px 0 22px;
                    color: rgba(255,255,255,0.94);
                    font-size: clamp(1.25rem, 2.3vw, 1.7rem);
                    font-weight: 650;
                    line-height: 1.45;
                    letter-spacing: -0.025em;
                }

                .creation-direction {
                    margin: 0 0 23px;
                    padding: 12px 13px;
                    border-radius: 11px;
                    background: rgba(255,255,255,0.035);
                    color: rgba(255,255,255,0.45);
                    font-size: 0.79rem;
                    line-height: 1.5;
                }

                .creation-direction strong {
                    color: rgba(255,255,255,0.67);
                }

                .vote-divider {
                    height: 1px;
                    margin-bottom: 20px;
                    background: rgba(255,255,255,0.07);
                }

                .vote-question {
                    margin: 0 0 12px;
                    color: rgba(255,255,255,0.7);
                    font-size: 0.84rem;
                    font-weight: 700;
                }

                .studio-vote-buttons {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                }

                .studio-vote-button {
                    min-height: 44px;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 11px;
                    background: rgba(255,255,255,0.035);
                    color: rgba(255,255,255,0.72);
                    font: inherit;
                    font-size: 0.83rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition:
                        transform 0.18s ease,
                        border-color 0.18s ease,
                        background 0.18s ease;
                }

                .studio-vote-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    border-color: rgba(167,139,250,0.35);
                }

                .studio-vote-button.active-up {
                    border-color: rgba(74,222,128,0.4);
                    background: rgba(74,222,128,0.1);
                    color: #86efac;
                }

                .studio-vote-button.active-down {
                    border-color: rgba(248,113,113,0.4);
                    background: rgba(248,113,113,0.09);
                    color: #fca5a5;
                }

                .studio-vote-button:disabled {
                    opacity: 0.65;
                    cursor: wait;
                }

                .studio-vote-message {
                    margin: 12px 0 0;
                    color: rgba(255,255,255,0.48);
                    font-size: 0.78rem;
                    line-height: 1.5;
                }

                @media (max-width: 850px) {
                    .studio-top {
                        flex-direction: column;
                        padding: 28px 24px 24px;
                    }

                    .studio-content {
                        grid-template-columns: 1fr;
                        padding: 25px 24px 28px;
                    }

                    .studio-preview {
                        min-height: 320px;
                    }
                }

                @media (max-width: 520px) {
                    .ai-studio-section {
                        margin: 55px 0;
                    }

                    .studio-shell {
                        border-radius: 20px;
                    }

                    .studio-top {
                        padding: 24px 18px 20px;
                    }

                    .studio-content {
                        padding: 20px 18px 22px;
                    }

                    .studio-vote-buttons {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="studio-shell">
                <div className="studio-top">
                    <div>
                        <p className="studio-eyebrow">
                            AI CREATIVE STUDIO
                        </p>

                        <h2>Reimagine a Movie</h2>

                        <p className="studio-description">
                            Choose a movie, give AI a creative direction,
                            and turn a familiar story into a completely new
                            tagline.
                        </p>
                    </div>

                    <div className="studio-badge">
                        ✦ POWERED BY GEMINI
                    </div>
                </div>

                <div className="studio-content">
                    <div className="studio-form">
                        <div className="studio-field">
                            <label htmlFor="movie">
                                1. Choose a movie
                            </label>

                            <select
                                id="movie"
                                className="studio-select"
                                value={movieId}
                                onChange={(event) => {
                                    setMovieId(event.target.value);
                                    setGeneration(null);
                                    setVoteMessage("");
                                    setSelectedVote(null);
                                }}
                            >
                                {movies.map((movie) => (
                                    <option
                                        key={movie.id}
                                        value={movie.id}
                                    >
                                        {movie.title}
                                        {movie.genre
                                            ? ` — ${movie.genre}`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {selectedMovie && (
                                <div className="selected-movie-note">
                                    🎬
                                    <span>
                                        Creating for{" "}
                                        <strong>
                                            {selectedMovie.title}
                                        </strong>
                                        {selectedMovie.genre
                                            ? ` · ${selectedMovie.genre}`
                                            : ""}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="studio-field">
                            <label htmlFor="prompt">
                                2. Give AI a creative direction
                            </label>

                            <textarea
                                id="prompt"
                                className="studio-textarea"
                                value={prompt}
                                onChange={(event) =>
                                    setPrompt(event.target.value)
                                }
                                placeholder="Example: Make it mysterious and cinematic."
                                rows={4}
                            />
                        </div>

                        <p className="idea-label">
                            Need inspiration? Try a style:
                        </p>

                        <div className="prompt-ideas">
                            {promptIdeas.map((idea) => (
                                <button
                                    key={idea.label}
                                    type="button"
                                    className="prompt-chip"
                                    onClick={() =>
                                        applyPromptIdea(idea.prompt)
                                    }
                                >
                                    {idea.icon} {idea.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="studio-generate-button"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading
                                ? "✦ Creating your tagline..."
                                : "✦ Generate AI Tagline"}
                        </button>

                        {error && (
                            <p className="studio-error">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="studio-preview">
                        {!generation ? (
                            <div className="preview-empty">
                                <div className="preview-empty-icon">
                                    ✦
                                </div>

                                <h3>Your AI creation will appear here</h3>

                                <p>
                                    Choose a movie, pick a creative style,
                                    and generate an original tagline.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="creation-label">
                                    YOUR AI CREATION
                                </p>

                                <div className="creation-movie">
                                    <div>
                                        <p className="creation-movie-title">
                                            {selectedMovie?.title ||
                                                "Selected Movie"}
                                        </p>

                                        {selectedMovie?.genre && (
                                            <span className="creation-genre">
                                                {selectedMovie.genre}
                                            </span>
                                        )}
                                    </div>

                                    <span className="creation-ai-badge">
                                        AI GENERATED
                                    </span>
                                </div>

                                <blockquote className="creation-quote">
                                    “{generation.generated_text}”
                                </blockquote>

                                <p className="creation-direction">
                                    <strong>Creative direction:</strong>{" "}
                                    {generation.prompt}
                                </p>

                                <div className="vote-divider" />

                                <p className="vote-question">
                                    Does this tagline deserve the
                                    spotlight?
                                </p>

                                <div className="studio-vote-buttons">
                                    <button
                                        type="button"
                                        className={`studio-vote-button ${
                                            selectedVote === 1
                                                ? "active-up"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleVote(1)
                                        }
                                        disabled={voting}
                                    >
                                        👍{" "}
                                        {selectedVote === 1
                                            ? "Upvoted"
                                            : "Upvote"}
                                    </button>

                                    <button
                                        type="button"
                                        className={`studio-vote-button ${
                                            selectedVote === -1
                                                ? "active-down"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleVote(-1)
                                        }
                                        disabled={voting}
                                    >
                                        👎{" "}
                                        {selectedVote === -1
                                            ? "Downvoted"
                                            : "Downvote"}
                                    </button>
                                </div>

                                {voteMessage && (
                                    <p className="studio-vote-message">
                                        {voteMessage}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
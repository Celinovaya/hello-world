import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "You must be signed in to generate content." },
                { status: 401 }
            );
        }

        const { movieId, movieTitle, prompt } = await request.json();

        if (!movieId || !movieTitle || !prompt) {
            return NextResponse.json(
                { error: "Movie and prompt are required." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key is not configured." },
                { status: 500 }
            );
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: `Create one short and creative movie tagline for "${movieTitle}".

User request: ${prompt}

Return only the tagline. Do not add quotation marks or explanations.`,
        });

        const generatedText = response.text?.trim();

        if (!generatedText) {
            return NextResponse.json(
                { error: "No text was generated." },
                { status: 500 }
            );
        }

        const { data: generation, error } = await supabase
            .from("generations")
            .insert({
                user_id: user.id,
                movie_id: movieId,
                prompt,
                generated_text: generatedText,
            })
            .select()
            .single();

        if (error) {
            console.error(error);

            return NextResponse.json(
                { error: "The tagline was generated, but it could not be saved." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            generation,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to generate content." },
            { status: 500 }
        );
    }
}
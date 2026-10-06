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
                { error: "You must be signed in to vote." },
                { status: 401 }
            );
        }

        const { generationId, value } = await request.json();

        if (!generationId || ![1, -1].includes(value)) {
            return NextResponse.json(
                { error: "Invalid vote." },
                { status: 400 }
            );
        }

        const { data: vote, error } = await supabase
            .from("votes")
            .upsert(
                {
                    user_id: user.id,
                    generation_id: generationId,
                    value,
                },
                {
                    onConflict: "user_id,generation_id",
                }
            )
            .select()
            .single();

        if (error) {
            console.error(error);

            return NextResponse.json(
                { error: "Failed to save vote." },
                { status: 500 }
            );
        }

        return NextResponse.json({ vote });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Failed to submit vote." },
            { status: 500 }
        );
    }
}
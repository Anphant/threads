"use server"; // to indicate we're using server actions

import { use } from "react";
import User from "../models/user.model";
import {connectToDB} from "../mongoose";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

// Values were destructured 
export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void>{
    connectToDB();

    try {
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true}
        );

        if (path === "/profile/edit") {
            // Allows us to revalidate data associated with a specific path.
            // Useful for scenarios where you want to update your cached data
            // without waiting for a revalidation period to expire.
            revalidatePath(path);
        }
    } catch(error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}
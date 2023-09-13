"use server"; // to indicate we're using server actions
import {revalidatePath} from "next/cache";
import { use } from "react";
import User from "../models/user.model";
import {connectToDB} from "../mongoose";

// Define the interface for the parameters required by the `updateUser` function.
interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

// Define the `updateUser` function to update user information in the database.
export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void>{
    // Connect to the database.
    connectToDB();

    try {
        // Update the user document in the database using the User model.
        await User.findOneAndUpdate(
            {id: userId},
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            {upsert: true} // Create the document if it doesn't exist.
        );

        if (path === "/profile/edit") {
            // Revalidate data associated with a specific path.
            // Useful for scenarios where you want to update cached data
            // without waiting for a revalidation period to expire.
            revalidatePath(path);
        }
    } catch(error: any) {
        // Handle any errors that occur during the database update.
        throw new Error(`Failed to create/update user: ${error.message}`)
    }
}
// Define the `fetchUser` function to retrieve user information from the database by userId.
export async function fetchUser(userId: string) {
    try {
        connectToDB();

        // Find and retrieve the user document from the database based on the provided userId.
        return await User
            .findOneAndUpdate({id: userId})
            // .populate({
            //     path: "communities",
            //     model: "Community"
            // })
    } catch (error: any) {
        // Handle any errors that occur during the database retrieval.
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}
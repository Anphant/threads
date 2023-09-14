"use server" // Indicates that this module is intended for server-side actions.

import {revalidatePath} from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import {connectToDB} from "../mongoose";
import { Children } from "react";

// Define the interface for the parameters required by the `createThread` function.
interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

// Define the `createThread` function to create a new thread.
export async function createThread({text, author, communityId, path}: Params) {
    try {
        // Connect to the database.
        connectToDB();

        // Create a new thread using the imported Thread model.
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });

        // Update the user model to add the newly created thread to the user's list of threads.
        await User.findByIdAndUpdate(author, {
            $push: {threads: createdThread._id}
        })

        // Revalidate data associated with a specific path.
        // Useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire.
        revalidatePath(path);
    } catch (error: any) {
        // Handle any errors that occur during the thread creation.
        throw new Error(`Error creating thread: ${error.message}`);
    }
};

// Define the 'fetchThreads' function to fetch existing threads/posts
export async function fetchThreads(pageNumber = 1, pageSize = 20) {
    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;

    // Fetch the posts that have no parents (top-level threads...)
    const postsQuery = Thread.find({parentId: {$in: [null, undefined]}})
        .sort({createdAt: "desc"}) // sort by newest posts first
        .skip(skipAmount)
        .limit(pageSize)
        .populate({path: "author", model: User}) // populate with the User model
        .populate({
            path: "children", // populate with comments
            populate: {
                path: "author",
                model: User,
                select: "_id name parentId image"
            }
        })

        const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}})

        const posts = await postsQuery.exec();

        const isNext = totalPostsCount > skipAmount + posts.length;

        return {posts, isNext}
}

export async function fetchThreadById(id: string) {
    connectToDB();

    try {

        // TODO: Populate Community

        const thread = await Thread.findById(id)
            .populate({
                path: "author",
                model: User,
                select: "_id id name image",
            })
            .populate({
                path: "children",
                populate: [
                    {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image",
                    },
                    {
                        path: "children",
                        model: Thread,
                        populate: {
                            path: "author",
                            model: User,
                            select: "_id id name parentId image",
                        }
                    }
                ]
            }).exec(); //execute this specific query

            return thread;
    } catch (error: any) {
        throw new Error(`Error fetching thread: ${error.message}`)
    }
}
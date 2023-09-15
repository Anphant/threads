"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../mongoose";

import User from "../models/user.model";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip based on the page number and page size.
  const skipAmount = (pageNumber - 1) * pageSize;

  // Create a query to fetch the posts that have no parent (top-level threads) (a thread that is not a comment/reply).
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", // Populate the children field
      populate: {
        path: "author", // Populate the author field within children
        model: User,
        select: "_id name parentId image", // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level posts (threads) i.e., threads that are not comments.
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of posts

  const posts = await postsQuery.exec();

  const isNext = totalPostsCount > skipAmount + posts.length;

  return { posts, isNext };
}

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path }: Params
) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject, // Assign communityId if provided, or leave it null for personal account
    });

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      }) // Populate the author field with _id and username
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // Populate the community field with _id and name
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}

// "use server" // Indicates that this module is intended for server-side actions.

// import {revalidatePath} from "next/cache";
// import Thread from "../models/thread.model";
// import User from "../models/user.model";
// import {connectToDB} from "../mongoose";
// import { Children } from "react";

// // Define the interface for the parameters required by the `createThread` function.
// interface Params {
//     text: string,
//     author: string,
//     communityId: string | null,
//     path: string,
// }

// // Define the `createThread` function to create a new thread.
// export async function createThread({text, author, communityId, path}: Params) {
//     try {
//         // Connect to the database.
//         connectToDB();

//         // Create a new thread using the imported Thread model.
//         const createdThread = await Thread.create({
//             text,
//             author,
//             community: communityId,
//         });

//         // Update the user model to add the newly created thread to the user's list of threads.
//         await User.findByIdAndUpdate(author, {
//             $push: {threads: createdThread._id}
//         })

//         // Revalidate data associated with a specific path.
//         // Useful for scenarios where you want to update your cached data without waiting for a revalidation period to expire.
//         revalidatePath(path);
//     } catch (error: any) {
//         // Handle any errors that occur during the thread creation.
//         throw new Error(`Error creating thread: ${error.message}`);
//     }
// };

// // Define the 'fetchThreads' function to fetch existing threads/posts
// export async function fetchThreads(pageNumber = 1, pageSize = 20) {
//     connectToDB();

//     // Calculate the number of posts to skip
//     const skipAmount = (pageNumber - 1) * pageSize;

//     // Fetch the posts that have no parents (top-level threads...)
//     const postsQuery = Thread.find({parentId: {$in: [null, undefined]}})
//         .sort({createdAt: "desc"}) // sort by newest posts first
//         .skip(skipAmount)
//         .limit(pageSize)
//         .populate({path: "author", model: User}) // populate with the User model
//         .populate({
//             path: "children", // populate with comments
//             populate: {
//                 path: "author",
//                 model: User,
//                 select: "_id name parentId image"
//             }
//         })

//         const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}})

//         const posts = await postsQuery.exec();

//         const isNext = totalPostsCount > skipAmount + posts.length;

//         return {posts, isNext}
// }

// export async function fetchThreadById(id: string) {
//     connectToDB();

//     try {

//         // TODO: Populate Community

//         const thread = await Thread.findById(id)
//             .populate({
//                 path: "author",
//                 model: User,
//                 select: "_id id name image",
//             })
//             .populate({
//                 path: "children",
//                 populate: [
//                     {
//                         path: "author",
//                         model: User,
//                         select: "_id id name parentId image",
//                     },
//                     {
//                         path: "children",
//                         model: Thread,
//                         populate: {
//                             path: "author",
//                             model: User,
//                             select: "_id id name parentId image",
//                         }
//                     }
//                 ]
//             }).exec(); //execute this specific query

//             return thread;
//     } catch (error: any) {
//         throw new Error(`Error fetching thread: ${error.message}`)
//     }
// }

// export async function addCommentToThread(
//     threadId: string,
//     commentText: string,
//     userId: string,
//     path: string,
// ) {
//     connectToDB();

//     try {
//       // Find the original thread by its ID
//       const originalThread = await Thread.findById(threadId);

//       if(!originalThread) {
//         throw new Error("Thread not found")
//       }

//       // Create a new thread with the comment text
//       const commentThread = new Thread({
//         text: commentText,
//         author: userId,
//         parentId: threadId,
//       })

//       // Save the new thread
//       const savedCommentThread = await commentThread.save();

//       // Update the original thread to include the new comment
//       originalThread.children.push(savedCommentThread._id);

//       // Save the original thread
//       await originalThread.save();
      
//     } catch(error: any) {
//         throw new Error(`Error adding comment to thread: ${error.message}`)
//     }
// }
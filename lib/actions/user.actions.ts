"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";

import { connectToDB } from "../mongoose";

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
    connectToDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
    throw error;
  }
}

// Almost similar to Thead (search + pagination) and Community (search + pagination)
export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, // Exclude the current user from the results.
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // Check if there are more users beyond the current page.
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    // Find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field of each user thread
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    // Find and return the child threads (replies) excluding the ones created by the same user
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
    throw error;
  }
}

// "use server"; // to indicate we're using server actions

// import User from "../models/user.model";
// import Thread from "../models/thread.model";
// import {revalidatePath} from "next/cache";
// import {connectToDB} from "../mongoose";
// import { FilterQuery, SortOrder } from "mongoose";

// // Define the interface for the parameters required by the `updateUser` function.
// interface Params {
//     userId: string;
//     username: string;
//     name: string;
//     bio: string;
//     image: string;
//     path: string;
// }

// // Define the `updateUser` function to update user information in the database.
// export async function updateUser({
//     userId,
//     username,
//     name,
//     bio,
//     image,
//     path,
// }: Params): Promise<void>{
//     // Connect to the database.
//     connectToDB();

//     try {
//         // Update the user document in the database using the User model.
//         await User.findOneAndUpdate(
//             {id: userId},
//             {
//                 username: username.toLowerCase(),
//                 name,
//                 bio,
//                 image,
//                 onboarded: true,
//             },
//             {upsert: true} // Create the document if it doesn't exist.
//         );

//         if (path === "/profile/edit") {
//             // Revalidate data associated with a specific path.
//             // Useful for scenarios where you want to update cached data
//             // without waiting for a revalidation period to expire.
//             revalidatePath(path);
//         }
//     } catch(error: any) {
//         // Handle any errors that occur during the database update.
//         throw new Error(`Failed to create/update user: ${error.message}`);
//     }
// }
// // Define the `fetchUser` function to retrieve user information from the database by userId.
// export async function fetchUser(userId: string) {
//     try {
//         connectToDB();

//         // Find and retrieve the user document from the database based on the provided userId.
//         return await User
//             .findOne({id: userId})
//             // .populate({
//             //     path: "communities",
//             //     model: "Community"
//             // })
//     } catch (error: any) {
//         // Handle any errors that occur during the database retrieval.
//         throw new Error(`Failed to fetch user: ${error.message}`);
//     }
// }
// // Define the 'fetchUserPosts' function to retrieve user posts from the database by userId.
// export async function fetchUserPosts(userId: string) {
//     try {
//         connectToDB();

//         // Find all threads authored by user with the given userId
//         //TODO: Populate community
//         const threads = await User.findOne({id: userId})
//             .populate({
//                 path: "threads",
//                 model: Thread,
//                 populate: {
//                     path: "children",
//                     model: Thread,
//                     populate: {
//                         path: "author",
//                         model: User,
//                         select: "name image id"
//                     }
//                 }
//             })

//             return threads;
//     } catch (error: any) {

//         throw new Error(`Failed to fetch user posts: ${error.message}`);
//     }
// }
// // Define the 'fetchUsers' function to retrieve list of users
// export async function fetchUsers({
//     userId,
//     searchString = "",
//     pageNumber = 1,
//     pageSize = 20,
//     sortBy = "desc"
// }: {
//     userId: string;
//     searchString?: string;
//     pageNumber?: number;
//     pageSize?: number;
//     sortBy?: SortOrder;
// }) {
//     try {
//         connectToDB();

//         // skipping
//         const skipAmount = (pageNumber - 1) * pageSize;

//         const regex = new RegExp(searchString, "i");

//         // fetching
//         const query: FilterQuery<typeof User> = {
//             id: {$ne: userId}
//         }

//         // searching
//         if(searchString.trim() !== "") {
//             query.$or = [
//                 {username: {$regex: regex} },
//                 {name: {$regex: regex}}
//             ]
//         }

//         const sortOptions = {createdAt: sortBy};

//         const usersQuery = User.find(query)
//             .sort(sortOptions)
//             .skip(skipAmount)
//             .limit(pageSize);

//         const totalUsersCount = await User.countDocuments(query);

//         const users = await usersQuery.exec();

//         const isNext = totalUsersCount > skipAmount + users.length;

//         return {users, isNext};

//     } catch (error: any) {
//         throw new Error(`Failed to fetch users: ${error.message}`)
//     }
// }

// export async function getActivity(userId: string) {
//     try {
//         connectToDB();

//         // Find all threads created by the user
//         const userThreads = await Thread.find({author: userId});

//         // Collect all the child thread IDs (replies) from the 'children' field
//         const childThreadIds = userThreads.reduce((acc, userThread) => {
//             return acc.concat(userThread.children)
//         }, []);

//         const replies = await Thread.find({
//             _id: {$in: childThreadIds},
//             author: {$ne: userId},
//         }).populate({
//             path: "author",
//             model: User,
//             select: "name image _id"
//         });

//         return replies;
//     } catch (error: any) {
//         throw new Error(`Failed to get activity: ${error.message}`)
//     }
// }
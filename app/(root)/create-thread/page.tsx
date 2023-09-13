import PostThread from "@/components/forms/PostThread";
import {fetchUser} from "@/lib/actions/user.actions";
import {currentUser} from "@clerk/nextjs";
import {redirect} from "next/navigation";

// Define an asynchronous function called Page.
async function Page() {
    // Use the currentUser function to get the current user.
    const user = await currentUser();

    // If there is no user (user is not authenticated), return null.
    if(!user) return null;

    // Retrieve user information using the fetchUser function based on the user's ID.
    const userInfo = await fetchUser(user.id);

    // If the user information indicates that the user has not completed onboarding, redirect to the onboarding page.
    if(!userInfo?.onboarded) redirect("/onboarding");

    // If the user has completed onboarding, render a "Create Thread" heading.
    return (
        <>
            <h1 className="head-text">Create Thread</h1>

            <PostThread userId={userInfo._id} />
        </>
    )
}

export default Page;
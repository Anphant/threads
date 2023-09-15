import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser } from "@/lib/actions/user.actions"; // Get current logged in user details
import AccountProfile from "@/components/forms/AccountProfile";

async function Page() {
   // Fetch the current user's details
  const user = await currentUser();

  // If the user is not available, return null
  // This is primarily to avoid typescript warnings for possible null values
  if (!user) return null;

  // Fetch additional user information based on the user's id
  const userInfo = await fetchUser(user.id);

  // If the user is already onboarded, redirect them to the home page
  if (userInfo?.onboarded) redirect("/");

  // Prepare the user data for the AccountProfile component.
  // The code checks for the presence of userInfo data. 
  // If it's not available, it falls back to the user's default values.
  const userData = {
    id: user.id,
    objectId: userInfo?._id,
    username: userInfo ? userInfo?.username : user.username,
    name: userInfo ? userInfo?.name : user.firstName ?? "",
    bio: userInfo ? userInfo?.bio : "",
    image: userInfo ? userInfo?.image : user.imageUrl,
  };

  // Render the onboarding page for the user
  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start px-10 py-20'>
      <h1 className='head-text'>Onboarding</h1>
      <p className='mt-3 text-base-regular text-light-2'>
        You look new. Before we get started, let's set up your Threads experience.
      </p>

      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}

export default Page;
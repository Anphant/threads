import Image from "next/image";
import { currentUser } from "@clerk/nextjs";

// Constants
import { communityTabs } from "@/constants";

// Component Imports
import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Fetch Community Details
import { fetchCommunityDetails } from "@/lib/actions/community.actions";

// Define the Page component
async function Page({ params }: { params: { id: string } }) {
  // Fetch the current user
  const user = await currentUser();
  if (!user) return null;  // If no user is found, return null

  // Fetch community details based on provided ID
  const communityDetails = await fetchCommunityDetails(params.id);

  // Render the component
  return (
    <section>
      {/* Display the profile header */}
      <ProfileHeader
        accountId={communityDetails.createdBy.id}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        type='Community'
      />

      <div className='mt-9'>
        {/* Initialize the Tabs */}
        <Tabs defaultValue='threads' className='w-full'>
          {/* Map through the community tabs and display each tab trigger */}
          <TabsList className='tab'>
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                {/* Display icon for each tab */}
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                {/* Display tab label */}
                <p className='max-sm:hidden'>{tab.label}</p>

                {/* If the tab label is "Threads", display the number of threads */}
                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {communityDetails.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content for the 'threads' tab */}
          <TabsContent value='threads' className='w-full text-light-1'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          {/* Content for the 'members' tab */}
          <TabsContent value='members' className='mt-9 w-full text-light-1'>
            <section className='mt-9 flex flex-col gap-10'>
              {/* Map through community members and display each member's card */}
              {communityDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>
          </TabsContent>

          {/* Content for the 'requests' tab */}
          <TabsContent value='requests' className='w-full text-light-1'>
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;

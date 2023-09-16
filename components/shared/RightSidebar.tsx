import { currentUser } from "@clerk/nextjs";
import UserCard from "../cards/UserCard";

// Data fetching methods
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUsers } from "@/lib/actions/user.actions";

// Define the RightSidebar component
async function RightSidebar() {
  // Fetch the current user
  const user = await currentUser();

  // Fetch a list of similar users
  const similarMinds = await fetchUsers({ pageSize: 4 } as any);

  // Fetch a list of suggested communities
  const suggestedCommunities = await fetchCommunities({ pageSize: 4 });

  // Render the component
  return (
    <section className='custom-scrollbar rightsidebar'>
      <div className='flex flex-1 flex-col justify-start'>
        {/* Header for suggested communities */}
        <h3 className='text-heading4-medium text-light-1'>
          Suggested Communities
        </h3>
        <div className='mt-7 flex w-[350px] flex-col gap-9'>
          {/* Display communities if available */}
          {suggestedCommunities.communities.length > 0 ? (
            <>
              {suggestedCommunities.communities.map((community) => (
                <UserCard
                  key={community.id}
                  id={community.id}
                  name={community.name}
                  username={community.username}
                  imgUrl={community.image}
                  personType='Community'
                />
              ))}
            </>
          ) : (
            // Display message if no communities are available
            <p className='!text-base-regular text-light-3'>
              No communities yet
            </p>
          )}
        </div>
      </div>
      <div className='flex flex-1 flex-col justify-start'>
        {/* Header for similar minds */}
        <h3 className='text-heading4-medium text-light-1'>Similar Minds</h3>
        <div className='mt-7 flex w-[350px] flex-col gap-10'>
          {/* Display similar minds if available */}
          {similarMinds.users.length > 0 ? (
            <>
              {similarMinds.users.map((person) => (
                <UserCard
                  key={person.id}
                  id={person.id}
                  name={person.name}
                  username={person.username}
                  imgUrl={person.image}
                  personType='User'
                />
              ))}
            </>
          ) : (
            // Display message if no similar minds are available
            <p className='!text-base-regular text-light-3'>
              No similar minds yet
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// Export the RightSidebar component
export default RightSidebar;

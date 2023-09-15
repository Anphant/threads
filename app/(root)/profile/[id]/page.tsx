import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { profileTabs } from "@/constants";

import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { fetchUser } from "@/lib/actions/user.actions";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  
  // Check if user exists
  if (!user) return null;

  const userInfo = await fetchUser(params.id);

  // Check if user has been onboarded
  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <section>
      <ProfileHeader
        accountId={userInfo.id}
        authUserId={user.id}
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {profileTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2'>
                    {userInfo.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {profileTabs.map((tab) => (
            <TabsContent
              key={`content-${tab.label}`}
              value={tab.value}
              className='w-full text-light-1'
            >
              {/* @ts-ignore */}
              <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType='User'
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
export default Page;

// import Image from "next/image";
// import ThreadsTab from "@/components/shared/ThreadsTab";
// import ProfileHeader from "@/components/shared/ProfileHeader";
// import {profileTabs} from "@/constants";
// import {fetchUser} from "@/lib/actions/user.actions";
// import {currentUser} from "@clerk/nextjs";
// import {redirect} from "next/navigation";
// import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

// async function Page({params}: {params: {id: string}}) {
//     // Use the currentUser function to get the current user.
//     const user = await currentUser();

//     // If there is no user (user is not authenticated), return null.
//     if(!user) return null;

//     // Retrieve user information using the fetchUser function
//     const userInfo = await fetchUser(params.id);

//     // If the user information indicates that the user has not completed onboarding, redirect to the onboarding page.
//     if(!userInfo?.onboarded) redirect("/onboarding");

//     return (
//         <section>
//             <ProfileHeader
//                 accountId={userInfo.id}
//                 authUserId={user.id}
//                 name={userInfo.name}
//                 username={userInfo.username}
//                 imgUrl={userInfo.image}
//                 bio={userInfo.bio}
//             />

//             <div className="mt-9">
//                 <Tabs defaultValue="threads" className="w-full">
//                     <TabsList className="tab">
//                         {profileTabs.map((tab) => (
//                             <TabsTrigger key={tab.label} value={tab.value} className="tab">
//                                 <Image
//                                     src={tab.icon}
//                                     alt={tab.label}
//                                     width={24}
//                                     height={24}
//                                     className="object-contain"
//                                 />
//                                 <p className="max-sm:hidden">{tab.label}</p>

//                                 {tab.label === "Threads" && (
//                                     <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
//                                         {userInfo?.threads?.length}
//                                     </p>
//                                 )}
//                             </TabsTrigger>
//                         ))}
//                     </TabsList>
//                     {profileTabs.map((tab) => (
//                         <TabsContent key={`content-${tab.label}`} value={tab.value} className="w-full text-light-1">
//                             <ThreadsTab 
//                                 currentUserId={user.id}
//                                 accountId={userInfo.id}
//                                 accountType="User"
//                             />
//                         </TabsContent>
//                     ))}
//                 </Tabs>
//             </div>
//         </section>
//     )
// }

// export default Page;
import Image from "next/image";

// Define the properties interface for the ProfileHeader component
interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
}

// ProfileHeader component represents the top header of a social media profile page
const ProfileHeader = ({accountId, authUserId, name, username, imgUrl, bio}: Props) => {
    return (
        // The container for the profile header's sub-components
        <div className="flex w-full flex-col justify-start">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image 
                            src={imgUrl}
                            alt="Profile Image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-light-1">{name}</h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>
                    </div>
                </div>
            </div>

            {/* TODO: Community */}

            {/* Display the user's biography */}
            <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>

            {/* Horizontal line to separate the header section from other sections */}
            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    )
}

export default ProfileHeader;
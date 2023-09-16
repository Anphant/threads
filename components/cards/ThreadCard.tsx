import Image from "next/image";
import Link from "next/link";

// Utility function to format date strings
import { formatDateString } from "@/lib/utils";
// import DeleteThread from "../forms/DeleteThread";

// Define properties expected by the ThreadCard component
interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean; // Optional prop to identify if the card represents a comment
}

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) {

  return (
    // Main container for the thread card
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-dark-2 p-7"
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            {/* User profile image with a link to their profile */}
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>

            {/* Decorative bar element below the user image */}
            <div className='thread-card_bar' />
          </div>

          <div className='flex w-full flex-col'>
            {/* Display the author's name with a link to their profile */}
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-light-1'>
                {author.name}
              </h4>
            </Link>

            {/* Display the main content of the thread */}
            <p className='mt-2 text-small-regular text-light-2'>{content}</p>

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              {/* Display interactive icons for the thread */}
              <div className='flex gap-3.5'>
                {/* Each image here represents an action, like liking, replying, sharing, etc. */}
                <Image
                  src='/assets/heart-gray.svg'
                  alt='heart'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain'
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src='/assets/reply.svg'
                    alt='heart'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain'
                  />
                </Link>
                <Image
                  src='/assets/repost.svg'
                  alt='heart'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain'
                />
                <Image
                  src='/assets/share.svg'
                  alt='heart'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain'
                />
              </div>

              {/* If the card is a comment and has replies, display the count */}
              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* DeleteThread component is commented out but it would provide functionality to delete a thread */}
        {/* <DeleteThread
        {/* <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        /> */}
      </div>

      {/* If the card isn't a comment and has replies, show a preview of the reply authors */}
      {!isComment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {/* Always display the timestamp */}
<div className='mt-5 flex items-center'>
  <p className='text-subtle-medium text-gray-1'>
    {`${formatDateString(createdAt)} `}
  </p>

  {/* Display the community details only if the card isn't a comment and belongs to a community */}
  {!isComment && community && (
    <>
      <p className='text-subtle-medium text-gray-1'>
        {` : ${community.name} Community`}
      </p>
      <Image
        src={community.image}
        alt={community.name}
        width={14}
        height={14}
        className='ml-1 rounded-full object-cover'
      />
    </>
  )}
</div>
      
    </article>
  );
}

export default ThreadCard;
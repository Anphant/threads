import { type ClassValue, clsx } from "clsx"; 
import { twMerge } from "tailwind-merge";

// This function takes a series of class values as arguments, merges and processes them using clsx and twMerge.
// `clsx` is a utility for conditionally concatenating class names,
// and `twMerge` is a utility to merge two or more Tailwind CSS class strings together.
// created by shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// This function checks if a given string represents a base64 encoded image.
// It uses a regular expression to match the start of a base64 encoded image data URI format.
export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

// This function takes a date string, parses it into a Date object, 
// and then formats it into a custom string format showing the time followed by the date.
// The date is formatted using the Intl.DateTimeFormatOptions to show day, month, and year.
export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${time} - ${formattedDate}`;
}

// This function takes a number (representing a thread count) and returns a string representation.
// If there are no threads, it returns "No Threads".
// If there are threads, it returns a zero-padded, 2-digit number followed by either "Thread" or "Threads", 
// based on the count.
export function formatThreadCount(count: number): string {
  if (count === 0) {
    return "No Threads";
  } else {
    const threadCount = count.toString().padStart(2, "0");
    const threadWord = count === 1 ? "Thread" : "Threads";
    return `${threadCount} ${threadWord}`;
  }
}
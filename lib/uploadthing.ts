// Create the UploadThing Components

// Generating components lets you pass your generic FileRouter once
// and then have typesafe components everywhere, instead of having to
// pass the generic everytime you mount a component. - uploadthing.com

import { generateReactHelpers } from "@uploadthing/react/hooks";
 
import type { OurFileRouter } from "@/app/api/uploadthing/core";
 
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
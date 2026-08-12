import { getServerSession } from 'next-auth/next';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth-options';

const f = createUploadthing();

/**
 * Uploads are restricted to signed-in users. This middleware runs on the server
 * for every upload request, so the session is the only thing standing between
 * the public internet and this deployment's storage quota.
 */
async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;

  if (!userId) throw new UploadThingError('Unauthorized');

  return { id: userId };
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  avatar: f({ image: { maxFileSize: '4MB' } })
    .middleware(() => requireUser())
    .onUploadComplete(() => {
      // no-op: the client receives the upload result directly
    }),

  generalMedia: f({
    'application/pdf': { maxFileSize: '4MB', maxFileCount: 4 },
    image: { maxFileSize: '2MB', maxFileCount: 4 },
    video: { maxFileSize: '256MB', maxFileCount: 1 },
  })
    .middleware(() => requireUser())
    .onUploadComplete(() => {
      // no-op: the client receives the upload result directly
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

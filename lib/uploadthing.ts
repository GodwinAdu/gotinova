import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const f = createUploadthing()

// Middleware to check auth
const auth_middleware = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    throw new UploadThingError('Unauthorized')
  }

  return { userId: session.user.id }
}

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: '16MB', maxFileCount: 5 },
  })
    .middleware(auth_middleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('File uploaded by user:', metadata.userId)
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  reviewImage: f({
    image: { maxFileSize: '8MB', maxFileCount: 3 },
  })
    .middleware(auth_middleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Review image uploaded by user:', metadata.userId)
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  userAvatar: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  })
    .middleware(auth_middleware)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Avatar uploaded by user:', metadata.userId)
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

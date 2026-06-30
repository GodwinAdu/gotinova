# UploadThing Integration Setup

This guide explains how to set up UploadThing for image uploads in LuxeHair.

## What is UploadThing?

UploadThing is a fully managed file upload service optimized for performance and security. It handles:
- Image uploads with automatic optimization
- File validation and type checking
- CDN delivery for fast downloads
- Automatic cleanup and storage management

## Setup Steps

### 1. Create an UploadThing Account

1. Visit [uploadthing.com](https://uploadthing.com)
2. Sign up for a free account
3. Create a new app for LuxeHair

### 2. Get Your API Keys

1. From your UploadThing dashboard, copy:
   - **UPLOADTHING_TOKEN** - Your secret API token
   - **UPLOADTHING_APP_ID** - Your application ID (if needed)

### 3. Add Environment Variables

Add these to your `.env.local` file:

```env
UPLOADTHING_TOKEN=your_token_here
```

### 4. File Router Configuration

The file router is already configured in `/lib/uploadthing.ts` with the following endpoints:

#### `productImage`
- Max file size: 16MB
- Max files: 5 per upload
- Accepted: Images only
- Use for: Product photos in admin dashboard

#### `reviewImage`
- Max file size: 8MB
- Max files: 3 per upload
- Accepted: Images only
- Use for: Customer review photos

#### `userAvatar`
- Max file size: 4MB
- Max files: 1 per upload
- Accepted: Images only
- Use for: User profile avatars

### 5. Using Image Uploads in Components

#### Basic Example

```tsx
import { ImageUpload } from '@/components/image-upload'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/lib/uploadthing'

export function MyComponent() {
  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/uploadthing', {
      method: 'POST',
      body: formData,
    })
    
    return response.json()
  }

  return (
    <ImageUpload
      onUpload={handleUpload}
      maxFiles={5}
      maxSize={16 * 1024 * 1024}
    />
  )
}
```

### 6. Uploading Product Images (Admin)

In `/app/admin/products/page.tsx`:

```tsx
import { ImageUpload } from '@/components/image-upload'

export function ProductForm() {
  const [images, setImages] = useState<string[]>([])

  const handleUploadProduct = async (file: File) => {
    // Upload directly to UploadThing
    try {
      const response = await fetch('/api/uploadthing', {
        method: 'POST',
        body: formData,
      })
      const { url } = await response.json()
      setImages([...images, url])
      return { url }
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  return (
    <div>
      <ImageUpload
        onUpload={handleUploadProduct}
        maxFiles={5}
        maxSize={16 * 1024 * 1024}
      />
    </div>
  )
}
```

## Features Implemented

✅ **Image Upload Component** - Drag & drop, file selection
✅ **Mobile Optimized** - Works great on phones and tablets
✅ **Type Safety** - Full TypeScript support
✅ **Error Handling** - User-friendly error messages
✅ **Progress Feedback** - Loading states and animations
✅ **File Validation** - Size and type checking
✅ **Security** - Authentication required for uploads
✅ **Multiple Endpoints** - Different file routers for different use cases

## Security Notes

- All uploads require user authentication
- File types are validated on both client and server
- File sizes are enforced strictly
- UploadThing CDN provides DDoS protection
- Images are automatically optimized and compressed
- Old/unused uploads should be cleaned up regularly

## Troubleshooting

### Upload Fails with "Unauthorized"
- Check that user is logged in
- Verify session is valid
- Check BETTER_AUTH_SECRET is set

### Upload Fails with "File Too Large"
- Reduce file size before uploading
- Use image compression tools if needed
- Check individual endpoint limits

### Images Don't Display
- Verify image URL is correct
- Check that UploadThing token is valid
- Clear browser cache
- Check image file isn't corrupted

## Performance Tips

1. **Compress images before upload** for faster uploads
2. **Use image formats wisely**: WEBP > PNG > JPG for web
3. **Cache uploaded URLs** in state/database
4. **Lazy load images** on product pages
5. **Use responsive image sizes** with srcSet

## Next Steps

1. Create an UploadThing account
2. Add `UPLOADTHING_TOKEN` to `.env.local`
3. Test image upload on product creation
4. Review and approve uploaded product images
5. Deploy to production with token configured

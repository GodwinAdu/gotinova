'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, Loader2, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export interface UploadedImage {
  id: string
  url: string
  name: string
}

interface ImageUploadProps {
  value: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  endpoint?: string
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
}

export function ImageUpload({
  value = [],
  onChange,
  endpoint = 'productImage',
  maxFiles = 5,
  maxSize = 16 * 1024 * 1024,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('')

      if (acceptedFiles.length + value.length > maxFiles) {
        setError(`Maximum ${maxFiles} image(s) allowed`)
        return
      }

      setUploading(true)

      try {
        const newImages: UploadedImage[] = []

        for (const file of acceptedFiles) {
          const id = `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

          // Try UploadThing endpoint
          try {
            const formData = new FormData()
            formData.append('files', file)

            // Use the UploadThing route handler
            const res = await fetch('/api/uploadthing', {
              method: 'POST',
              body: formData,
            })

            if (res.ok) {
              const data = await res.json()
              const url = Array.isArray(data) ? data[0]?.url : data?.url
              if (url) {
                newImages.push({ id, url, name: file.name })
                continue
              }
            }
          } catch {
            // Fallback to local preview
          }

          // Fallback: create object URL for local preview
          const localUrl = URL.createObjectURL(file)
          newImages.push({ id, url: localUrl, name: file.name })
        }

        onChange([...value, ...newImages])
      } catch (err) {
        setError('Upload failed. Images saved as local previews.')
        // Add as local previews anyway
        const localImages = acceptedFiles.map(file => ({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: URL.createObjectURL(file),
          name: file.name,
        }))
        onChange([...value, ...localImages])
      } finally {
        setUploading(false)
      }
    },
    [value, onChange, maxFiles]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize,
    disabled: disabled || uploading || value.length >= maxFiles,
    multiple: maxFiles > 1,
  })

  const removeImage = (id: string) => {
    onChange(value.filter((img) => img.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      {value.length < maxFiles && (
        <div
          {...getRootProps()}
          className={cn(
            'relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30',
            (disabled || uploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive ? 'Drop images here' : 'Click or drag images to upload'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP • Max {(maxSize / 1024 / 1024).toFixed(0)}MB • Up to {maxFiles} images
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive font-medium bg-destructive/10 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {value.map((img, idx) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group"
            >
              <Image
                src={img.url}
                alt={img.name}
                fill
                className="object-cover"
                unoptimized
              />
              {idx === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  Main
                </span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

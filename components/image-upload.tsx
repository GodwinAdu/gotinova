'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onUpload: (file: File) => Promise<{ url: string }>
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
}

export function ImageUpload({
  onUpload,
  maxFiles = 1,
  maxSize = 16 * 1024 * 1024,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploads, setUploads] = useState<{ id: string; url: string; name: string }[]>([])
  const [error, setError] = useState<string>('')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError('')

      if (acceptedFiles.length + uploads.length > maxFiles) {
        setError(`Maximum ${maxFiles} file(s) allowed`)
        return
      }

      setUploading(true)

      try {
        for (const file of acceptedFiles) {
          const result = await onUpload(file)
          setUploads((prev) => [
            ...prev,
            {
              id: Math.random().toString(36),
              url: result.url,
              name: file.name,
            },
          ])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [onUpload, maxFiles, uploads.length]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxSize,
    disabled: disabled || uploading,
    multiple: maxFiles > 1,
  })

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 md:p-8 text-center transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border bg-background hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-3 h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
        <p className="text-sm md:text-base font-medium">
          {isDragActive ? 'Drop files here' : 'Drag & drop images here'}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          or click to select files
        </p>
        {maxSize && (
          <p className="text-xs text-muted-foreground mt-2">
            Max size: {(maxSize / 1024 / 1024).toFixed(0)}MB
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {uploads.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {uploads.map((upload) => (
            <div
              key={upload.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <img
                src={upload.url}
                alt={upload.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removeUpload(upload.id)}
                className="absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {upload.name}
              </p>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      )}
    </div>
  )
}

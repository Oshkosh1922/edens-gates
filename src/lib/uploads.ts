// File Upload Utilities for Supabase Storage
import { supabase } from './supabase'
import { UPLOADS_ENABLED } from './flags'

// Supported file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_PDF_TYPES = ['application/pdf']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const MAX_PDF_SIZE = 10 * 1024 * 1024 // 10MB

// Storage bucket name
export const FOUNDER_MEDIA_BUCKET = 'founder-media'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

// Validate file type and size
export const validateFile = (file: File, allowedTypes: string[], maxSize: number): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
  }
  
  if (file.size > maxSize) {
    return `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`
  }
  
  return null
}

// Generate unique filename
const generateFileName = (originalName: string, prefix: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalName.split('.').pop()
  return `${prefix}/${timestamp}-${random}.${ext}`
}

// Upload image thumbnail
export const uploadThumbnail = async (file: File, _founderId?: string): Promise<UploadResult> => {
  if (!UPLOADS_ENABLED) {
    return { success: false, error: 'Uploads not enabled' }
  }

  const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
  if (validation) {
    return { success: false, error: validation }
  }

  try {
    const fileName = generateFileName(file.name, 'thumbnails')
    
    const { data, error } = await supabase.storage
      .from(FOUNDER_MEDIA_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Thumbnail upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(FOUNDER_MEDIA_BUCKET)
      .getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return { success: false, error: 'Upload failed' }
  }
}

// Upload PDF deck
export const uploadDeck = async (file: File, _founderId?: string): Promise<UploadResult> => {
  if (!UPLOADS_ENABLED) {
    return { success: false, error: 'Uploads not enabled' }
  }

  const validation = validateFile(file, ALLOWED_PDF_TYPES, MAX_PDF_SIZE)
  if (validation) {
    return { success: false, error: validation }
  }

  try {
    const fileName = generateFileName(file.name, 'decks')
    
    const { data, error } = await supabase.storage
      .from(FOUNDER_MEDIA_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Deck upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(FOUNDER_MEDIA_BUCKET)
      .getPublicUrl(data.path)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected upload error:', error)
    return { success: false, error: 'Upload failed' }
  }
}
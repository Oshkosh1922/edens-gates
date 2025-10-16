// Visual Pass — Logic Preserved + File Uploads
import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'
import { UPLOADS_ENABLED } from '../lib/flags'
import { uploadThumbnail, uploadDeck } from '../lib/uploads'

type SubmitFormState = {
  name: string
  handle: string
  description: string
  video_url: string
  site_link: string
  thumbnail_url?: string
  deck_url?: string
}

type SubmitStatus =
  | { state: 'idle' }
  | { state: 'saving' }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string }

type FieldErrors = Partial<Record<keyof SubmitFormState, string>>

const initialState: SubmitFormState = {
  name: '',
  handle: '',
  description: '',
  video_url: '',
  site_link: '',
  thumbnail_url: '',
  deck_url: '',
}

export function Submit() {
  const [form, setForm] = useState<SubmitFormState>(initialState)
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' })
  const [errors, setErrors] = useState<FieldErrors>({})
  
  // File upload state
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [deckFile, setDeckFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<{
    thumbnail: 'idle' | 'uploading' | 'success' | 'error'
    deck: 'idle' | 'uploading' | 'success' | 'error'
  }>({ thumbnail: 'idle', deck: 'idle' })

  const normalizedHandle = useMemo(() => {
    if (!form.handle.trim()) {
      return ''
    }
    const trimmed = form.handle.trim()
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
  }, [form.handle])

  const validate = (nextForm: SubmitFormState): FieldErrors => {
    const nextErrors: FieldErrors = {}

    if (!nextForm.name.trim()) {
      nextErrors.name = 'Founder name is required.'
    }

    if (!nextForm.handle.trim()) {
      nextErrors.handle = 'Provide a public-facing handle or brand.'
    }

    if (nextForm.description.trim().length < 80) {
      nextErrors.description = 'Share at least 80 characters describing the vision.'
    }

    if (nextForm.video_url && !/^https?:\/\//i.test(nextForm.video_url.trim())) {
      nextErrors.video_url = 'Video link must start with http or https.'
    }

    if (nextForm.site_link && !/^https?:\/\//i.test(nextForm.site_link.trim())) {
      nextErrors.site_link = 'Website link must start with http or https.'
    }

    return nextErrors
  }

  const handleChange = (field: keyof SubmitFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
      setStatus((prev) => (prev.state === 'success' ? { state: 'idle' } : prev))
    }

  // File upload handlers
  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setThumbnailFile(file)
    setUploadStatus(prev => ({ ...prev, thumbnail: 'idle' }))
  }

  const handleDeckChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setDeckFile(file)
    setUploadStatus(prev => ({ ...prev, deck: 'idle' }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      return
    }

    setStatus({ state: 'saving' })

    // Handle file uploads if enabled
    let thumbnailUrl = null
    let deckUrl = null

    if (UPLOADS_ENABLED) {
      // Upload thumbnail if provided
      if (thumbnailFile) {
        setUploadStatus(prev => ({ ...prev, thumbnail: 'uploading' }))
        const thumbnailResult = await uploadThumbnail(thumbnailFile)
        if (thumbnailResult.success) {
          thumbnailUrl = thumbnailResult.url
          setUploadStatus(prev => ({ ...prev, thumbnail: 'success' }))
        } else {
          setUploadStatus(prev => ({ ...prev, thumbnail: 'error' }))
          setStatus({ state: 'error', message: `Thumbnail upload failed: ${thumbnailResult.error}` })
          return
        }
      }

      // Upload deck if provided
      if (deckFile) {
        setUploadStatus(prev => ({ ...prev, deck: 'uploading' }))
        const deckResult = await uploadDeck(deckFile)
        if (deckResult.success) {
          deckUrl = deckResult.url
          setUploadStatus(prev => ({ ...prev, deck: 'success' }))
        } else {
          setUploadStatus(prev => ({ ...prev, deck: 'error' }))
          setStatus({ state: 'error', message: `Deck upload failed: ${deckResult.error}` })
          return
        }
      }
    }

    // Insert founder record with uploaded file URLs
    const founderData = {
      name: form.name.trim(),
      handle: normalizedHandle,
      description: form.description.trim(),
      video_url: form.video_url.trim() || null,
      site_link: form.site_link.trim() || null,
      ...(UPLOADS_ENABLED && {
        thumbnail_url: thumbnailUrl,
        deck_url: deckUrl,
      }),
    }

    const { error } = await supabase.from('founders').insert(founderData)

    if (error) {
      setStatus({ state: 'error', message: error.message })
      return
    }

    setStatus({
      state: 'success',
      message: 'Submission received. We will review and publish once approved.',
    })
    setForm(initialState)
    setThumbnailFile(null)
    setDeckFile(null)
    setUploadStatus({ thumbnail: 'idle', deck: 'idle' })
  }

  const isSaving = status.state === 'saving'

  return (
    <Shell
      title="Submit your founder profile"
      description="Stand up your presence on Edens Gates. Share context, media, and why the Magic Eden community should back you."
    >
      <motion.div
        className="glass-panel p-8 sm:p-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div 
            className="grid gap-8 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="space-tight">
              <label className="text-sm font-medium text-secondary" htmlFor="name">
                Founder or project name *
              </label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange('name')}
                className="input-field"
                placeholder="Aurora Labs"
                required
              />
              {errors.name ? (
                <motion.p 
                  className="text-sm text-accent font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {errors.name}
                </motion.p>
              ) : null}
            </div>
            
            <div className="space-tight">
              <label className="text-sm font-medium text-secondary" htmlFor="handle">
                Public handle *
              </label>
              <input
                id="handle"
                name="handle"
                value={form.handle}
                onChange={handleChange('handle')}
                className="input-field"
                placeholder="@aurora_xyz"
                required
              />
              {normalizedHandle ? (
                <motion.p 
                  className="text-xs text-tertiary font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Stored as {normalizedHandle}
                </motion.p>
              ) : null}
              {errors.handle ? (
                <motion.p 
                  className="text-sm text-accent font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {errors.handle}
                </motion.p>
              ) : null}
            </div>
          </motion.div>
          
          <motion.div 
            className="space-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="text-sm font-medium text-secondary" htmlFor="description">
              Story & traction *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange('description')}
              className="input-field h-48 resize-none"
              placeholder="Share what you are building, the core thesis, and how far along you are. Include key milestones, user traction, partnerships, or funding progress."
              minLength={80}
              required
            />
            {errors.description ? (
              <motion.p 
                className="text-sm text-accent font-medium"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {errors.description}
              </motion.p>
            ) : null}
          </motion.div>
          
          <motion.div 
            className="grid gap-8 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="space-tight">
              <label className="text-sm font-medium text-secondary" htmlFor="video_url">
                Pitch video (optional)
              </label>
              <input
                id="video_url"
                name="video_url"
                value={form.video_url}
                onChange={handleChange('video_url')}
                className="input-field"
                placeholder="https://youtu.be/..."
                inputMode="url"
              />
              {errors.video_url ? (
                <motion.p 
                  className="text-sm text-accent font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.video_url}
                </motion.p>
              ) : null}
            </div>
            
            <div className="space-tight">
              <label className="text-sm font-medium text-secondary" htmlFor="site_link">
                Primary site (optional)
              </label>
              <input
                id="site_link"
                name="site_link"
                value={form.site_link}
                onChange={handleChange('site_link')}
                className="input-field"
                placeholder="https://aurora.xyz"
                inputMode="url"
              />
              {errors.site_link ? (
                <motion.p 
                  className="text-sm text-accent font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {errors.site_link}
                </motion.p>
              ) : null}
            </div>
          </motion.div>

          {/* File uploads - only show if enabled */}
          {UPLOADS_ENABLED && (
            <motion.div 
              className="grid gap-8 lg:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="space-tight">
                <label className="text-sm font-medium text-secondary" htmlFor="thumbnail">
                  Project thumbnail (optional)
                </label>
                <input
                  id="thumbnail"
                  name="thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleThumbnailChange}
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                />
                <p className="text-xs text-tertiary">
                  JPEG, PNG, or WebP. Max 5MB.
                </p>
                {uploadStatus.thumbnail === 'success' && (
                  <p className="text-xs text-emerald-400">✓ Thumbnail ready for upload</p>
                )}
              </div>
              
              <div className="space-tight">
                <label className="text-sm font-medium text-secondary" htmlFor="deck">
                  Pitch deck (optional)
                </label>
                <input
                  id="deck"
                  name="deck"
                  type="file"
                  accept="application/pdf"
                  onChange={handleDeckChange}
                  className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
                />
                <p className="text-xs text-tertiary">
                  PDF format. Max 10MB.
                </p>
                {uploadStatus.deck === 'success' && (
                  <p className="text-xs text-emerald-400">✓ Deck ready for upload</p>
                )}
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex-1">
              {status.state === 'error' ? (
                <motion.p 
                  className="text-sm text-accent font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {status.message}
                </motion.p>
              ) : null}
              {status.state === 'success' ? (
                <motion.p 
                  className="text-sm text-emerald-400 font-medium"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {status.message}
                </motion.p>
              ) : null}
            </div>
            
            <motion.button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
              whileHover={{ scale: isSaving ? 1 : 1.01 }}
              whileTap={{ scale: isSaving ? 1 : 0.99 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {isSaving ? (
                <>
                  <motion.div
                    className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Sending…
                </>
              ) : (
                'Submit for review'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </Shell>
  )
}

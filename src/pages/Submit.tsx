import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Shell } from '../components/Shell'
import { supabase } from '../lib/supabase'

type SubmitFormState = {
  name: string
  handle: string
  description: string
  video_url: string
  site_link: string
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
}

export function Submit() {
  const [form, setForm] = useState<SubmitFormState>(initialState)
  const [status, setStatus] = useState<SubmitStatus>({ state: 'idle' })
  const [errors, setErrors] = useState<FieldErrors>({})

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validation = validate(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) {
      return
    }

    setStatus({ state: 'saving' })

    const { error } = await supabase.from('founders').insert({
      name: form.name.trim(),
      handle: normalizedHandle,
      description: form.description.trim(),
      video_url: form.video_url.trim() || null,
      site_link: form.site_link.trim() || null,
    })

    if (error) {
      setStatus({ state: 'error', message: error.message })
      return
    }

    setStatus({
      state: 'success',
      message: 'Submission received. We will review and publish once approved.',
    })
    setForm(initialState)
  }

  const isSaving = status.state === 'saving'

  return (
    <Shell
      title="Submit your founder profile"
      description="Stand up your presence on Edens Gates. Share context, media, and why the Magic Eden community should back you."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="name">
              Founder or project name *
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange('name')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-egPink focus:outline-none"
              placeholder="Aurora Labs"
              required
            />
            {errors.name ? <p className="text-sm text-egPink">{errors.name}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="handle">
              Public handle *
            </label>
            <input
              id="handle"
              name="handle"
              value={form.handle}
              onChange={handleChange('handle')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-egPink focus:outline-none"
              placeholder="@aurora_xyz"
              required
            />
            {normalizedHandle ? (
              <p className="text-xs text-white/40">Stored as {normalizedHandle}</p>
            ) : null}
            {errors.handle ? <p className="text-sm text-egPink">{errors.handle}</p> : null}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-white/70" htmlFor="description">
            Story & traction *
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange('description')}
            className="h-40 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-egPink focus:outline-none"
            placeholder="Share what you are building, the core thesis, and how far along you are."
            minLength={80}
            required
          />
          {errors.description ? <p className="text-sm text-egPink">{errors.description}</p> : null}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="video_url">
              Pitch video (optional)
            </label>
            <input
              id="video_url"
              name="video_url"
              value={form.video_url}
              onChange={handleChange('video_url')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-egPink focus:outline-none"
              placeholder="https://youtu.be/..."
              inputMode="url"
            />
            {errors.video_url ? <p className="text-sm text-egPink">{errors.video_url}</p> : null}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-white/70" htmlFor="site_link">
              Primary site (optional)
            </label>
            <input
              id="site_link"
              name="site_link"
              value={form.site_link}
              onChange={handleChange('site_link')}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-egPink focus:outline-none"
              placeholder="https://aurora.xyz"
              inputMode="url"
            />
            {errors.site_link ? <p className="text-sm text-egPink">{errors.site_link}</p> : null}
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {status.state === 'error' ? (
            <p className="text-sm text-egPink">{status.message}</p>
          ) : null}
          {status.state === 'success' ? (
            <p className="text-sm text-emerald-300">{status.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center rounded-full bg-eg-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          >
            {isSaving ? 'Sending…' : 'Submit for review'}
          </button>
        </div>
      </form>
    </Shell>
  )
}

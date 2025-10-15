export type FounderStatus = 'pending' | 'approved' | 'rejected'

export type Founder = {
  id: string
  name: string
  handle: string | null
  description: string | null
  video_url: string | null
  site_link: string | null
  status: FounderStatus
  is_active: boolean
  created_at: string
}

export type Vote = {
  id: number
  founder_id: string
  wallet: string | null
  ip_hash: string | null
  created_at: string
}

export type Winner = {
  id: number
  founder_id: string
  week_number: number
  created_at: string
}

export type FounderWithVotes = Founder & {
  vote_count: number
}

export type WinnerWithFounder = Winner & {
  founders: Founder
}

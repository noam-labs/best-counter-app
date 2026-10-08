import type { SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

export type Prize = { id: string; label: string; cost: number }

export function usePrizes(client: SupabaseClient) {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    client
      .from('prize')
      .select('id, label, cost')
      .order('sort_order')
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setPrizes(data as Prize[])
      })

    return () => {
      cancelled = true
    }
  }, [client])

  return { prizes, error }
}

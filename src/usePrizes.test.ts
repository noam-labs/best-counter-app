import type { SupabaseClient } from '@supabase/supabase-js'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePrizes } from './usePrizes'

function mockClient(result: { data: unknown; error: { message: string } | null }) {
  return {
    from: () => ({ select: () => ({ order: () => Promise.resolve(result) }) }),
  } as unknown as SupabaseClient
}

describe('usePrizes', () => {
  it('loads prizes', async () => {
    const prizes = [
      { id: 'vaisselle', label: 'Débarrasse la vaisselle', cost: 30 },
      { id: 'repas', label: 'Fais à manger', cost: 100 },
    ]
    const { result } = renderHook(() => usePrizes(mockClient({ data: prizes, error: null })))
    await waitFor(() => expect(result.current.prizes).toEqual(prizes))
  })

  it('surfaces errors', async () => {
    const { result } = renderHook(() => usePrizes(mockClient({ data: null, error: { message: 'boom' } })))
    await waitFor(() => expect(result.current.error).toBe('boom'))
  })
})

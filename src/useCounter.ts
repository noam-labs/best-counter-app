import type { SupabaseClient } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'

export const COUNTER_ID = 'family'

type CounterRow = { id: string; value: number }

export function useCounter(client: SupabaseClient, counterId = COUNTER_ID) {
  const [value, setValue] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    client
      .from('counter')
      .select('id, value')
      .eq('id', counterId)
      .single<CounterRow>()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setValue(Number(data.value))
      })

    const channel = client
      .channel(`counter:${counterId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'counter', filter: `id=eq.${counterId}` },
        (payload) => setValue(Number((payload.new as CounterRow).value)),
      )
      .subscribe()

    return () => {
      cancelled = true
      client.removeChannel(channel)
    }
  }, [client, counterId])

  const bump = useCallback(
    async (delta: 1 | -1) => {
      setValue((v) => (v === null ? v : Math.max(v + delta, 0)))
      const { data, error } = await client.rpc('bump_counter', { counter_id: counterId, delta })
      if (error) {
        setError(error.message)
        return
      }
      setError(null)
      if (data !== null) setValue(Number(data))
    },
    [client, counterId],
  )

  const claim = useCallback(
    async (prizeId: string) => {
      const { data, error } = await client.rpc('claim_prize', { counter_id: counterId, prize_id: prizeId })
      if (error) {
        setError(error.message)
        return false
      }
      if (data === null) {
        setError('Pas assez de points pour ce lot')
        return false
      }
      setError(null)
      setValue(Number(data))
      return true
    },
    [client, counterId],
  )

  return { value, error, increment: () => bump(1), decrement: () => bump(-1), claim }
}

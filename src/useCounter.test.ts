import type { SupabaseClient } from '@supabase/supabase-js'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCounter } from './useCounter'

function mockClient(initial: number, rpcResult: { data: number | null; error: { message: string } | null }) {
  let onUpdate: (payload: { new: { id: string; value: number } }) => void = () => {}
  const channel = {
    on: vi.fn((_event, _filter, cb) => {
      onUpdate = cb
      return channel
    }),
    subscribe: vi.fn(() => channel),
  }
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({ single: () => Promise.resolve({ data: { id: 'family', value: initial }, error: null }) }),
      }),
    }),
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(),
    rpc: vi.fn(() => Promise.resolve(rpcResult)),
  }
  return { client: client as unknown as SupabaseClient, raw: client, push: (value: number) => onUpdate({ new: { id: 'family', value } }) }
}

describe('useCounter', () => {
  it('loads the initial value', async () => {
    const { client } = mockClient(7, { data: 8, error: null })
    const { result } = renderHook(() => useCounter(client))
    await waitFor(() => expect(result.current.value).toBe(7))
  })

  it('increments via the bump_counter RPC and takes the server value', async () => {
    const { client, raw } = mockClient(7, { data: 42, error: null })
    const { result } = renderHook(() => useCounter(client))
    await waitFor(() => expect(result.current.value).toBe(7))

    await act(() => result.current.increment())

    expect(raw.rpc).toHaveBeenCalledWith('bump_counter', { counter_id: 'family', delta: 1 })
    expect(result.current.value).toBe(42)
  })

  it('never shows a negative value on undo', async () => {
    const { client } = mockClient(0, { data: 0, error: null })
    const { result } = renderHook(() => useCounter(client))
    await waitFor(() => expect(result.current.value).toBe(0))

    await act(() => result.current.decrement())

    expect(result.current.value).toBe(0)
  })

  it('applies realtime updates from other players', async () => {
    const { client, push } = mockClient(3, { data: null, error: null })
    const { result } = renderHook(() => useCounter(client))
    await waitFor(() => expect(result.current.value).toBe(3))

    act(() => push(5))

    expect(result.current.value).toBe(5)
  })

  it('surfaces RPC errors', async () => {
    const { client } = mockClient(3, { data: null, error: { message: 'boom' } })
    const { result } = renderHook(() => useCounter(client))
    await waitFor(() => expect(result.current.value).toBe(3))

    await act(() => result.current.increment())

    expect(result.current.error).toBe('boom')
  })

  it('unsubscribes on unmount', async () => {
    const { client, raw } = mockClient(3, { data: null, error: null })
    const { unmount } = renderHook(() => useCounter(client))
    unmount()
    expect(raw.removeChannel).toHaveBeenCalledOnce()
  })
})

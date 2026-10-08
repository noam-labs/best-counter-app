import { useState } from 'react'
import { supabase } from './lib/supabase'
import { useCounter } from './useCounter'
import { usePrizes } from './usePrizes'

export default function App() {
  const { value, error, increment, decrement, claim } = useCounter(supabase)
  const { prizes, error: prizesError } = usePrizes(supabase)
  const [prizeId, setPrizeId] = useState('')
  const [won, setWon] = useState<string | null>(null)

  const prize = prizes.find((p) => p.id === prizeId) ?? prizes[0]
  const canClaim = prize !== undefined && value !== null && value >= prize.cost

  async function handleClaim() {
    if (!prize) return
    setWon(null)
    if (await claim(prize.id)) setWon(prize.label)
  }

  return (
    <main className="app">
      <h1>Ni non ni non</h1>
      <p className="subtitle">Quelqu’un a commencé une phrase par « non » sans raison ?</p>

      <output className="count" aria-live="polite" aria-label="Compteur de non">
        {value ?? '…'}
      </output>

      <button className="bump" onClick={increment} disabled={value === null}>
        NON ! +1
      </button>
      <button className="undo" onClick={decrement} disabled={!value}>
        Oups, annuler −1
      </button>

      {prizes.length > 0 && (
        <section className="prizes">
          <h2>Lots à gagner</h2>
          <label htmlFor="prize">Choisir un lot</label>
          <select id="prize" value={prize?.id} onChange={(e) => setPrizeId(e.target.value)}>
            {prizes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} — {p.cost} points
              </option>
            ))}
          </select>
          {prize && value !== null && (
            <progress max={prize.cost} value={Math.min(value, prize.cost)} aria-label="Progression vers le lot" />
          )}
          <button className="claim" onClick={handleClaim} disabled={!canClaim}>
            {canClaim || !prize || value === null
              ? 'Réclamer le lot'
              : `Encore ${prize.cost - value} points`}
          </button>
          {won && <p className="won">🎉 Lot gagné : {won} !</p>}
        </section>
      )}

      {(error || prizesError) && <p className="error">Erreur : {error ?? prizesError}</p>}
    </main>
  )
}

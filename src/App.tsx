import { supabase } from './lib/supabase'
import { useCounter } from './useCounter'

export default function App() {
  const { value, error, increment, decrement } = useCounter(supabase)

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

      {error && <p className="error">Erreur : {error}</p>}
    </main>
  )
}

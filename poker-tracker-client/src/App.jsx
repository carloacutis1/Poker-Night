import { useEffect, useState } from 'react'
import {
  createSession,
  deleteSession,
  listSessions,
  updateSession,
} from './api/sessions.js'
import './App.css'

const profitOf = (s) => s.cashOut - s.buyIn - s.addOn

const money = (n) =>
  (n < 0 ? '-' : '') +
  '$' +
  Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })

const signedMoney = (n) => (n > 0 ? '+' : '') + money(n)

const profitClass = (n) => (n > 0 ? 'win' : n < 0 ? 'loss' : '')

function today() {
  const now = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Two pages, switched with state: the sessions list and the add/edit form.
function App() {
  const [page, setPage] = useState({ name: 'list' })

  if (page.name === 'form') {
    return (
      <SessionFormPage
        session={page.session}
        onDone={() => setPage({ name: 'list' })}
      />
    )
  }

  return (
    <SessionsPage
      onNew={() => setPage({ name: 'form', session: null })}
      onEdit={(session) => setPage({ name: 'form', session })}
    />
  )
}

function SessionsPage({ onNew, onEdit }) {
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState('')

  function load() {
    listSessions()
      .then(setSessions)
      .catch((err) => setError('Could not load sessions: ' + err.message))
  }

  useEffect(load, [])

  async function handleDelete(session) {
    if (!confirm(`Delete the ${session.date} session at ${session.location}?`)) return
    try {
      await deleteSession(session.id)
      load()
    } catch (err) {
      setError('Could not delete: ' + err.message)
    }
  }

  const rows = [...(sessions ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const invested = rows.reduce((sum, s) => sum + s.buyIn + s.addOn, 0)
  const cashedOut = rows.reduce((sum, s) => sum + s.cashOut, 0)
  const net = cashedOut - invested

  return (
    <div className="page">
      <header>
        <h1>Poker Tracker</h1>
        <button className="btn primary" onClick={onNew}>
          + New session
        </button>
      </header>

      <section className="stats">
        <Stat label="Sessions" value={sessions ? rows.length : '–'} />
        <Stat label="Total invested" value={sessions ? money(invested) : '–'} />
        <Stat label="Total cashed out" value={sessions ? money(cashedOut) : '–'} />
        <Stat
          label="Net profit"
          value={sessions ? signedMoney(net) : '–'}
          className={profitClass(net)}
        />
      </section>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Location</th>
              <th className="num">Buy-in</th>
              <th className="num">Add-on</th>
              <th className="num">Cash-out</th>
              <th className="num">Profit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.date}</td>
                <td>{s.location}</td>
                <td className="num">{money(s.buyIn)}</td>
                <td className="num">{money(s.addOn)}</td>
                <td className="num">{money(s.cashOut)}</td>
                <td className={'num ' + profitClass(profitOf(s))}>
                  {signedMoney(profitOf(s))}
                </td>
                <td className="actions">
                  <button className="btn small" onClick={() => onEdit(s)}>
                    Edit
                  </button>
                  <button className="btn small danger" onClick={() => handleDelete(s)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && <div className="message error">{error}</div>}
        {!error && !sessions && <div className="message">Loading…</div>}
        {!error && sessions && rows.length === 0 && (
          <div className="message">No sessions yet. Log your first one.</div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, className = '' }) {
  return (
    <div className="stat">
      <div className="label">{label}</div>
      <div className={'value ' + className}>{value}</div>
    </div>
  )
}

// session = null -> create a new session; session = object -> edit it
function SessionFormPage({ session, onDone }) {
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = {
      date: form.get('date'),
      location: form.get('location').trim(),
      buyIn: Number(form.get('buyIn')),
      addOn: Number(form.get('addOn')),
      cashOut: Number(form.get('cashOut')),
    }
    try {
      if (session) await updateSession(session.id, data)
      else await createSession(data)
      onDone()
    } catch (err) {
      setError('Could not save: ' + err.message)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this session?')) return
    try {
      await deleteSession(session.id)
      onDone()
    } catch (err) {
      setError('Could not delete: ' + err.message)
    }
  }

  return (
    <div className="page">
      <header>
        <h1>{session ? 'Edit session' : 'New session'}</h1>
        <button className="link" onClick={onDone}>
          ← All sessions
        </button>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" defaultValue={session?.date ?? today()} required />
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input id="location" name="location" type="text" maxLength={50} defaultValue={session?.location} required />
        </div>
        <div className="field">
          <label htmlFor="buyIn">Buy-in ($)</label>
          <input id="buyIn" name="buyIn" type="number" min="0" step="0.01" defaultValue={session?.buyIn} required />
        </div>
        <div className="field">
          <label htmlFor="addOn">Add-on ($)</label>
          <input id="addOn" name="addOn" type="number" min="0" step="0.01" defaultValue={session?.addOn ?? 0} required />
        </div>
        <div className="field">
          <label htmlFor="cashOut">Cash-out ($)</label>
          <input id="cashOut" name="cashOut" type="number" min="0" step="0.01" defaultValue={session?.cashOut} required />
        </div>

        {error && <div className="message error">{error}</div>}

        <div className="form-actions">
          <button className="btn primary" type="submit">
            Save
          </button>
          <button className="btn" type="button" onClick={onDone}>
            Cancel
          </button>
          {session && (
            <button className="btn danger" type="button" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default App

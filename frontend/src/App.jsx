import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { FaArrowUp, FaArrowDown, FaMinus, FaRedo, FaRegClock, FaPlay } from 'react-icons/fa'

// CardImage: renders a playing-card-like SVG. If `hidden` is true, shows a card back.
function CardImage({ value, seed = 0, hidden = false }) {
  const suits = ['♠', '♥', '♦', '♣']
  function pickSuit(val, s) {
    let key = String(val) + '|' + String(s)
    let h = 0
    for (let i = 0; i < key.length; i++) {
      h = (h << 5) - h + key.charCodeAt(i)
      h |= 0
    }
    return suits[Math.abs(h) % suits.length]
  }

  const suit = pickSuit(value ?? '', seed)
  const isRed = suit === '♥' || suit === '♦'

  if (hidden || value === '?' || value === null || value === undefined) {
    return (
      <div className="card" aria-hidden>
        <svg viewBox="0 0 200 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#0f1724" stopOpacity="1" />
              <stop offset="1" stopColor="#081827" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect x="6" y="6" rx="14" ry="14" width="188" height="268" fill="#071024" stroke="#0b1220" strokeWidth="4" />
          <g transform="translate(0,0)">
            <rect x="20" y="30" rx="8" ry="8" width="160" height="220" fill="url(#g)" stroke="#09121a" strokeWidth="2" />
            <g fill="#0ca5b6" opacity="0.12">
              <circle cx="60" cy="90" r="36" />
              <circle cx="140" cy="190" r="36" />
            </g>
            <text x="100" y="150" textAnchor="middle" fontSize="48" fill="#06b6d4" opacity="0.95" fontWeight="700">★</text>
          </g>
        </svg>
      </div>
    )
  }

  const displayRank = String(value)
  return (
    <div className="card" role="img" aria-label={`Card ${displayRank} ${suit}`}>
      <svg viewBox="0 0 200 280" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" rx="14" ry="14" width="188" height="268" fill="#fff" stroke="#ddd" strokeWidth="3" />
        <text x="24" y="46" fontSize="34" fontWeight="700" fill={isRed ? '#c0392b' : '#111'}>{displayRank}</text>
        <text x="24" y="86" fontSize="28" fill={isRed ? '#c0392b' : '#111'}>{suit}</text>
        <text x="176" y="244" fontSize="34" fontWeight="700" fill={isRed ? '#c0392b' : '#111'} textAnchor="end" transform="rotate(180 176 244)">{displayRank}</text>
        <text x="176" y="204" fontSize="28" fill={isRed ? '#c0392b' : '#111'} textAnchor="end" transform="rotate(180 176 204)">{suit}</text>
        <text x="100" y="165" fontSize="72" textAnchor="middle" fill={isRed ? '#c0392b' : '#111'} fontWeight="700">{suit}</text>
      </svg>
    </div>
  )
}

// Reward mapping by elapsed seconds (1-based). Index 1 => 1 second.
const TIME_REWARDS = {
  1: 10,
  2: 8,
  3: 7,
  4: 6,
  5: 5,
  6: 4,
  7: 3,
  8: 2,
  9: 1,
  10: 0
}

export default function App() {
  const [gameId, setGameId] = useState(null)
  const [balance, setBalance] = useState(0)
  const [firstCard, setFirstCard] = useState(null)
  const [secondCard, setSecondCard] = useState(null) // shown revealed card
  const [pendingFirst, setPendingFirst] = useState(null) // next round's first card, applied after Next Try
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Popup state for showing reward/penalty
  const [popup, setPopup] = useState({ show: false, text: '', type: '' })
  const popupTimerRef = useRef(null)

  const [secondsLeft, setSecondsLeft] = useState(10)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)

  // Start timer for a round
  function startTimer() {
    clearTimer()
    setSecondsLeft(10)
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const left = Math.max(0, 10 - elapsed)
      setSecondsLeft(left)
      if (left <= 0) {
        clearTimer()
        // auto-reveal when timer ends
        if (gameId && !pendingFirst && status === 'PLAYING') {
          handleReveal()
        }
      }
    }, 200)
  }

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function showPopup(text, type = 'win', duration = 1400) {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current)
      popupTimerRef.current = null
    }
    setPopup({ show: true, text, type })
    popupTimerRef.current = setTimeout(() => {
      setPopup({ show: false, text: '', type: '' })
      popupTimerRef.current = null
    }, duration)
  }

  // Start a new game
  const startGame = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await axios.post('/api/game/start')
      const data = resp.data
      setGameId(data.gameId)
      setBalance(data.balance)
      setFirstCard(data.firstCard)
      setSecondCard(null)
      setPendingFirst(null)
      setStatus(data.status)
      setResult(null)
      startTimer()
    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  // Compute timeTaken in whole seconds, 1..10
  function computeTimeTaken() {
    if (!startTimeRef.current) return 10
    const elapsedMs = Date.now() - startTimeRef.current
    let secs = Math.floor(elapsedMs / 1000) + 1
    if (secs < 1) secs = 1
    if (secs > 10) secs = 10
    return secs
  }

  // Handle a guess click
  const handleGuess = async (guessType) => {
    if (!gameId || loading || status === 'GAME_OVER' || pendingFirst) return
    setLoading(true)
    clearTimer()
    setError(null)
    try {
      const timeTaken = computeTimeTaken()
      const resp = await axios.post(`/api/game/${gameId}/guess`, null, { params: { guess: guessType, time: timeTaken } })
      const data = resp.data
      // Display the revealed card
      setSecondCard(data.revealedCard || data.secondCard)
      // Do not immediately set firstCard; store pending next first
      setPendingFirst(data.firstCard)
      setResult(data.result)
      setBalance(data.balance)
      setStatus(data.status)

      // Show popup: if win -> +R{reward}, else -> -R1
      if (data.result === 'WIN') {
        const reward = TIME_REWARDS[timeTaken] ?? 0
        if (reward > 0) showPopup(`+R${reward}`, 'win')
      } else if (data.result === 'LOSE') {
        showPopup(`-R1`, 'lose')
      }

    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  // Handle reveal when timer expires
  const handleReveal = async () => {
    if (!gameId || loading || pendingFirst) return
    setLoading(true)
    setError(null)
    try {
      const resp = await axios.post(`/api/game/${gameId}/reveal`)
      const data = resp.data
      setSecondCard(data.revealedCard || data.secondCard)
      setPendingFirst(data.firstCard)
      setResult(null)
      setBalance(data.balance)
      setStatus(data.status)
    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  // Apply pending next round when user clicks Next Try
  const applyNext = () => {
    if (!pendingFirst) return
    setFirstCard(pendingFirst)
    setSecondCard(null)
    setPendingFirst(null)
    setResult(null)
    setError(null)
    // start timer for new round
    startTimer()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer()
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current)
    }
  }, [])

  return (
    <div className="app-root">
      {/* Popup for results */}
      <div className={`popup ${popup.show ? 'show' : ''} ${popup.type === 'win' ? 'win' : popup.type === 'lose' ? 'lose' : ''}`}>
        {popup.text}
      </div>

      <header className="header">
        <h1>Lucky Flip</h1>
        <p className="tag">Guess if the next card is higher, lower or equal</p>
      </header>

      <main className="container">
        <section className="panel">
          <div className="balance">Balance: <strong>R{balance}</strong></div>

          <div className="cards-row">
            <div className="column">
              <h3>Current</h3>
              <CardImage value={firstCard ?? '--'} seed={gameId ?? 0} />
            </div>

            <div className="column">
              <h3>Next (revealed)</h3>
              <CardImage value={secondCard ?? '?'} seed={(gameId ?? 0) + 1} hidden={secondCard == null} />
            </div>
          </div>

          <div className="timer-row" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginTop:16}}>
            <div className="clock"><FaRegClock /></div>
            <div style={{minWidth:140,textAlign:'center'}}>
              <div style={{fontWeight:700}}>{secondsLeft}s</div>
              <div style={{height:6,background:'#0f1724',borderRadius:6,marginTop:6}}>
                <div style={{height:6,width:`${(secondsLeft/10)*100}%`,background:'#06b6d4',borderRadius:6}} />
              </div>
            </div>
          </div>

          <div className="controls" style={{marginTop:18}}>
            <button className="btn" onClick={() => handleGuess('HIGHER')} disabled={!gameId || loading || status === 'GAME_OVER' || !!pendingFirst} aria-label="Guess Higher">
              <div className="btn-icon higher"><FaArrowUp /></div>
              <div className="btn-label">Higher</div>
            </button>
            <button className="btn" onClick={() => handleGuess('LOWER')} disabled={!gameId || loading || status === 'GAME_OVER' || !!pendingFirst} aria-label="Guess Lower">
              <div className="btn-icon lower"><FaArrowDown /></div>
              <div className="btn-label">Lower</div>
            </button>
            <button className="btn" onClick={() => handleGuess('DRAW')} disabled={!gameId || loading || status === 'GAME_OVER' || !!pendingFirst} aria-label="Guess Draw">
              <div className="btn-icon draw"><FaMinus /></div>
              <div className="btn-label">Draw</div>
            </button>
          </div>

          <div className="actions" style={{display:'flex',gap:12,justifyContent:'center',marginTop:12}}>
            <button className="start" onClick={startGame} disabled={loading}><FaPlay style={{marginRight:8}}/> Start New Game</button>
            <button className="start" onClick={applyNext} disabled={!pendingFirst || loading || status === 'GAME_OVER'} style={{background:'#475569'}}> <FaRedo /> Next Try</button>
          </div>

          {result && (
            <div className={`result ${result === 'WIN' ? 'win' : 'lose'}`}>
              {result} — Balance: R{balance}
            </div>
          )}

          {status === 'GAME_OVER' && (
            <div className="game-over">Game Over — your balance reached zero.</div>
          )}

          {error && <div className="error">{String(error)}</div>}
        </section>
      </main>

      <footer className="footer">Built with ❤️ by Limani Ndou — Lucky Flip</footer>
    </div>
  )
}

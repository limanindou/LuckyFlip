import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

const SUITS = ['♠', '♥', '♦', '♣']
const RED_SUITS = new Set(['♥', '♦'])
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
const LEGEND_REWARDS = [10, 8, 7, 6, 5, 4, 3, 2, 1, 0]

function pickSuit(rank, seed) {
  const key = `${String(rank)}|${String(seed)}`
  let hash = 0
  for (const ch of key) {
    const cp = ch.codePointAt(0) || 0
    hash = Math.trunc(hash * 31 + cp)
  }
  return SUITS[Math.abs(hash) % SUITS.length]
}

function cardValue(rank) {
  if (rank === 'A') return 1
  if (rank === 'J') return 11
  if (rank === 'Q') return 12
  if (rank === 'K') return 13
  return Number.parseInt(rank, 10)
}

function cardRewardFromSecondsLeft(secondsLeft) {
  const timeTaken = Math.max(1, Math.min(10, 11 - secondsLeft))
  return TIME_REWARDS[timeTaken] ?? 0
}

function PlayingCard({ rank, suit, hidden }) {
  if (hidden || !rank || !suit) {
    return (
      <div className="card-back" aria-hidden="true">
        <div className="card-back-inner">
          <div className="card-back-emblem">✦</div>
        </div>
      </div>
    )
  }

  const suitClass = RED_SUITS.has(suit) ? 'red-suit' : 'black-suit'

  return (
    <div className={`playing-card ${suitClass}`} role="img" aria-label={`Card ${rank}${suit}`}>
      <div className="card-corner">
        <span className="card-rank">{rank}</span>
        <span className="card-suit-small">{suit}</span>
      </div>
      <span className="card-suit-center">{suit}</span>
      <div className="card-corner card-corner-br">
        <span className="card-rank">{rank}</span>
        <span className="card-suit-small">{suit}</span>
      </div>
    </div>
  )
}

PlayingCard.propTypes = {
  rank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  suit: PropTypes.string,
  hidden: PropTypes.bool
}

PlayingCard.defaultProps = {
  rank: null,
  suit: null,
  hidden: false
}

export default function App() {
  const [gameId, setGameId] = useState(null)
  const [balance, setBalance] = useState(0)
  const [firstCard, setFirstCard] = useState(null)
  const [secondCard, setSecondCard] = useState(null)
  const [pendingFirst, setPendingFirst] = useState(null)
  const [status, setStatus] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(10)
  const [streak, setStreak] = useState(0)
  const [winCount, setWinCount] = useState(0)
  const [drawCount, setDrawCount] = useState(0)
  const [lossCount, setLossCount] = useState(0)
  const [flashClass, setFlashClass] = useState('')
  const [resultDetail, setResultDetail] = useState('')

  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const flashTimerRef = useRef(null)

  const guessed = Boolean(pendingFirst)
  const currentSuit = firstCard ? pickSuit(firstCard, gameId ?? 0) : null
  const nextSuit = secondCard ? pickSuit(secondCard, (gameId ?? 0) + 1) : null
  const rewardHint = guessed ? '' : `+R${cardRewardFromSecondsLeft(secondsLeft)}`

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function clearFlashTimer() {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current)
      flashTimerRef.current = null
    }
  }

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
        if (gameId && !pendingFirst && status === 'PLAYING') {
          handleReveal()
        }
      }
    }, 200)
  }

  function computeTimeTaken() {
    if (!startTimeRef.current) return 10
    const elapsedMs = Date.now() - startTimeRef.current
    let secs = Math.floor(elapsedMs / 1000) + 1
    if (secs < 1) secs = 1
    if (secs > 10) secs = 10
    return secs
  }

  function playFlash(type) {
    clearFlashTimer()
    setFlashClass(type === 'WIN' ? 'flash-win' : 'flash-lose')
    flashTimerRef.current = setTimeout(() => {
      setFlashClass('')
      flashTimerRef.current = null
    }, 620)
  }

  const startGame = async () => {
    setLoading(true)
    setError(null)
    clearFlashTimer()
    setFlashClass('')

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
      setResultDetail('')
      setStreak(0)
      setWinCount(0)
      setDrawCount(0)
      setLossCount(0)
      setSecondsLeft(10)
      startTimer()
    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const handleGuess = async (guessType) => {
    if (!gameId || loading || status === 'GAME_OVER' || pendingFirst) return

    setLoading(true)
    clearTimer()
    setError(null)

    try {
      const timeTaken = computeTimeTaken()
      const resp = await axios.post(`/api/game/${gameId}/guess`, null, {
        params: { guess: guessType, time: timeTaken }
      })
      const data = resp.data

      setSecondCard(data.revealedCard || data.secondCard)
      setPendingFirst(data.firstCard)
      setResult(data.result)
      setBalance(data.balance)
      setStatus(data.status)

      if (data.result === 'WIN') {
        const reward = TIME_REWARDS[timeTaken] ?? 0
        setResultDetail(`+R${reward} · ${guessType}`)
      } else {
        setResultDetail(`-R1 · ${guessType}`)
      }

      if (data.result === 'WIN') {
        setStreak((prev) => prev + 1)
        if (guessType === 'DRAW') {
          setDrawCount((prev) => prev + 1)
        } else {
          setWinCount((prev) => prev + 1)
        }
        playFlash('WIN')
      } else if (data.result === 'LOSE') {
        setStreak(0)
        setLossCount((prev) => prev + 1)
        playFlash('LOSE')
      }
    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

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
      setResultDetail('')
      setBalance(data.balance)
      setStatus(data.status)
    } catch (e) {
      setError(String(e?.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  const applyNext = () => {
    if (!pendingFirst || status === 'GAME_OVER') return
    setFirstCard(pendingFirst)
    setSecondCard(null)
    setPendingFirst(null)
    setResult(null)
    setResultDetail('')
    setError(null)
    setFlashClass('')
    startTimer()
  }

  useEffect(() => {
    startGame()
    return () => {
      clearTimer()
      clearFlashTimer()
    }
  }, [])

  let compareArrow = null
  if (guessed && firstCard && secondCard) {
    const currentValue = cardValue(firstCard)
    const nextValue = cardValue(secondCard)
    if (nextValue > currentValue) compareArrow = <span className="arr-up">↑</span>
    else if (nextValue < currentValue) compareArrow = <span className="arr-down">↓</span>
    else compareArrow = <span className="arr-eq">=</span>
  }

  const showGameOver = status === 'GAME_OVER'
  const timerWarn = !guessed && secondsLeft <= 3

  return (
    <div className="page-wrap">
      <div className={`shell ${flashClass}`} id="shell">
        <div className="header">
          <div className="logo">
            <span className="logo-suits">♠♥</span>
            <span className="logo-text">Lucky<em>Flip</em></span>
            <span className="logo-suits">♦♣</span>
          </div>
          <div className="header-right">
            <span className="game-id">GAME #{gameId ?? '----'}</span>
            {streak > 1 ? <span className="streak-badge">{`🔥 ${streak} streak`}</span> : null}
          </div>
        </div>

        <div className="suit-divider">
          <div className="suit-divider-line" />
          <div className="suit-divider-suits">♠ ♥ ♦ ♣</div>
          <div className="suit-divider-line" />
        </div>

        <div className="balance-row">
          <div className="balance-pill">
            <div className="balance-coin">R</div>
            <span className="balance-amount">{Number(balance || 0).toFixed(2)}</span>
          </div>
          {winCount > 0 ? <span className="stat-pill stat-wins">{`${winCount}W`}</span> : null}
          {drawCount > 0 ? <span className="stat-pill stat-draws">{`${drawCount}D`}</span> : null}
          {lossCount > 0 ? <span className="stat-pill stat-losses">{`${lossCount}L`}</span> : null}
        </div>

        <div className="arena">
          <div className="card-slot">
            <div className="slot-label">CURRENT</div>
            <PlayingCard rank={firstCard} suit={currentSuit} hidden={!firstCard} />
          </div>

          <div className="vs-column">
            <div className="vs-ring">VS</div>
            <div className="compare-arrow">{compareArrow}</div>
          </div>

          <div className="card-slot">
            <div className="slot-label">NEXT</div>
            <PlayingCard rank={secondCard} suit={nextSuit} hidden={!guessed} />
          </div>
        </div>

        <div className="timer-block">
          <div className={`timer-label ${timerWarn ? 'warn' : ''}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 1.5" />
            </svg>
            <span>{guessed ? '—' : `${secondsLeft}s`}</span>
          </div>
          <div className="timer-track">
            <div
              className={`timer-fill ${timerWarn ? 'warn' : ''}`}
              style={{ width: guessed ? '0%' : `${(secondsLeft / 10) * 100}%` }}
            />
          </div>
        </div>

        {result ? (
          <div className={`result-banner ${result === 'WIN' ? 'win' : 'lose'}`}>
            <span className="result-icon">{result === 'WIN' ? '★' : '✕'}</span>
            <span>{result}</span>
            <span className="result-sep">·</span>
            <span className="result-detail">{resultDetail}</span>
          </div>
        ) : null}

        {showGameOver ? <div className="game-over">GAME OVER · Balance reached zero</div> : null}

        <div className="guess-buttons">
          <button
            className="btn btn-higher"
            onClick={() => handleGuess('HIGHER')}
            disabled={!gameId || loading || guessed || showGameOver}
          >
            <span className="btn-arrow">↑</span>
            <span className="btn-label">Higher</span>
            <span className="btn-reward">{rewardHint}</span>
          </button>

          <button
            className="btn btn-draw"
            onClick={() => handleGuess('DRAW')}
            disabled={!gameId || loading || guessed || showGameOver}
          >
            <span className="btn-arrow">=</span>
            <span className="btn-label">Draw</span>
            <span className="btn-reward">{rewardHint}</span>
          </button>

          <button
            className="btn btn-lower"
            onClick={() => handleGuess('LOWER')}
            disabled={!gameId || loading || guessed || showGameOver}
          >
            <span className="btn-arrow">↓</span>
            <span className="btn-label">Lower</span>
            <span className="btn-reward">{rewardHint}</span>
          </button>
        </div>

        <div className="secondary-grid">
          <button className="btn-ghost" onClick={startGame} disabled={loading}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            New Game
          </button>

          <button className="btn-ghost" onClick={applyNext} disabled={!pendingFirst || loading || showGameOver}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3.2-6.9" />
              <path d="M21 3v6h-6" />
            </svg>
            Next Try
          </button>
        </div>

        <div className="legend">
          <span className="legend-label">SPEED BONUS</span>
          <div className="legend-bars">
            {LEGEND_REWARDS.map((reward, idx) => {
              const elapsed = 10 - secondsLeft
              const active = !guessed && elapsed === idx
              return (
                <div key={`pip-${idx}`} className={`legend-pip ${active ? 'active' : ''}`}>
                  <div className="legend-bar" style={{ height: `${Math.max(3, reward * 2.8)}px` }} />
                  <div className="legend-val">{reward > 0 ? `R${reward}` : ''}</div>
                </div>
              )
            })}
          </div>
        </div>

        {error ? <div className="error">{String(error)}</div> : null}
      </div>
    </div>
  )
}

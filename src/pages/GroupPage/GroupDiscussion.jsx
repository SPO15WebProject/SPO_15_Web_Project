import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './GroupDiscussion.css'

const PAGE_SIZE = 50
const POLL_INTERVAL_MS = 10000
const MAX_LENGTH = 2000

// pieni apufunktio, joka heittää backendin virheviestin poikkeuksena
async function request(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
        throw new Error(data.error || 'Pyyntö epäonnistui')
    }
    return data
}

// yhdistää uudet viestit olemassa oleviin ja järjestää vanhimmasta uusimpaan
// prune: poistaa listalta viestit, jotka eivät enää ole haetulla välillä (poistetut)
function mergeMessages(current, incoming, prune = false) {
    let base = current

    if (prune) {
        const incomingIds = new Set(incoming.map((m) => m.messageid))
        // jos haettu sivu ei ollut täysi, saatiin kaikki viestit
        const floor = incoming.length < PAGE_SIZE
            ? 0
            : Math.min(...incoming.map((m) => m.messageid))

        base = current.filter(
            (m) => m.messageid < floor || incomingIds.has(m.messageid)
        )
    }

    const byId = new Map(base.map((m) => [m.messageid, m]))
    incoming.forEach((m) => byId.set(m.messageid, m))

    return [...byId.values()].sort((a, b) => a.messageid - b.messageid)
}

function formatTime(value) {
    return new Date(value).toLocaleString('fi-FI', {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function GroupDiscussion({ groupId, isAdmin }) {
    const { user } = useAuth()

    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [hasMore, setHasMore] = useState(false)
    const [loadingOlder, setLoadingOlder] = useState(false)

    const [draft, setDraft] = useState('')
    const [sending, setSending] = useState(false)
    const [sendError, setSendError] = useState('')

    const listRef = useRef(null)
    // kasvatetaan, kun lista halutaan vierittää alas
    const [scrollTick, setScrollTick] = useState(0)

    // haetaan uusimmat viestit (backend palauttaa uusimmat ensin)
    const loadLatest = useCallback(async () => {
        const latest = await request(
            `/api/db/GetGroupMessages/${groupId}?limit=${PAGE_SIZE}`
        )
        setMessages((current) => mergeMessages(current, latest, true))
        return latest
    }, [groupId])

    // ensimmäinen lataus
    useEffect(() => {
        let cancelled = false

        loadLatest()
            .then((latest) => {
                if (cancelled) return
                setHasMore(latest.length === PAGE_SIZE)
                setScrollTick((t) => t + 1)
            })
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false))

        return () => { cancelled = true }
    }, [loadLatest])

    // uusien viestien tarkistus taustalla
    useEffect(() => {
        const timer = setInterval(() => {
            if (document.hidden) return
            loadLatest().catch(() => {
                // hiljainen virhe, seuraava kierros yrittää uudelleen
            })
        }, POLL_INTERVAL_MS)

        return () => clearInterval(timer)
    }, [loadLatest])

    // vieritys alas ensimmäisen latauksen ja lähetyksen jälkeen
    useEffect(() => {
        const el = listRef.current
        if (el) el.scrollTop = el.scrollHeight
    }, [scrollTick])

    const loadOlder = async () => {
        if (messages.length === 0) return
        setLoadingOlder(true)

        try {
            const oldestId = messages[0].messageid
            const older = await request(
                `/api/db/GetGroupMessages/${groupId}?limit=${PAGE_SIZE}&before=${oldestId}`
            )
            setMessages((current) => mergeMessages(current, older))
            setHasMore(older.length === PAGE_SIZE)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoadingOlder(false)
        }
    }

    const sendMessage = async () => {
        const content = draft.trim()
        if (!content || sending) return

        setSending(true)
        setSendError('')

        try {
            const created = await request('/api/db/CreateGroupMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId, content })
            })

            // vastauksessa ei ole nimimerkkiä, lisätään se kirjautuneelta käyttäjältä
            setMessages((current) =>
                mergeMessages(current, [{ ...created, nickname: user?.nickname }])
            )
            setDraft('')
            setScrollTick((t) => t + 1)
        } catch (err) {
            setSendError(err.message)
        } finally {
            setSending(false)
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        sendMessage()
    }

    // Enter lähettää, Shift+Enter tekee rivinvaihdon
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    const deleteMessage = async (messageId) => {
        if (!window.confirm('Poistetaanko viesti?')) return

        try {
            await request(`/api/db/DeleteGroupMessage/${messageId}`, {
                method: 'DELETE'
            })
            setMessages((current) =>
                current.filter((m) => m.messageid !== messageId)
            )
        } catch (err) {
            setError(err.message)
        }
    }

    if (loading) {
        return <p role="status">Ladataan keskustelua...</p>
    }

    return (
        <section className="group-panel group-discussion">
            <h2>Keskustelu</h2>

            {error && <p role="alert" className="discussion-error">{error}</p>}

            <div
                className="discussion-messages"
                ref={listRef}
                aria-live="polite"
            >
                {hasMore && (
                    <button
                        type="button"
                        className="discussion-older"
                        onClick={loadOlder}
                        disabled={loadingOlder}
                    >
                        {loadingOlder ? 'Ladataan...' : 'Lataa vanhempia viestejä'}
                    </button>
                )}

                {messages.length === 0 && (
                    <p>Ei vielä viestejä. Aloita keskustelu!</p>
                )}

                <ul className="discussion-list">
                    {messages.map((message) => {
                        const isOwn = String(message.userid) === String(user?.userid)
                        const canDelete = isOwn || isAdmin

                        return (
                            <li
                                key={message.messageid}
                                className={
                                    isOwn
                                        ? 'discussion-message discussion-message-own'
                                        : 'discussion-message'
                                }
                            >
                                <div className="discussion-message-meta">
                                    <strong>{message.nickname ?? 'Tuntematon'}</strong>
                                    <time dateTime={message.createdat}>
                                        {formatTime(message.createdat)}
                                    </time>

                                    {canDelete && (
                                        <button
                                            type="button"
                                            className="discussion-delete"
                                            onClick={() => deleteMessage(message.messageid)}
                                        >
                                            Poista
                                        </button>
                                    )}
                                </div>

                                <p className="discussion-text">{message.content}</p>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <form className="discussion-form" onSubmit={handleSubmit}>
                <label htmlFor="discussion-input" className="discussion-label">
                    Uusi viesti
                </label>

                <textarea
                    id="discussion-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={MAX_LENGTH}
                    rows={3}
                    placeholder="Kirjoita viesti..."
                />

                <div className="discussion-form-footer">
                    <span className="discussion-counter">
                        {draft.length}/{MAX_LENGTH}
                    </span>

                    <button type="submit" disabled={sending || !draft.trim()}>
                        {sending ? 'Lähetetään...' : 'Lähetä'}
                    </button>
                </div>

                {sendError && (
                    <p role="alert" className="discussion-error">{sendError}</p>
                )}
            </form>
        </section>
    )
}

export default GroupDiscussion
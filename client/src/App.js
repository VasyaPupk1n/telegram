import React, { useState } from 'react'

export default function App() {
    const [score, setScore] = useState(0)

    const submitScore = () => {
        const params = new URLSearchParams(window.location.search)
        const userId = Number(params.get('user_id'))
        const chat_id = Number(params.get('chat_id'))
        fetch('/submit-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, score, chat_id }),
        })
            .then(res => res.json())
            .then(() => alert('Очки отправлены на сервер'))
            .catch(() => alert('Ошибка отправки очков'))
    };

    return (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
            <h1>Telegram Game на React</h1>
            <p>Текущий счет: {score}</p>
            <button onClick={() => setScore(score + 10)}>Увеличить счет на 10</button>
            <br /><br />
            <button onClick={submitScore}>Отправить очки в Telegram</button>
        </div>
    )
}

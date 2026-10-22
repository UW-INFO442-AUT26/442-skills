import { useState } from 'react'
import './App.css'

// ---------------------------------------------------------------------
// INFO 442, Boolean && rendering
//
// Read the three TODOs before you change anything. Each one names a
// problem and the idea behind it. Run `npm run dev`, look at the page,
// and fix one at a time.
// ---------------------------------------------------------------------

// The card. There is nothing to change in here. It is the thing you
// learn to show and hide.
function Card() {
  return (
    <article className="card">
      <h2 className="card__title">Study space hours</h2>
      <p className="card__body">
        The iSchool lab is open 9 to 5. This is the card your button will
        show and hide.
      </p>
    </article>
  )
}

function App() {
  // TODO 1 of 3
  // This is a counter. It goes up, and it never comes back down. Click the
  // button twice and watch it stay dark.
  // Make it a boolean instead. A boolean is a value that is either true or
  // false, here meaning the card is open or closed. The button flips it.
  //   const [showCard, setShowCard] = useState(true)
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Boolean && rendering</h1>
        <p className="header__subtitle">
          One button and one card. Click the button to show the card. Click
          again to hide it.
        </p>
      </header>

      <button
        type="button"
        className={`toggle${count > 0 ? ' toggle--on' : ''}`}
        onClick={() => setCount((n) => n + 1)}
      >
        Toggle the card
      </button>

      {/* TODO 2 of 3
          The card shows every time, because nothing is guarding it. Put a
          condition in front of it with &&, so it shows only while the card
          is open. The box at the bottom of the page shows the shape. */}
      <Card />

      {/* TODO 3 of 3
          Look at the page, not only the code. When the card is hidden,
          nothing should be left where it was. If a lone 0 is there instead,
          your condition is a number. React hides false, null, and nothing
          at all. It shows 0, because 0 is a value it can display. */}
      <p className="hint">
        <span className="hint__label">Pattern</span>
        <code className="hint__code">{'{isOpen && <Card />}'}</code>
      </p>
    </div>
  )
}

export default App

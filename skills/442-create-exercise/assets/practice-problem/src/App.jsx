import { useState } from 'react'
import './App.css'

// ---------------------------------------------------------------------
// INFO 442, Boolean && rendering
//
// Read these three TODOs before you change anything. Each one names a
// problem and the idea behind it. Run `npm run dev`, watch the page, and
// fix them one at a time.
// ---------------------------------------------------------------------

// The card. Nothing to change in here: it is the thing you learn to show
// and hide.
function Card() {
  return (
    <article className="card">
      <p className="card__label">Card</p>
      <h2 className="card__title">Study space hours</h2>
      <p className="card__body">
        The iSchool lab is open 9 to 5. This is the card your button should
        show and hide.
      </p>
    </article>
  )
}

function App() {
  // TODO 1 of 3
  // This is a counter, so it can only ever count up. Click the button twice
  // and watch it stay dark: once it is above 0 it never comes back down.
  // Replace it with a boolean that says whether the card is open, and let
  // the button flip it. A boolean cannot be 0, which is the point of TODO 3.
  //   const [showCard, setShowCard] = useState(true)
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <header className="header">
        <p className="badge">INFO 442 · Lab practice</p>
        <h1 className="header__title">Boolean && rendering</h1>
        <p className="header__subtitle">
          One button, one card. Click the button to show the card, then click
          it again to hide it.
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
          The card renders every time, because nothing is guarding it. Put a
          condition in front of the element with &&, so React draws it only
          while the card is open. The hint at the bottom of the page shows
          the shape. */}
      <Card />

      {/* TODO 3 of 3
          Look at the page, not only the code. When the card is hidden, the
          page should show nothing where the card was. If a bare 0 shows up
          there instead, your condition is a number: 0 is falsy, and React
          prints 0 anyway. A boolean, or a comparison, keeps the 0 off the
          page. */}
      <p className="hint">
        <span className="hint__label">Pattern</span>
        <code className="hint__code">{'{isOpen && <Card />}'}</code>
      </p>
    </div>
  )
}

export default App

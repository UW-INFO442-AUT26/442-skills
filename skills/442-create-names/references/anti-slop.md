# Anti-slop

What generated names look like, and the audit that catches them.

The problem is not that a model has bad taste. It is that a model's default move
is **morphological assembly**: pick a benefit word, attach a suffix, ship it. That
answers "give me a name for a food app" plausibly and produces something no
person would ever name a thing.

## The seven failure patterns

| # | Pattern | Examples | Why it fails |
|---|---|---|---|
| 1 | Virtue plus suffix | Nourishly, Loopify, Sustainio, Careva | The suffix is the tell. Nothing is named `-ly` unless a generator named it. |
| 2 | Two benefit nouns welded | EcoTrack, GreenPath, SmartSort, WasteWise | Reads as a category, not a name. Any competitor could use it. |
| 3 | Latin-ish stem | Verida, Solvra, Nutritia, Lumenar | Sounds institutional and empty. Nobody knows what it means, so nothing sticks. |
| 4 | Misspelled real word | Karmaa, Kwik, Lyft-isms | The misspelling costs a lifetime of "no, with two a's". |
| 5 | Over-served noun | Nova, Lumen, Aura, Hive, Nest, Orbit, Bloom, Prism, Echo, Atlas, Vertex, Flux | Each is fine once per decade. In a generated set they appear four times. |
| 6 | Category word plus AI | PantryAI, MealMind AI | Dates the product and says nothing. |
| 7 | Insider's term | "Mise" for a cooking app, "Flux" for a compiler | The curse of knowledge. Half the audience needs it explained. |

## The overused word bank

Check every candidate. One hit is a warning, two hits is a cut.

```text
glow  bloom  flow  flux  spark  ember  aura  lumen  nova  nebula  orbit  prism
echo  pulse  vertex  apex  zenith  hive  nest  haven  harbor  anchor  compass
atlas  nomad  drift  tide  wave  loop  cycle  thread  weave  mosaic  bridge  link
sync  shift  elevate  uplift  thrive  flourish  kindle  ignite  bright  smart  pure
true  clear  fresh  green  eco  sustain  impact  good  better  simple  easy  mind
brain  sense  wise  know  insight  vision  focus  clarity  harmony  balance
```

This is not a ban list for the world. `Hive` is a legitimate name. It is a ban on
the second use in one set, and a warning on the first.

## The audit

Run this on your own output before anyone sees it. Every row is a yes or no you
can check, which is the point: taste arguments are unwinnable, structural checks
are not.

| Check | What a fail means |
|---|---|
| Does every candidate survive with its suffix deleted? | If `Loopify` to `Loop` is strictly better, the suffix was decoration. |
| Does any candidate share a morpheme with another candidate? | One word family, not a concept set. Redo the passes. |
| Could a competitor in this category use this name unchanged? | It is a category label. Cut it. |
| Does any candidate contain a word from the brief? | You skipped the brief-word ban. |
| Is at least a third of the set single concrete nouns? | The set is abstract. Do the treasure hunt. |
| Does at least one candidate make someone hesitate? | You never entered the approximate zone. |
| Do the candidates have three different origin domains? | All three passes collapsed into one. |
| Does every finalist read cleanly in the spoken sentence? | If it needs a comma and an explanation, it is not fluent. |
| Did you spell each one aloud? | Doubled letters, silent vowels, and `-able` versus `-ible` all show up here. |
| Did you generate in one pass instead of three? | The set will be homogeneous. Restart at the treasure hunt. |

## SMILE and SCRATCH

Alexandra Watkins' two lists, from the public test at
[eatmywords.com/smile-scratch-test](https://eatmywords.com/smile-scratch-test/).
Use them as the second filter, after the audit.

**SMILE:** Suggestive, Memorable, Imagery, Legs, Emotional. *Legs* is the one most
names miss: does it lend itself to a theme, a vocabulary, a visual language?

**SCRATCH:** Spelling-challenged, Copycat, Restrictive, Annoying, Tame, Curse of
knowledge, Hard-to-pronounce. *Restrictive* matters for a project that might grow
past the demo: `FridgeSaver` cannot become anything else. *Tame* is the slop
pattern expressed in one word.

## Worked kill list

A student team building an app that tells you what to cook before food goes bad.

| Candidate | Pattern | Kill reason |
|---|---|---|
| Freshly | 1, 5 | suffix plus over-served word, and it is an existing meal-kit brand. |
| PantryPal | 2 | welded nouns, and "pal" is 1998. |
| Nourish | 5 | a verb doing a noun's job, and it is every food app. |
| Savora | 3 | a Latin-ish stem with no meaning and no mouth. |
| Ripe | none | kept. Concrete, one syllable, real, and the felt benefit is ripeness. |

Two survivors from five is the right ratio. If everything survives, the filter is
not running.

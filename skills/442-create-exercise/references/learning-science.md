# Learning science for exercises

Why an exercise is built the way it is. This file is the **authority** for
`442-create-exercise`. When a design choice here conflicts with a taste for
look, length, or convenience, this file wins.

Sixteen rules. Each one is a claim about how learning works, the evidence for
it, and what it forces in the spec you write. Rules 1 to 12 are about memory.
Rules 13 to 16 are about what the student is doing at each step, which is often
not answering a question. When the idea has parts that move, change, or relate,
what the student does with those parts is the exercise, and a text question is
the fallback (rules 13 to 16).

## 1. Make them retrieve before you tell

**Rule.** A step shows the prompt and nothing else. The answer appears only
after the student has committed to one.

**Why.** Producing an answer changes memory far more than reading one. Testing
yourself beats restudying the same material, and the gain is still there weeks
later. Reading the notes again mostly buys a feeling of fluency (Roediger &
Karpicke, 2006; Karpicke & Roediger, 2008). A failed attempt still helps, as
long as the right answer arrives soon after it (Kornell, Hays & Bjork, 2009).

**In the spec.** Keep the answer out of the `prompt`, out of the option list,
and out of any `figure` or `widget`. For a `short` step the model answer stays
hidden until the student submits. Nothing on the page reveals a verdict before
submit.

## 2. Every answer gets feedback that says why

**Rule.** Every graded step carries a `feedback` string that explains the
mechanism, not the verdict. Grade on submit, show it on submit.

**Why.** Feedback that names the goal, the gap, and the next move is what moves
learning. "Correct" on its own does not (Hattie & Timperley, 2007). For
practice items, feedback that comes at once and explains is the effective form
(Butler & Roediger, 2008; Butler, Karpicke & Roediger, 2007).

**In the spec.** `feedback` is a sentence or two of reasoning the student could
repeat to a friend. "401 means the request carried no usable login" is
feedback. "Correct!" is not.

## 3. Aim the wrong options at a specific misconception

**Rule.** Every `choice` and `multi` step carries a `misconception`: the belief
that makes the most tempting wrong answer attractive, and why that belief
fails.

**Why.** Learners do not take in information evenly. They filter it through a
model that is already wrong in a particular way. Naming the tempting error is
what lets the correction land (Chi, de Leeuw, Chiu & LaVancher, 1994, on
self-explanation, and error-driven learning generally).

**In the spec.** Write the wrong option first and the belief it targets second.
If a wrong option has no reason to be chosen, replace it with one a real
student would pick. Key the object by wrong option index, with a `"default"`
for anything else.

## 4. Spread the practice over days

**Rule.** One exercise is one sitting. The results screen sends the student
back to the missed steps tomorrow, not in twenty minutes.

**Why.** Practice spread across days beats the same total practice packed into
one block, and the gain grows as the gap widens (Cepeda, Pashler, Vul, Wixted
& Rohrer, 2006). Of ten study techniques reviewed, distributed practice and
practice testing came out on top (Dunlosky, Rawson, Marsh, Nathan &
Willingham, 2013).

**In the spec.** `meta.minutes` is honest about one sitting. The results screen
names the steps to redo and says when.

## 5. Mix the kinds of work

**Rule.** Neighbouring steps do not all ask the same shape of question. Change
the kind, and change the sub-topic, instead of blocking one idea together.

**Why.** Blocked practice (ten of a kind) lets the student reuse one procedure
without deciding which procedure applies. Mixing them forces that decision. It
costs accuracy during practice and improves later performance (Rohrer &
Taylor, 2007; Taylor & Rohrer, 2010). Noticing which idea applies is usually
the real skill being tested.

**In the spec.** Order `steps[]` by nothing in particular: mix the kinds. A
step's optional `tag` names its sub-topic, and the tag is for you, not for the
student. The page never renders it.

## 6. Start with support, then take it away

**Rule.** Early steps on a new idea may carry a `hint` or an easier kind. Later
steps on the same idea carry neither.

**Why.** A beginner needs the structure held for them at first, and the fading
is what hands it over. Fading support while asking the student to explain their
own reasoning beats both keeping the support and dropping it from the start
(Atkinson, Renkl & Merrill, 2003). Difficulty that makes retrieval harder now
and memory stronger later is the useful kind (Bjork & Bjork, 2011).

**In the spec.** The first step on a new idea may have a `hint`. The last step
on that idea should be a `short` step with no hint at all.

## 7. Spend the student's effort on the learning, not the interface

**Rule.** One thing to do per screen, one main button, no login, no scrolling
to find the question, no waiting on the network.

**Why.** Working memory is narrow, and it is shared with everything else on the
screen. Work on the interface is load that leaves less room for the idea
itself (Sweller, 1988).

**In the spec.** This is a rule about the page, and the page already follows
it: one self-contained file, made for a 360 px phone first, that loads nothing
from the network. Do not add a second idea to a step, and do not ask for two
actions at once.

## 8. Decide the capability before you write steps

**Rule.** The second interview question ("the one thing you must be able to do
afterward") becomes `meta.goal` and limits every step.

**Why.** Good assessment is designed backwards from the target, not forwards
from the material that happens to be at hand (Wiggins & McTighe, *Understanding
by Design*). A step the student could answer without having the capability is
measuring something else.

**In the spec.** `meta.goal` reads "After this you can ...". Every step samples
that capability.

## 9. Aim at one capability, not a topic

**Rule.** Refuse a topic that sprawls ("everything about React"). Ask for the
one act.

**Why.** Same evidence as rule 8, plus rule 7. A broad topic forces breadth,
and breadth costs the depth that practice builds.

**In the spec.** If the interview turns up two capabilities, drop one or plan
two exercises.

## 10. End on a criterion the student can check

**Rule.** `meta.criterion` names the bar in the student's words. The results
screen tests it and says met or not met.

**Why.** Feedback only helps against a standard the learner knows. "Where am I
going" is the first of the three feedback questions (Sadler, 1989; Hattie &
Timperley, 2007). A vague bar invites stopping early.

**In the spec.** `{ "text": "...", "minCorrect": 4 }`. Keep the text and the
number in agreement. `minCorrect` counts graded steps only, so an `explore`
step never changes it.

## 11. Answers are graded, not judged

**Rule.** A `short` step grades a normalized exact match against its `answer`
list, then shows the model answer either way.

**Why.** This is an engineering limit, not a learning claim: the page has no
server and no model behind it. A loose matcher that accepted near misses would
mark an unlearned answer right, which breaks rule 2.

**In the spec.** `answer` for a `short` step lists the acceptances ("401",
"401 unauthorized"). For `choice` it is the index of the right option. Every
other kind answers with indices into the lists the student can see.

## 12. One sitting is about 10 minutes on a phone

**Rule.** 6 to 12 steps for a 10 minute exercise, one line per prompt.

**Why.** A phone session competes with everything else the student is doing.
Long sessions get abandoned half way, which destroys the mixing of rule 5 and
the criterion of rule 10. Attention is the scarce resource.

**In the spec.** If the topic needs 20 steps, that is two exercises.

## 13. Let them move it before you explain

**Rule.** When the thing has parts, a trade-off, or a number that moves, open
with an `explore` step that lets the student change it and watch. If the idea
has parts that move, or parts that relate to each other, build the thing they
can move, and ask for the idea only after they have handled it.

**Why.** Learning by doing beats learning by watching, as long as the doing
comes with guidance and feedback (Alfieri, Brooks, Aldrich & Tenenbaum, 2011).
Guided practice with feedback is roughly as effective as one-to-one human
tutoring in step-based systems (vanLehn, 2011). The student's own activity is
the active part: dragging an item, or controlling a variable and watching what
it does, is interactive work, and interactive work beats constructing an
explanation, which beats reading and watching (Chi & Wylie, 2014). Handling the
thing is what gives the student something concrete to hang the later words on.

**In the spec.** An `explore` step is ungraded: it needs a `widget`, it shows a
Continue button, and it is not counted in `minCorrect`. Put it first on a new
idea. Give the student something to drag or a variable to change, rather than a
step that only prints text back at them. The widget must not print the answer
to a later question.

## 14. Ask for a prediction before they see what happens

**Rule.** Before the page shows a result, ask the student what they expect.
Then show it, and point out the gap.

**Why.** Committing to a prediction before the evidence makes the evidence
matter. Surprise at the gap is what drives the correction (Brod, Hasselhorn &
Bunge, 2018; White & Gunstone, 1992, for the predict, observe, explain
routine). Prediction is also what keeps an animation from turning into
something to watch: the student has already given an answer, so the motion
lands on a question instead of passing by.

**In the spec.** This is rule 1 applied to an interactive step: the widget
runs, but the student says what they think will happen first. A `choice` step
placed just before the observation does the job. When the widget has a Play or
Step button, the prediction step comes before the student presses it the first
time, and the prompt tells them to press Play after they have chosen.

## 15. Show a worked example, then take it apart

**Rule.** The first step on a hard new idea shows the whole worked example.
Later steps show part of it and ask the student to finish. The last step gives
the student nothing.

**Why.** Studying a worked example beats solving the same problem cold for
beginners, and the advantage fades as skill grows. Fading the example into
completion problems keeps the benefit while handing the work over (Sweller &
Cooper, 1985; Atkinson, Renkl & Merrill, 2003; Renkl, 2014).

**In the spec.** A `figure` with `type: "code"` or a `widget` can carry the
worked example. The step after it asks for one piece, and the step that ends
the idea asks for the whole thing. Rule 6's `hint` is the smaller version of
the same move.

## 16. Draw it and move it when the idea is about relations or change

**Rule.** If the idea is about how things relate, or about anything that
changes, draw it. A diagram, a chart, and an animated process are the default
for a relational or a dynamic idea, and words alone are the fallback. A block
of prose that walks the parts in order is not the same thing as the picture:
the student has to rebuild the relations, which is the work the picture was
supposed to save.

**Why.** A diagram that shows the relations directly saves the reader the work
of rebuilding them from prose (Larkin & Simon, 1987). Pictures and words
together beat either alone when they carry different parts of the idea, and
extra decoration hurts (Mayer & Moreno, 2003). Several views of one system help
when they are linked on purpose (Ainsworth, 2006). For things that move or
change over time, an animation or a simulation beats a static picture, but the
gain depends on the motion carrying the process: animation of a process that is
genuinely dynamic helps, and motion added for looks costs attention and does
not teach (Höffler & Leutner, 2007; Tversky, Morrison & Betrancourt, 2002). A
student who can step the motion forward, hold it still, or drag the moving part
gets the most out of it, which is why the widget controls matter as much as the
drawing.

**In the spec.** Reach for `widget` when the point is a trade-off, a range, or
a process that runs. Reach for `figure` when the point is structure. When the
widget animates, the motion has to be the idea itself: a Play or Step button
that walks a process, a control the student drags, a diagram that answers to a
value. Mark the parts of a figure with `data-reveal` so the student can tap or
hover to name them. Never draw decoration, and never animate decoration. Five
of these visuals are already built, with the markup, the controls and the js to
paste, in [assets/visual-patterns.md](../assets/visual-patterns.md): an
animated process, a bar chart, a line chart, a labelled diagram, and a state
machine.

## Where each rule lands

| Rule | Lives in |
|---|---|
| 1, 11 | the page: nothing reveals before submit; the spec keeps answers out of `prompt`, `figure`, `widget` |
| 2, 3 | `feedback`, `misconception` on every graded step |
| 4 | `meta.minutes`, the results screen |
| 5 | the order of `steps[]`, and the mix of `kind` |
| 6 | `hint` on early steps |
| 7 | `assets/exercise.html` |
| 8, 9 | `meta.goal`, the interview |
| 10 | `meta.criterion`, the results screen |
| 12 | the number of `steps[]` |
| 13 | an early `explore` step with a `widget` the student drags or plays |
| 14 | a prediction step placed before the observation |
| 15 | `figure` or `widget` on the first step of an idea |
| 16 | `figure` for structure, `widget` for a process that moves, both from `assets/visual-patterns.md` |

## How a kind is chosen

Ask what the student must DO to learn this idea, then take the kind that makes
them do it.

| Kind | Reach for it when |
|---|---|
| `choice` | One right answer among believable rivals. |
| `multi` | Several things are true at once and the student must separate them. |
| `short` | The student must produce the word or the number with no options in front of them. |
| `order` | The sequence, or the order of decisions, is the idea. |
| `sort` | Items fall into two or three families. |
| `match` | Two lists are easy to confuse, so they must be paired up. |
| `explore` | The idea has parts, a trade-off, or a number that moves. Ungraded. |

## Sources

- Ainsworth, S. (2006). DeFT: A conceptual framework for considering learning with multiple representations. *Learning and Instruction*, 16(3).
- Alfieri, L., Brooks, P. J., Aldrich, N. J., & Tenenbaum, H. R. (2011). Does discovery-based instruction enhance learning? *Journal of Educational Psychology*, 103(1).
- Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning from studying examples to solving problems: Effects of self-explanation prompts and fading worked-out steps. *Journal of Educational Psychology*, 95(4).
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In *Psychology and the Real World*.
- Brod, G., Hasselhorn, M., & Bunge, S. A. (2018). When generating a prediction boosts learning: The element of surprise. *Learning and Instruction*, 55.
- Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2007). The effect of type and timing of feedback on learning from multiple-choice tests. *Journal of Experimental Psychology: Applied*, 13(4).
- Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition*, 36(3).
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3).
- Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science*, 18(3).
- Chi, M. T. H., & Wylie, R. (2014). The ICAP framework: Linking cognitive engagement to active learning outcomes. *Educational Psychologist*, 49(4).
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1).
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1).
- Höffler, T. N., & Leutner, D. (2007). Instructional animation versus static pictures: A meta-analysis. *Learning and Instruction*, 17(6).
- Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science*, 319(5865).
- Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful retrieval attempts enhance subsequent learning. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 35(4).
- Larkin, J. H., & Simon, H. A. (1987). Why a diagram is (sometimes) worth ten thousand words. *Cognitive Science*, 11(1).
- Mayer, R. E., & Moreno, R. (2003). Nine ways to reduce cognitive load in multimedia learning. *Educational Psychologist*, 38(1).
- Renkl, A. (2014). Toward an instructionally oriented theory of example-based learning. *Cognitive Science*, 38(1).
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3).
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics practice problems improves learning. *Instructional Science*, 35(6).
- Sadler, D. R. (1989). Formative assessment and the design of instructional systems. *Instructional Science*, 18(2).
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2).
- Sweller, J., & Cooper, G. A. (1985). The use of worked examples as a substitute for problem solving in learning algebra. *Cognition and Instruction*, 2(1).
- Taylor, K., & Rohrer, D. (2010). The effects of interleaved practice. *Applied Cognitive Psychology*, 24(6).
- Tversky, B., Morrison, J. B., & Betrancourt, M. (2002). Animation: can it facilitate? *International Journal of Human-Computer Studies*, 57(4).
- vanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. *Educational Psychologist*, 46(4).
- White, B. Y., & Gunstone, R. F. (1992). *Probing Understanding*. Falmer Press.
- Wiggins, G., & McTighe, J. (2005). *Understanding by Design* (2nd ed.). ASCD.

# Learning science for exercises

Why an exercise is built the way it is. This file is the **authority** for
`442-exercise`: when a design choice here conflicts with a preference about
look, length, or convenience, this file wins.

Twelve rules. Each one is a claim about how memory works, the evidence for
it, and what it forces in a spec you write.

## 1. Make them retrieve before you tell

**Rule.** A question shows the prompt and nothing else. The answer appears
only after the student has committed to one.

**Why.** Producing an answer changes memory far more than reading one.
Testing yourself on material beats restudying it, and the gap survives
weeks later; reading notes again mostly buys a feeling of fluency
(Roediger & Karpicke, 2006; Karpicke & Roediger, 2008). Attempting and
failing still helps, as long as the correct answer arrives soon after
(Kornell, Hays & Bjork, 2009).

**In the spec.** Never put the answer in the `prompt`, but also never in
an option list. For a `short` step the model answer stays hidden until the
student submits.

## 2. Every answer gets feedback that says why

**Rule.** Each step carries a `feedback` string that explains the
mechanism, not the verdict. Grade on submit, show it on submit.

**Why.** Feedback that names the goal, the gap, and the next move is what
moves learning; "correct" alone does not (Hattie & Timperley, 2007).
Immediate explanatory feedback is the effective form for practice items
(Butler & Roediger, 2008; Butler, Karpicke & Roediger, 2007).

**In the spec.** `feedback` is a sentence or two of reasoning a student
could repeat to a friend. "Yes, 403 means authenticated but not allowed"
is feedback; "Correct!" is not.

## 3. Aim the wrong options at a specific misconception

**Rule.** Every step carries a `misconception` line: the belief that makes
the most tempting wrong answer attractive, and why that belief fails.

**Why.** Learners do not receive information evenly; they filter it
through a model that is already wrong in a particular way. Naming the
tempting error is what lets the correction land (Chi, de Leeuw, Chiu &
LaVancher, 1994, on self-explanation; error-driven learning more
generally).

**In the spec.** Write the distractor first and the misconception it
targets second. If a wrong option has no reason to be chosen, replace it
with one a real student would pick.

## 4. Spread the practice over days

**Rule.** An exercise is one sitting. The results screen sends the student
back to the missed items tomorrow, not in twenty minutes.

**Why.** Practice spread across days beats the same total practice massed
into one block, and the benefit grows as the gap widens (Cepeda, Pashler,
Vul, Wixted & Rohrer, 2006; Dunlosky, Rawson, Marsh, Nathan & Willingham,
2013, rate distributed practice and practice testing as the two
highest-utility techniques among ten reviewed).

**In the spec.** `meta.minutes` is honest about one sitting. The results
screen names the items to redo and says when.

## 5. Mix the kinds of problem

**Rule.** Neighbouring steps should not all be the same shape. Alternate
`choice` and `short`, and alternate sub-topics inside one exercise.

**Why.** Blocked practice (ten of a kind) lets the student reuse one
procedure without deciding which one applies. Interleaving forces that
choice, and it costs accuracy during practice while improving later
performance (Rohrer & Taylor, 2007; Taylor & Rohrer, 2010). Recognizing
which idea applies is usually the real skill being assessed.

**In the spec.** Order `steps[]` by nothing. Interleave. A step's
optional `tag` names its sub-topic.

## 6. Start with support, then take it away

**Rule.** Early steps may carry a `hint` or an easier kind. Later steps on
the same idea carry neither.

**Why.** Novices need the structure held for them at first; the fade is
what hands it over. Fading worked steps while prompting self-explanation
beats both keeping the support and dropping it from the start (Atkinson,
Renkl & Merrill, 2003). Difficulty that makes retrieval harder right now
while making memory stronger is the desirable kind (Bjork & Bjork, 2011).

**In the spec.** The first step on a new idea may have a `hint`. The last
step on it should be a `short` recall with no hint at all.

## 7. Spend the student's effort on the learning, not the interface

**Rule.** One question per screen, one primary action, no login, no
scroll to find the question, no waiting on a network request.

**Why.** Working memory is narrow and shared with everything else on the
screen. Interface work is load that leaves less room for the item itself
(Sweller, 1988).

**In the spec.** This is a constraint on the page, which already satisfies
it: the template is one self-contained file of about 25 KB, mobile-first
at 360 px, and loads nothing from the network.

## 8. Decide the capability before you write questions

**Rule.** The interview's second question ("the one thing you must be able
to do afterward") becomes `meta.goal` and constrains every step.

**Why.** Assessment is designed backwards from the target, not forwards
from the material that happens to be at hand (Wiggins & McTighe,
*Understanding by Design*). A step that a student could answer without
having the capability is measuring something else.

**In the spec.** `meta.goal` reads "After this you can ...". Every step
should be a sample of that capability, not of adjacent trivia.

## 9. Aim at one capability, not a topic

**Rule.** Refuse a topic that sprawls ("everything about React"). Ask for
the one act.

**Why.** Feeds the same evidence as rule 8, and rule 7: a broad topic
forces breadth that costs depth, and depth is what practice builds.

**In the spec.** If the interview produces two capabilities, either drop
one or plan two exercises.

## 10. End on a criterion the student can check

**Rule.** `meta.criterion` names the bar in the student's words, and the
results screen evaluates it and says met or not met.

**Why.** Feedback is only actionable against a standard the learner knows:
"where am I going" is the first of the three feedback questions (Sadler,
1989; Hattie & Timperley, 2007). A vague bar invites stopping early.

**In the spec.** `{ "text": "...", "minCorrect": 4 }`. Keep the text and
the number in agreement.

## 11. Answers are graded, not judged

**Rule.** Free-response steps grade a normalized exact match against an
`answer` list, then show the model answer either way.

**Why.** This is an engineering constraint, not a learning claim: the page
has no server and no model behind it. A loose matcher that accepts near
misses would mark an unlearned answer correct, which breaks rule 2.

**In the spec.** `answer` for a `short` step lists the acceptances
("401", "401 unauthorized"). For a `choice` step it is the index of the
right option.

## 12. One sitting is about 10 minutes on a phone

**Rule.** 6 to 12 steps for a 10 minute exercise, one line per prompt.

**Why.** A phone session competes with everything else the student is
doing; long sessions get abandoned mid-way, which destroys rule 5's
interleaving and rule 10's criterion. Sustained attention is the scarce
resource.

**In the spec.** If the topic needs 20 steps, that is two exercises.

## Where each rule lands

| Rule | Lives in |
|---|---|
| 1, 11 | the page: nothing reveals before submit |
| 2, 3 | `feedback`, `misconception` on every step |
| 4 | `meta.minutes`, the results screen |
| 5 | the order of `steps[]`, `tag` |
| 6 | `hint` on early steps |
| 7 | `assets/exercise.html` |
| 8, 9 | `meta.goal`, the interview |
| 10 | `meta.criterion`, the results screen |
| 12 | number of `steps[]` |

## Sources

- Atkinson, R. K., Renkl, A., & Merrill, M. M. (2003). Transitioning from studying examples to solving problems: Effects of self-explanation prompts and fading worked-out steps. *Journal of Educational Psychology*, 95(4).
- Bjork, E. L., & Bjork, R. A. (2011). Making things hard on yourself, but in a good way: Creating desirable difficulties to enhance learning. In *Psychology and the Real World*.
- Butler, A. C., Karpicke, J. D., & Roediger, H. L. (2007). The effect of type and timing of feedback on learning from multiple-choice tests. *Journal of Experimental Psychology: Applied*, 13(4).
- Butler, A. C., & Roediger, H. L. (2008). Feedback enhances the positive effects and reduces the negative effects of multiple-choice testing. *Memory & Cognition*, 36(3).
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*, 132(3).
- Chi, M. T. H., de Leeuw, N., Chiu, M.-H., & LaVancher, C. (1994). Eliciting self-explanations improves understanding. *Cognitive Science*, 18(3).
- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest*, 14(1).
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research*, 77(1).
- Karpicke, J. D., & Roediger, H. L. (2008). The critical importance of retrieval for learning. *Science*, 319(5865).
- Kornell, N., Hays, M. J., & Bjork, R. A. (2009). Unsuccessful retrieval attempts enhance subsequent learning. *Journal of Experimental Psychology: Learning, Memory, and Cognition*, 35(4).
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. *Psychological Science*, 17(3).
- Rohrer, D., & Taylor, K. (2007). The shuffling of mathematics practice problems improves learning. *Instructional Science*, 35(6).
- Sadler, D. R. (1989). Formative assessment and the design of instructional systems. *Instructional Science*, 18(2).
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*, 12(2).
- Taylor, K., & Rohrer, D. (2010). The effects of interleaved practice. *Applied Cognitive Psychology*, 24(6).
- Wiggins, G., & McTighe, J. (2005). *Understanding by Design* (2nd ed.). ASCD.

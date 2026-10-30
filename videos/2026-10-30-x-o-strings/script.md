# Can X Stay Ahead? | AMC 8-Style Level 5

## Intro

Here are four X tiles and four O tiles. There are seventy ways to line them up.

But in only some of them, X never falls behind. How many?

Hi, I'm Vantee! Let's find out, together.

## The question

Here's the question.

Nora writes a string with the letter X four times, and the letter O four times.

She reads it from left to right.

At every point, the X count so far must be at least the O count so far.

How many such strings are there?

Is it eight, fourteen, sixteen, twenty, or thirty-five?

## What are we asked?

So what does that rule really mean?

Let's read a string and keep score, like a game between X and O.

Look at this one. After every letter, the X count is at least the O count.

Ties are fine. But X can never fall behind. So this one counts!

Now this one. After three letters, O leads, two to one. So it's out!

Our job is to count every string where O never takes the lead.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: make a list

Welcome back! Our first strategy is to make an organized list.

Two quick facts first. The first letter must be an X.

If it were an O, then O would lead, one to zero.

And the last letter must be an O.

If it were an X, then after seven letters, the O count would be four, and the X count only three. O would lead!

Now let's sort the strings by the X count before the first O.

All four X tiles first? Then the rest are O tiles. That's just one string.

Three X tiles, then an O. The last X can go in three spots, but never at the very end. That's three strings.

Two X tiles, then an O. Let's list them carefully. We find five strings.

One X, then an O. That's a tie. Let's list the rest carefully. Five more strings.

One, plus three, plus five, plus five. That's fourteen!

Lists work well when they're short. But they grow fast!

## Solution 2: build a table

Here's a cleverer way. Let's turn each string into a walk.

Start at the top left corner. Each X steps right. Each O steps down.

Here's our good string from before, drawn as a walk on the grid.

The rule says the O count can never pass the X count. So the walk can never step below this wall.

The string that failed goes below the wall, right here.

Every good string is one walk to this corner. So let's count the walks!

In each spot, we'll write how many walks can reach it.

Along the top, there's only one way: X after X. So we write ones.

Any other spot is reached by a step from the left, or a step from above.

So the number in a spot is the left number, plus the number above.

On the wall, the spot to the left is past the wall, so it doesn't count. We just copy the one above.

Then one plus one is two. Two plus one is three. Three plus one is four.

Next row. Copy the two. Two plus three is five. Five plus four is nine.

Next, copy the five. Then five plus nine is fourteen.

And the corner copies the fourteen. Fourteen walks, so fourteen strings!

When would you pick the table? When a list would be too long. The table just adds!

## Common traps

Now, let's look at the wrong answers. Each one is a trap.

Thirty-five is half of all seventy strings. But the good ones are NOT half.

Next up, twenty. That counts every string that starts with X and ends with O. But it forgets to check the middle, like this one.

Sixteen comes from guessing a pattern. Our groups went one, three, five, and then five again, not seven.

And eight is just too few. Our list found more.

So here's the habit. Count in a clear order, and check the rule at EVERY step.

## Your turn: a variant

Ready for a challenge? Here's a twist.

Now Nora uses the letter X five times, and the letter O only three times.

At every point, the X count must still be at least the O count.

How many strings are there now? Use the table!

Pause the video, and go for it!

*(Pause and try it: 12 s countdown)*

## Variant: the answer

Let's check. The walk now goes five steps right, and three steps down.

The first five columns are the same, and we stop one row sooner.

We just add one new column. The top spot is one, as always.

Then four plus one is five. Nine plus five is fourteen.

And fourteen plus fourteen is twenty-eight!

If you found all twenty-eight strings, amazing work!

## Recap

Here's the big idea to remember.

Turn each string into a walk, and never cross the wall.

Then fill in a table. Each spot adds the ways in from the left, and from above.

I'm Vantee. Keep counting, and I'll see you next time!

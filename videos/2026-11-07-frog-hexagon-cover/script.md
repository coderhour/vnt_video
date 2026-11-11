# A Random Frog on a Hexagon | AMC 10-Style Level 5

## Intro

A frog hops around a hexagon at random. How long until it has visited every corner?

Hi, I'm Vantee! A beautiful pattern is hiding here. Let's find it together.

## The question

A frog sits on one vertex, or corner, of a regular hexagon.

Each second, it jumps to one of the two neighboring corners, each with chance one half.

What is the expected number of jumps until the frog has been on all six corners?

## What are we asked?

Expected number means the average, as if the frog did this a million times.

The starting corner already counts as visited. So we need five new corners.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: one stage at a time

Welcome back! Let's color every corner the frog has visited green.

The frog only jumps to neighbors. So the green corners always form one unbroken block.

And when the block grows, the frog is standing on the new corner, at an end of the block.

To reach a new corner, it must step just outside the block, on either side.

So the trip splits into five stages. In stage two, two corners are green, and so on.

Stage one is quick. Both neighbors are new, so it takes exactly one jump.

Stage two. Let's straighten the hexagon into a line: an exit, the green block, and an exit.

Call W the frog's average waiting time at an end. Every jump costs one. Then add the average waiting time of the two spots it could land on.

Half the time, it steps off the block. Done! The other half, it lands on the other end.

That end is a mirror image, so its waiting time is also W. So W is one, plus W over two.

Take W over two from both sides. W over two is one, so W is two jumps.

Stage three. The block has an end, a middle, and another end. Call the middle's waiting time M.

From the middle, every jump lands on an end. So M is one plus W.

From the end, half the time it's done, and half the time it goes to the middle.

So W is one, plus half of M. Swap in one plus W for M.

W is three over two, plus W over two. So W is three jumps!

Stage four has two twin spots in the middle. Call each one's waiting time P.

From P, it goes to the end or its twin. So P is one, plus W over two, plus P over two.

So P is two more than W. And W is one plus P over two. Solve it: W is four jumps!

Stage five: only one corner is missing. It touches both ends, so both exits land on it.

Same trick, with one more letter. It works out to waiting times of five at the ends, eight next to them, and nine in the middle.

Add the five stages: one plus two plus three plus four plus five.

The answer is fifteen! Choice C.

## Solution 2: the hill trick

Why does it go one, two, three, four, five? Let's draw stage five's waiting times as bars.

The exits wait zero. Each other spot waits one more than the average of its neighbors.

The waiting times are zero, five, eight, nine, eight, five, zero. Check one: eight is one plus seven.

Now look at the climbs: up five, up three, up one, down one, down three, down five.

Halfway between five and nine is seven. Eight is one above, so climbing in beats climbing out by two.

And look again. Five is one times five, eight is two times four, nine is three times three.

Each waiting time is the steps to one exit, times the steps to the other exit!

Stage k has k plus one climbs, shrinking by two. Both exits are zero, so the climbs cancel: they run from up k to down k.

So the frog at an end, one step from one exit and k from the other, waits k jumps.

When would you pick this one? When the shape gets big, and solving equations gets long.

## Common traps

A, ten, is what you'd get if you stopped after stage four. The last stage still needs five.

B, twelve, and D, eighteen, give every corner the same cost, two or three. But the stages aren't equal.

They grow, because a step back lands INSIDE the block, farther from new corners.

E, twenty-one, counts a sixth stage. Once all six corners are green, the frog is done!

## Your turn: an octagon

Ready for a challenge? Same frog, same rules, but on a regular octagon with eight corners.

What is the expected number of jumps until it has been on all eight corners?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## Octagon: the answer

The green corners still form one block, and each stage starts at an end.

With k corners green, the waiting time is one times k. That's k jumps.

Seven new corners, seven stages: one plus two, up to seven. That's twenty-eight jumps!

## Recap

The big idea: picture a walker on a line, with equal chances each step, and an exit at each end.

Its average wait to step off is the steps to one exit, times the steps to the other.

I'm Vantee. Keep exploring, and I'll see you next time!

# Ant on a Prism: Which Corner Comes First? | AMC 10-Style Level 4

## Intro

An ant wanders a prism, one random edge a second. Finish line or trap: which corner comes first?

I'm Vantee, and today we're racing an ant to the finish line!

## The question

A triangular prism has a bottom triangle, A B C, and a top triangle, D E F.

Edges A D, B E and C F join each bottom corner to the one above it.

An ant starts at corner C. Each second, it crawls along one of the three edges at its corner.

All three edges are equally likely. What's the chance it reaches E before it ever reaches A?

Here are the five choices. Take a good look.

## What are we asked?

Let's sort out the facts. E is the finish line, and A is the trap.

The walk ends at whichever one the ant reaches first. Sooner or later, it's sure to reach one.

So we want the chance that E comes first, starting from C.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: a chance for every corner

Welcome back! Here's the strategy: give every corner its own chance of winning.

From C, call it c. Do the same for B, D and F. E counts as one, and A as zero.

Each neighbor is next with chance one third. So a corner's chance is the average of theirs.

B touches A, C and E. So b equals zero plus c plus one, all over three.

D touches A, E and F. So d equals zero plus one plus f, all over three.

C touches A, B and F. So c equals zero plus b plus f, all over three.

F touches C, D and E. So f equals c plus d plus one, all over three.

Start with the rule at C. Multiply by three: three c equals b plus f.

Swap in b, then multiply by three again. Nine c equals one plus c plus three f.

So eight c equals one plus three f.

The same steps at F, using d, give eight f equals four plus three c.

Now a neat trick: add them. Eight c plus eight f equals five plus three c plus three f.

Take away three c and three f: five c plus five f equals five. So c plus f equals one!

Then f is one minus c. So eight c equals one plus three minus three c, and eleven c equals four.

So c is four over eleven. That's our answer!

## Solution 2: spin the prism

Here's a faster way. That c plus f equals one was no accident.

Look at the front face, A B E D. A and E are opposite corners.

Push a skewer through the middle of that face, and spin the prism half a turn.

A and E swap places. So do B and D, and so do C and F. It's the same prism!

So an ant at F racing to E is just like an ant at C racing to A.

From C, A comes first with chance one minus c. So f equals one minus c, and d equals one minus b.

Now plug f equals one minus c into our rule from before: eight c equals one plus three f.

So eight c equals four minus three c. Eleven c equals four. Four over eleven again!

When would you pick this way? Whenever a spin swaps the win and the loss. Look for it first.

## Common traps

Now let's look at the wrong answers.

One third is what you'd get if you guessed b and f are one half each. They aren't.

Five over eleven is b, the chance from B. Right work, wrong corner.

Six over eleven is the chance from D, the letter d. Also the wrong starting corner.

Seven over eleven is one minus c, the chance that A comes FIRST. That's the race backwards.

## Your turn: a new finish line

Ready for a challenge? Same prism, and the ant starts at C again.

Now F is the finish line, and A is still the trap. What's the chance F comes first?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## New finish line: the answer

Let's check. A and F are opposite corners of the face A C F D. Skewer it and spin.

A swaps with F, C with D, and B with E. So e equals one minus b.

At C: c equals zero plus b plus one, all over three.

At B: three b equals c plus one minus b, so four b equals c plus one.

From the C rule, b equals three c minus one. Swap it in: twelve c minus four equals c plus one.

So eleven c equals five, and c is five over eleven. If you got it, amazing work!

## Recap

Give every corner a chance. Each one is the average of its neighbors' chances.

Then look for a spin that swaps the win and the loss. Paired chances add up to one.

I'm Vantee. Happy exploring, and see you next time!

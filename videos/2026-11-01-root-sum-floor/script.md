# 100 Square-Root Fractions, No Calculator | AMC 10-Style Level 4

## Intro

One hundred fractions with square roots, all added up. Sounds like a calculator job, right?

Here's the surprise. You can pin it down with NO calculator at all.

Hi, I'm Vantee! Let's trap this sum between a floor and a ceiling.

## The question

Here's the question.

Add one over root one, plus one over root two, and so on, up to one over root one hundred.

What is the greatest whole number less than or equal to this sum?

Here are the five choices. Take a good look.

## What are we asked?

So what are we really looking for? Not the exact sum. Just the sum, rounded down.

If the sum sits between two whole numbers next to each other, the smaller one is our answer.

Every term is at least one over ten, and at most one. So the sum is between ten and one hundred.

That window is way too wide. We need a sharper floor and ceiling.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: grow a square

Welcome back! Here's our plan: turn each term into a picture.

Draw a square with area k. Its side is root k.

Now grow it to area k plus one. Its side becomes root of k plus one.

The new part is an L-shaped strip, with area exactly one. Call its thickness g, the gap.

Cut the strip into two rectangles, both g thick. One is root k long, the other is a bit longer.

So the strip's area, one, is MORE than g times two root k.

Divide both sides by root k. Two g is less than one over root k. Each term beats two gaps!

Now do this for every k, from one to one hundred. The squares nest inside each other.

All the gaps together grow the side from one to root one hundred one.

So the sum is more than two times, root one hundred one minus one.

Root one hundred one is a bit more than ten, because ten squared is one hundred.

So the sum is more than two times nine. That's eighteen! There's our floor.

## Solution 1: the ceiling

Next, a ceiling. This time, use the strip just INSIDE the square with side root k.

Grow a square from area k minus one to area k. Again, the strip has area one.

Call its thickness h. Now both rectangles are at most root k long.

So one is LESS than h times two root k. Each term is less than two of these gaps.

Careful with the very first term! When k is one, that only says one is less than two.

So keep the first term as exactly one, and squeeze the other ninety-nine.

Their gaps grow the side from root one to root one hundred. That's from one to ten.

So the sum is less than one, plus two times nine. That's nineteen!

The sum is more than eighteen, and less than nineteen.

Round it down, and the answer is eighteen! Choice C.

A computer agrees. The sum is a bit more than eighteen and a half.

## Solution 2: the algebra shortcut

Here's a faster way to get the lower bound, with algebra.

Multiply root of k plus one, minus root k, by the same two roots added.

Difference of squares! You get k plus one, minus k. That's just one.

So the gap equals one over, root of k plus one, plus root k.

That bottom is bigger than two root k. So two gaps are less than one over root k.

Add them up, and every middle square root cancels. Only the two ends stay.

When would you pick this one? On test day. It's just a few lines.

## Common traps

Now, let's look at the wrong answers. Each one is a trap.

A, ten, is what you'd get from every term being at least one over ten. True, but way too low.

B, seventeen, is too small. Our floor already beat eighteen.

D, nineteen, is what you'd get from the ceiling alone. But the sum stays UNDER nineteen.

E, twenty, is what you'd get from two root one hundred, forgetting to subtract anything.

So here's a great habit. One wall isn't enough. You need a floor AND a ceiling.

## Your turn: ten thousand terms

Ready for a challenge? Same idea, but way more terms.

Add one over root one, all the way up to one over root ten thousand.

What is the greatest whole number less than or equal to this sum?

Pause the video, and go for it!

*(Pause and try it: 12 s countdown)*

## Ten thousand terms: the answer

For the floor, the side grows from one to root ten thousand one, just over one hundred.

So the sum is more than two times ninety-nine. That's one hundred ninety-eight.

For the ceiling, keep the first term as one. The rest grow the side from one to one hundred.

So the sum is less than one, plus one hundred ninety-eight. That's one hundred ninety-nine.

The answer is one hundred ninety-eight! Ten thousand terms, and no calculator.

## Recap

The big idea: squeeze each term between two easy pieces. Add them up, and the middle cancels.

Then a floor and a ceiling, one apart, tell you the whole number.

I'm Vantee. Keep exploring, and I'll see you next time!

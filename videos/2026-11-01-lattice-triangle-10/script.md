# Exactly 10 Dots Inside a Right Triangle | AMC 10-Style Level 4

## Intro

Stretch a right triangle over a grid of dots. How many dots end up inside?

We need EXACTLY ten inside, and the slanted side is sneaky.

Hello, I'm Vantee. Let's count some dots!

## The question

Here's the question. A right triangle has corners at zero zero, p zero, and zero q.

Here p and q are positive whole numbers.

Exactly ten points with whole-number coordinates lie strictly inside it.

How many ordered pairs, p and then q, are possible?

## What are we asked?

The legs lie along the axes: p across and q up.

Strictly inside means dots on the edges do NOT count.

Ordered pairs means two and twenty-one is different from twenty-one and two.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: cut a rectangle in half

Welcome back! Let's add a twin triangle to make a rectangle. First, a six by four one.

Inside are five across and three up: fifteen dots.

The slanted side cuts the rectangle into two triangles. One dot sits right ON it.

Turn it half a turn and the triangles swap, so the other fourteen dots split evenly: seven each.

Now any p by q rectangle. It holds p minus one, times q minus one, dots inside.

Call g the greatest common factor of p and q.

The slant splits into g equal hops, so g minus one dots sit strictly between its ends.

Take those away, then split in half. Ten in each half means the rest is twenty.

Add g minus one to both sides: p minus one, times q minus one, equals nineteen plus g.

Let's call p the shorter leg for now. We'll flip the pairs at the end.

If both legs were seven or more, the triangle would cover a seven by seven triangle.

That one has thirty-six minus six, thirty dots, and half is fifteen. Too many!

So the short leg p is at most six. And p equals one leaves no room inside.

Now try p from two to six. Remember, g must be a factor of p.

p equals two: g is one or two, so q is twenty-one or twenty-two. Both check out!

p equals three: two times q minus one is twenty or twenty-two. So q is eleven or twelve.

p equals four: only twenty-one splits into threes, so q is eight. But four and eight share four, not two!

p equals five: q is six or seven. Five and six works, but five and seven don't share a five!

p equals six: only twenty and twenty-five split into fives.

Twenty gives q equals five, already counted. Twenty-five gives q equals six!

Five of our six pairs have different legs, so flipping gives ten ordered pairs.

Six and six flips into itself, so it counts once. Ten plus one is eleven. That's Choice D!

## Solution 2: Pick's theorem

Pick's theorem gives a faster road. Area equals the dots inside, plus half the edge dots, minus one.

Walk the edge: p steps along the bottom, g hops up the slant, q steps down. That's p plus q plus g.

The area is p times q over two. That equals ten, plus half of p plus q plus the letter g, minus one.

Double it and tidy up: p minus one, times q minus one, equals nineteen plus g. Same equation!

When would you pick this way? It's quick if you know the theorem. The rectangle works if you don't.

## Common traps

Choice E, twelve, is what you'd get if you flipped all six pairs. But six and six flipped is itself!

Choice C, ten, is what you'd get if you missed six and six. Its slanted side hides five dots!

Choice B, six, is what you'd get if you never flipped, or if you forgot the dots on the slant.

Choice A, five, is what you'd get if you kept only p smaller than q, and never flipped.

## Your turn: six dots inside

Your turn! Same triangle, but now exactly six dots lie inside. How many ordered pairs this time?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## Six dots: the answer

Now the rest must be twelve, so p minus one, times q minus one, equals eleven plus g.

A six by six triangle has ten dots inside. Too many, so the short leg is at most five.

p equals two gives q equals thirteen or fourteen.

p equals three gives q equals seven. Eight fails, because three and eight don't share a three.

p equals four gives q equals five. Six fails, because four and six share two, not four.

p equals five: q is four, already counted, or five. And five and five do share a five.

Four pairs flip into eight. Add five, five: nine ordered pairs! Fantastic work if you got it.

## Recap

Here's the big idea: count the rectangle's dots, take away the ones on the slant, and split in half.

Then keep the short leg small, and check each case.

I'm Vantee. Keep exploring, and I'll see you next time!

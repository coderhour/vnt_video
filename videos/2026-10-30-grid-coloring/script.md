# Color the Grid: How Many Ways? | AMC 8-Style Level 4

## Intro

Nine squares, three colors, and the center one is already red.

Neighbors can't match. How many ways can we color the rest?

Hi, I'm Vantee! Let's count them together.

## The question

Here's the question.

Each square of this three by three grid is colored red, blue or green.

The center square is red. Squares that share a side must be different colors.

Not every color has to be used. How many colorings are there?

Here are the five choices. Take a good look.

## What are we asked?

Four squares share a side with the center. Let's call them the edge squares.

The other four are the corners. Each corner touches two edge squares, but NOT the center.

We need to count every way to color these eight squares.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: edges first

Welcome back! Let's color the edge squares first. Each one touches red, so it's blue or green.

Two choices, four times. Two times two times two times two is sixteen edge patterns.

Now look at one corner. Say its two edge neighbors are both blue.

It can't be blue. Red is fine, since it doesn't touch the center. So red or green: two options.

Now say its neighbors are blue and green. Both are out, so the corner must be red. Just one option.

So a corner has two options when its neighbors match, and one when they don't.

Let's sort the sixteen edge patterns by how many corners get two options.

First, all four edges match: all blue, or all green. That's two patterns.

Every corner gets two options: sixteen colorings each. Two times sixteen is thirty-two.

Next, the colors take turns around the ring, like a checkerboard. Again, two patterns.

No corner has matching neighbors, so all four corners are red. One coloring each, so that's two.

That leaves twelve patterns. Eight split three and one. Four split two and two, side by side.

Either way, exactly two corners have matching neighbors. So each gives two times two, which is four.

Twelve patterns times four is forty-eight.

Thirty-two, plus forty-eight, plus two, is eighty-two! The answer is D.

## Solution 2: count non-red corners

Here's a second way. Let's sort colorings by how many corners are NOT red.

A red corner is always safe, because edge squares are never red.

A corner that isn't red needs matching neighbors. If they're both blue, it must be green.

No non-red corners: every corner is red, and the edges are free. That's sixteen.

One non-red corner: four to pick. Its two neighbors match: two ways.

The other two edges are free: four ways. Four times two times four is thirty-two.

Two on the same side: four pairs. Three edges match, one is free: four ways each. That's sixteen.

Two opposite corners: two pairs. Each needs its own matching edges: four ways each. That's eight.

Three non-red corners: four to pick, and all edges match. That's eight. All four non-red: two.

Sixteen plus thirty-two plus sixteen plus eight plus eight plus two is eighty-two. It matches!

When would you pick this way? Edges first is quicker. This way is a great double-check.

## Common traps

Now, let's look at the wrong answers. Each one is a trap.

Sixteen counts only the edge patterns. It forgets to color the corners.

Thirty-two is what you'd get if you only kept the patterns where all four edges match.

Eighty-one is three to the fourth, a tempting guess. Or what you'd get if you missed one coloring.

One hundred sixty-two is what you'd get if you doubled eighty-one. That's far too many.

So here's a great habit. When choices depend on the neighbors, split into cases and count each one.

## Your turn: a two by three grid

Ready for a challenge? Here's a two by three grid, with the same three colors.

The middle of the bottom row is red, and neighbors must differ. How many colorings are there?

Pause the video, and go for it!

*(Pause and try it: 12 s countdown)*

## Two by three grid: the answer

Let's check. Three squares touch the red one: bottom left, bottom right, and top middle.

Each is blue or green. Two times two times two is eight patterns.

Each top corner touches the top middle square and one bottom square.

If all three match: two patterns, with two times two, four colorings each. That's eight.

If just one bottom square matches the top middle: four patterns, two colorings each. That's eight.

If neither matches: two patterns, with one coloring each. That's two.

Eight plus eight plus two is eighteen! If you found eighteen, amazing work!

## Recap

Here's the big idea to remember.

Color the squares next to the red center first. Each one is blue or green.

Then a corner gets two options when its neighbors match, and just one when they don't.

I'm Vantee. Keep exploring, and I'll see you next time!

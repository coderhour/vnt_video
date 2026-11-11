# The Halving Game: Who Wins? | AMC 10-Style Level 4

## Intro

Two players race to write zero. The twist: for some numbers, the SECOND player can always win!

Hi, I'm Vantee! Let's crack this game by working up from zero.

## The question

A number n is on the board. On each turn, you take away one, or halve it, rounding down.

Two players take turns. The player who writes zero wins.

For how many n from one to one hundred can the second player always win? Here are the choices.

## What are we asked?

We want the numbers where the player to move is stuck. Let's call them losing numbers.

Our job: count the losing numbers from one to one hundred.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: build a table

Welcome back! Let's start small and make a table.

Red means the player to move loses. Green means the player to move wins.

Zero is red. If zero is on the board at your turn, your opponent already won.

From one, you write zero and win. So one is green.

From two, both moves give one, a green for your opponent. So two is red!

The rule: green if SOME move reaches a red. Red if EVERY move reaches a green.

Three, four and five can each reach two. All green! Six only reaches five or three. Red!

Keep going up to sixteen. The red numbers are two, six, eight, ten and fourteen.

So far, every red number is even. But four, twelve and sixteen are even AND green. Why?

Let's count the twos in each number. Six is two times three. That's one two.

Eight has three twos. But four and twelve have two twos, and sixteen has four.

There's the pattern! Red numbers have an ODD number of twos: one, three, five, and so on.

## Solution 1: why it works

A pattern isn't proof yet. Let's check that it always holds.

Take a red number, like eight. Take away one, and you get an odd number, with zero twos.

Zero is even, so that's green. Or halve it, and you lose exactly one two. Odd turns even: green!

So from a red number, every move hands your opponent a green.

From a green even number, like twelve, halving drops one two. Even turns odd, so six is red!

From an odd number, like thirteen, you can reach twelve, or half of twelve, which is six.

Those two differ by one two, so one count is odd. Hand over that red! From one, just write zero.

## Solution 1: count them

Count the reds by their twos. One two: fifty evens, minus twenty-five multiples of four. Twenty-five!

Three twos: eight, twenty-four, forty, fifty-six, seventy-two, eighty-eight. Six!

Five twos: thirty-two and ninety-six. Seven twos starts at one hundred twenty-eight, too big.

Twenty-five plus six plus two. The answer is thirty-three! Choice C.

## Solution 2: the doubling trick

Here's a slicker way to count. What happens when you double a number?

Doubling adds exactly one two. So it flips the count from odd to even, or even to odd.

So the reds up to one hundred are exactly the doubles of the greens up to fifty.

And the greens up to fifty are fifty, minus the reds up to fifty.

Use the same trick again and again, halving and rounding down: fifty, twenty-five, twelve, six, three, one. The signs take turns.

Fifty minus twenty-five, plus twelve, minus six, plus three, minus one. Thirty-three again!

It's handy when the range is huge, like one to a million.

## Common traps

Choice A, twenty-five, is what you'd get if you only counted numbers with exactly one two.

Choice B, thirty-one, is what you'd get if you missed thirty-two and ninety-six. Five twos is odd too!

Choice D, thirty-four, is what you'd get if you counted one as red. But from one, you write zero and win.

Choice E, fifty, is what you'd get if every even number were red. But four goes to two, so four is green.

So here's a great habit. Always build a table first, then trust the pattern only after you prove it.

## Your turn: one to two hundred

Your turn: same game, from one to two hundred. How many can the second player always win?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## Two hundred: the answer

Halve two hundred again and again: one hundred, fifty, twenty-five, twelve, six, three, one.

One hundred minus fifty, plus twenty-five, minus twelve, plus six, minus three, plus one. That's sixty-seven!

Check by groups: fifty, plus thirteen, plus three, plus one more for the number one hundred twenty-eight. Sixty-seven!

## Recap

The big idea: in a take-turns game, find the losing spots for small numbers. Spot a pattern.

Then prove it: every move from red goes to green, and some move from green goes to red.

I'm Vantee. Keep exploring, and I'll see you next time!

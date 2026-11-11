# Nine Lights, How Many Patterns? | AMC 10-Style Level 4

## Intro

Nine lights, each on or off.

Count each row and column alone, and you get three hundred eighty-four. Too many!

Hi, I'm Vantee! Let's learn to count overlaps without counting twice.

## The question

Each light in a three by three grid of nine lights is on or off.

How many on and off patterns have at least one full row, or at least one full column, of lights on?

Here are the choices.

## What are we asked?

A pattern wins if some row is all on, or some column is all on. Or both!

Each light has two choices. So there are two to the ninth, five hundred twelve patterns in all.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: count the losers

Welcome back! Let's count the losers: patterns with no full row and no full column.

Start with rows. One row of three lights has two times two times two, eight patterns.

Only one of those eight is all on. So each row has seven safe choices.

Seven times seven times seven. That's three hundred forty-three patterns with no full row.

But some of those still have a full column. Let's find them.

Say column one is full. Then every row has its first light on.

The other two can't both be on, or that row is full. That leaves three choices per row.

Three times three times three is twenty-seven. Each column gives twenty-seven, so eighty-one.

Careful! Patterns with two full columns, third column off, got counted twice.

So subtract each one once. There are three.

Three full columns would fill the rows, so they never appear. Eighty-one minus three: seventy-eight.

So the losers are three hundred forty-three minus seventy-eight. That's two hundred sixty-five.

Those are the patterns with NO full row or column. That's not our answer yet!

Take them from all five hundred twelve.

Five hundred twelve minus two hundred sixty-five is two hundred forty-seven! Choice B.

## Solution 2: inclusion and exclusion

Now a second way: inclusion and exclusion. Each row or column gets its own group of patterns.

Fix one row or column all on. The other six lights are free. Two to the sixth power is sixty-four.

Six of them, sixty-four each, is three hundred eighty-four. But overlaps got counted more than once!

So subtract each pair. Two rows, or two columns, leave three free lights: eight patterns.

A row and a column make a cross of five lights. Four are free, so sixteen patterns.

Six row or column pairs give forty-eight. Three times three crosses give one hundred forty-four.

A pattern in three groups was added three times, then taken away three times.

That's zero! So add the triples back.

Two rows and a column light seven lights. Two are free: four patterns. Nine such groups: thirty-six.

A row and two columns give thirty-six more. Plus all rows, and all columns. That's seventy-four.

Keep flipping signs. Two rows and two columns leave one free light. Nine ways, times two: eighteen.

Three rows and a column, or a row and three columns, light everything. Six more: twenty-four.

Groups of five, and all six, light every light. That's six, and then one.

Put it together. Three hundred eighty-four minus one hundred ninety-two, plus seventy-four, minus twenty-four, plus six, minus one. That's two hundred forty-seven again!

When would you pick this one? Here, counting losers is shorter. But this works for ANY overlaps.

## Common traps

Choice A, one hundred sixty-nine, is just the full rows.

Choice C, two hundred sixty-five, is the losers. You forgot to subtract from five hundred twelve.

Choice D, three hundred thirty-eight, is one hundred sixty-nine for rows, plus the same for columns.

Patterns with both get counted twice.

E, three hundred eighty-four, is six times sixty-four, with no overlaps taken away.

So here's a great habit. When groups overlap, ask: did I count anything twice?

## Your turn: two rows of three

Ready for a challenge? Now there are six lights, in two rows of three.

How many patterns have at least one full row, or at least one full column?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## Two rows of three: the answer

Count the losers. Each row has seven safe choices. Seven times seven is forty-nine with no full row.

If column one is full, each row has three choices left. Three times three is nine.

Three columns give twenty-seven. Take away three with two full columns. That's twenty-four.

So the losers are forty-nine minus twenty-four, which is twenty-five.

There are two to the sixth, sixty-four patterns in all. Minus twenty-five is thirty-nine!

## Recap

The big idea: add the groups, subtract the pairs, add back the triples, and keep alternating.

Then every pattern is counted exactly once. Or count the losers, and subtract from the total.

I'm Vantee. Keep exploring, and I'll see you next time!

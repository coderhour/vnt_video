# Double n, Double the Zeros? | AMC 10-Style Level 4

## Intro

Ten factorial ends in two zeros. Twenty factorial ends in four. Twice as many!

But eight factorial ends in one zero, and sixteen factorial ends in THREE.

Hi, I'm Vantee! Let's find out exactly when doubling works.

## The question

Here's the question. n factorial means one times two times three, all the way up to n.

For how many whole numbers n, from one to one hundred, does this happen?

The factorial of two n ends in exactly twice as many zeros as n factorial.

Here are the five choices. Take a good look.

## What are we asked?

So we sort every n into two groups. Doubling works, or it doesn't.

Ten works. Eight doesn't, because three is more than twice one. We need a rule.

Our job: count how many numbers, from one to one hundred, land in the works group.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: count the fives

Welcome back! Each zero at the end is a factor of ten, and ten is two times five.

A factorial has way more twos than fives. So we just count the fives.

Every multiple of five gives one five. That's n over five, rounded down.

Every multiple of twenty-five gives one extra five. That's n over twenty-five, rounded down.

The factorial of two n goes up to two hundred. So it also gets a one hundred twenty-five term.

Now the key question. Does doubling n double each rounded-down term?

Eight over five is one, remainder three. Double it: sixteen over five is three. Not two, but THREE!

The remainder three doubled to six. Six is at least five, so it spills one extra five.

Now try seven. The remainder two doubles to four. No spill, so one becomes exactly two.

So the fives term doubles exactly when the remainder is zero, one or two.

Same for twenty-five. That term doubles exactly when the remainder is twelve or less.

A term never comes out short. So for exactly twice the zeros, no term may spill.

n factorial has no one hundred twenty-five term, so two n factorial can't have one either: two n is under one hundred twenty-five, so n is at most sixty-two.

Let's lay out the numbers in rows of twenty-five, and keep only the ones that pass.

Rule one: the remainder by five is zero, one or two. Keep three columns out of every five.

Rule two: the remainder by twenty-five is twelve or less. Keep the left part of each row.

Rule three: n is at most sixty-two. Cross out everything after that.

One and two count too. Two factorial and four factorial have no zeros, and twice zero is zero.

The first row keeps eight, since n starts at one. The next two rows keep nine each.

Eight plus nine plus nine is twenty-six! Choice C.

## Solution 2: base five

Here's a faster way. Write n in base five, with ones, fives and twenty-fives.

Thirty-seven is twenty-five, plus two fives, plus two ones. In base five, that's one, two, two.

Rule one says the ones digit is at most two.

Rule two then says the fives digit is at most two. Three fives would already pass twelve.

And sixty-two in base five is two, two, two. So every digit is zero, one or two.

Three choices for each of three digits. Three times three times three is twenty-seven.

Drop zero, zero, zero, since n starts at one. Twenty-six again!

When would you pick this one? When doubling meets fives, think base five, with no carries.

## Common traps

Each wrong answer is a trap. Choice A, twenty, is what you'd get from the multiples of five.

B, twenty-four, is what you'd get if you skipped one and two. But they count!

D, thirty, is what you'd get if you used the last digit in base ten, ending in zero, one or two.

Choice E, fifty, is what you'd get if you thought doubling works half the time. The rules are stricter.

So here's a great habit. When you double a rounded-down number, check the remainder.

## Your turn: triple it

Your turn! For how many n from one to one hundred does three n factorial end in exactly three times as many zeros as n factorial?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## Triple it: the answer

Three times the remainder must stay under five. So the remainder by five is zero or one.

By twenty-five, the remainder must be eight or less. Three times nine is too big.

And three n must stay under one hundred twenty-five. So n is at most forty-one.

Just like before, every base-five digit is zero or one. Two times two times two is eight.

Drop the zero, and that's seven!

## Recap

The big idea: count the fives, as a sum of rounded-down terms.

Doubling keeps a term exactly double when its remainder is less than half the divisor. No spills!

I'm Vantee. Keep exploring, and I'll see you next time!

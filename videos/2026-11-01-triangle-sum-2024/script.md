# Smallest n So 1+2+…+n Is a Multiple of 2024 | AMC 10-Style Level 4

## Intro

Keep adding one plus two plus three. When is the total a multiple of two thousand twenty-four?

Adding it all up would take forever. But a neat trick with neighbors finds it fast.

Hello, I'm Vantee, and today we're hunting for a number!

## The question

Find the smallest positive whole number n,

so that one plus two plus three, up to n, is divisible by two thousand twenty-four.

Here are the five choices. Take a good look.

## What are we asked?

So what do we know? We add every whole number from one to n.

The total must split into groups of two thousand twenty-four exactly. And we want the SMALLEST n.

## Try it yourself

Now it's your turn. Pause the video and give it a go. I'll wait!

*(Pause and try it: 10 s countdown)*

## Solution 1: share out the factors

Welcome back! First, a shortcut for the sum. Write the numbers forward, then backward underneath.

Each column adds to n plus one, and there are n columns.

That counts every number twice, so the sum is half of n times n plus one.

So half of n times n plus one must be divisible by two thousand twenty-four.

Undo the halving: n times n plus one must be divisible by twice that, four thousand forty-eight.

That's sixteen times eleven times twenty-three. Sixteen is four factors of two; the others are primes.

Here's the key. n and n plus one are neighbors, and one of them is odd. It has no factor of two.

So all four factors of two, the whole sixteen, must live in the even one.

Could eleven divide both neighbors? Then it would divide their difference, which is just one.

So eleven goes whole into one neighbor, and so does twenty-three.

We just choose which tiles share a box. That gives four piles to check.

Pile one: sixteen and eleven together, a multiple of one hundred seventy-six. Check both neighbors.

One hundred seventy-six: neither neighbor is a multiple of twenty-three.

Now three hundred fifty-two. No luck again.

Five hundred twenty-eight: its neighbor five hundred twenty-nine is twenty-three times twenty-three!

So five hundred twenty-eight works! Keep it, and check the other piles.

Pile two: sixteen and twenty-three, so three hundred sixty-eight. Neither neighbor has an eleven.

Next, seven hundred thirty-six. Its neighbor seven hundred thirty-seven is eleven times sixty-seven.

It works, but it's bigger than five hundred twenty-eight.

Pile three: eleven and twenty-three together, a multiple of two hundred fifty-three.

Two hundred fifty-three and five hundred six: none of their neighbors is a multiple of sixteen.

The next is seven hundred fifty-nine, already past five hundred twenty-eight. We can stop.

Pile four: all three together means four thousand forty-eight. Far too big.

So the smallest n is five hundred twenty-eight. That's Choice C!

## Solution 2: test the choices

Faster on test day: check the choices, smallest first, and take half of the even number.

We need eight, eleven and twenty-three. With two hundred fifty-three, the sum is odd!

Four hundred eighty-three times two hundred forty-two has just one factor of two. Not enough!

Five hundred twenty-eight gives two hundred sixty-four times five hundred twenty-nine.

That's eight times three times eleven, times twenty-three times twenty-three. Everything's there!

So five hundred twenty-eight is the smallest CHOICE that works. Solution one proves no n is smaller.

When would you pick this way? On a timed test, with the choices right in front of you.

## Common traps

Choice A, two hundred fifty-three, is what you'd get by using just the eleven and twenty-three.

Choice E, one thousand twelve, is half of two thousand twenty-four. Its sum has one factor of two.

Choice B, four hundred eighty-three, has the twenty-three; its neighbor, the eleven. But not the eight!

Choice D, seven hundred thirty-six, really works! But it's pile two's answer, not the SMALLEST.

## Your turn: 2025

What is the smallest n so that one plus two, up to n, is divisible by two thousand twenty-five?

Pause the video, and go for it!

*(Pause and try it: 10 s countdown)*

## 2025: the answer

Let's check. Undo the halving: n times n plus one must be divisible by four thousand fifty.

That's two times eighty-one times twenty-five. The two is free, since one neighbor is always even.

Eighty-one and twenty-five each go whole into a neighbor. Both in one is far too big.

So walk the multiples of eighty-one: eighty-one, one hundred sixty-two, two hundred forty-three.

None of their neighbors is a multiple of twenty-five.

Three hundred twenty-four: its neighbor three hundred twenty-five is twenty-five times thirteen!

So n is three hundred twenty-four. If you got it, amazing work!

## Recap

Neighbors share no factor bigger than one, so each prime power goes whole into one of them.

Sort the pieces into piles, count up the multiples, and check the neighbors.

I'm Vantee. Keep exploring, and I'll see you next time!

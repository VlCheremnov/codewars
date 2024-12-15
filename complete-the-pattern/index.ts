/*
Task:
You have to write a function pattern which returns the following Pattern(See Pattern & Examples) upto n number of rows.

Note:Returning the pattern is not the same as Printing the pattern.
Rules/Note:
If n < 1 then it should return "" i.e. empty string.
There are no whitespaces in the pattern.
* */

export function pattern(n: number): string {
	return Array.from({ length: n }, (_, i) => {
		const number = i + 1
		return `${ number }`.repeat(number)
	}).join('\n')
}

console.log('pattern(2)', pattern(2))

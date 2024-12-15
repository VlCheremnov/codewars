export function pattern(n: number): string {
	return Array.from({ length: n }, (_, i) => {
		const number = i + 1
		return `${ number }`.repeat(number)
	}).join('\n')
}

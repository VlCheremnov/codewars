const isEven = (integer: number): boolean => {
	return !(integer % 2)
}

export const main = (integers: number[]) => {
	const evenIntegers = integers
		.slice(0, 3)
		.filter((integer) => isEven(integer))
		.length

	const isEvenArray: boolean = evenIntegers >= 2

	return integers.find((integer) => (!isEvenArray) ? isEven(integer) : !isEven(integer))
}

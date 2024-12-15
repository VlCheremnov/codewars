/*
You are given an array (which will have a length of at least 3, but could be very large) containing integers. The array is either entirely comprised of odd integers or entirely comprised of even integers except for a single integer N. Write a method that takes the array as an argument and returns this "outlier" N.

Examples
[2, 4, 0, 100, 4, 11, 2602, 36] -->  11 (the only odd number)

[160, 3, 1719, 19, 11, 13, -21] --> 160 (the only even number)
* */

const isEven = (integer: number): boolean => {
	return !(integer % 2)
}

const main = (integers: number[]) => {
	const isEvenArray: boolean = integers.slice(0, 3).filter((integer) => isEven(integer)).length >= 2
	return integers.find((integer) => (!isEvenArray) ? isEven(integer) : !isEven(integer))
}

console.log(main([0, 1, 2]))
console.log(main([1, 2, 3]))
console.log(main([2, 6, 8, 10, 3]))
console.log(main([0, 0, 3, 0, 0]))
console.log(main([1, 1, 0, 1, 1]))
console.log(main([0, 1, 1, 1, 1]))

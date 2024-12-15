import { MORSE_CODE, DECODE_MAP } from './constants'

export const decodeBits = (bits: string) => {
	let bitsArray: string[] | null = bits.replace(/^0+|0+$/g, '').match(/0+|1+/g)

	if (!bitsArray?.length) {
		return ''
	}

	const bitLength = Math.min(...bitsArray.map((bit) => bit.length))

	return bitsArray
		.map((bit) =>
			bit.slice(0, bit.length / bitLength)
		)
		.map((bit) => DECODE_MAP[bit] || '')
		.join('')
};

export const decodeMorse = (morseCode: string) => {

	return morseCode
		.split('   ')
		.map((word) =>
			word
				.split(' ')
				.map((symbol) => MORSE_CODE[symbol])
				.join('')
		)
		.join(' ');
};



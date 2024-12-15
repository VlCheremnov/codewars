import assert from 'assert'
import { decodeBits, decodeMorse } from './index'

const bits = '1100110011001100000011000000111111001100111111001111110000000000000011001111110011111100111111000000110011001111110000001111110011001100000011'

describe('Decode', () => {
	it('decode bits', () => {
		assert.strictEqual(decodeBits(bits), '.... . -.--   .--- ..- -.. .')
	})
	it('decode morse', () => {
		assert.strictEqual(decodeMorse(decodeBits(bits)), 'HEY JUDE')
	})
})

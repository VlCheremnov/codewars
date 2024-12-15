import assert from 'assert'
import { pattern } from './index'


describe('pattern', () => {
	it('complete pattern', () => {
		assert.strictEqual(pattern(2), '1\n22')
		assert.strictEqual(pattern(0), '')
		assert.strictEqual(pattern(-1), '')
		assert.strictEqual(pattern(5), '1\n22\n333\n4444\n55555')
	})
})

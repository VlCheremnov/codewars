import assert from 'assert'
import { main } from './index'

describe('pattern', () => {
	it('complete pattern', () => {
		assert.strictEqual(main([0, 1, 2]), 1)
		assert.strictEqual(main([1, 2, 3]), 2)
		assert.strictEqual(main([2, 6, 8, 10, 3]), 3)
		assert.strictEqual(main([0, 0, 3, 0, 0]), 3)
		assert.strictEqual(main([1, 1, 0, 1, 1]), 0)
		assert.strictEqual(main([0, 1, 1, 1, 1]), 0)
	})
})

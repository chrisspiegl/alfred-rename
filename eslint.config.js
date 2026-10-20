import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'app',
  // node:test is the runner. The default preset rewrites those imports to vitest.
  test: false,
})

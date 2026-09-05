// Wrapper kept for backwards-compatibility with action.yml.
// @actions/core is ESM-only, so src/run.js loads it dynamically.
const { main } = require('../src/run');

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exitCode = 1;
});

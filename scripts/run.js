// Wrapper kept for backwards-compatibility with action.yml
const core = require('@actions/core');
const { main } = require('../src/run');

main().catch((e) => {
  core.setFailed(e instanceof Error ? e.message : String(e));
});


# Contributing

Feel free to submit any new features via Pull Request.
Make sure the supplied tests still work and to add own test cases to cover your code.

## Commit message hook

This project uses Commizen for consistent commit message formatting.

Please run the following command to setup the Commitizen commit message hook:

```shell script
echo '#!/bin/bash
exec < /dev/tty && node_modules/.bin/git-cz --hook || true' > .git/hooks/prepare-commit-msg && chmod +x .git/hooks/prepare-commit-msg
```
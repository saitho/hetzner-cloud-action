# my-npm-package

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This is a template for a new NPM package.

## Features

* **PNPM** as more efficient Node dependency manager
* **TypeScript**
* Tests via **jest**
* Generated code documentation via **TypeDoc**
* **SonarCloud** integration
* **[Semantic Release](https://github.com/semantic-release/semantic-release)** for fast releases
* **Commitizen** for consistent commits
* CI configurations for **TravisCI** and **Drone CI**

## Using this template

If you want to use this template as basis of a new project, please make sure to do the following:

1. Adjust package.json (package name, description, keywords, repository url)
2. Copy the CI configuration you want to use from .ci folder into the project root
3. Set `sonar.organization` in sonar-project.properties and `sonarcloud.organization` in TravisCI configuration (if you're using it)
4. If this package should be private, remove _.npmrc_ file
5. Remove sample files or adjust them

## Setting up CI

Make sure to create the following environment variables:

* SONAR_TOKEN: access token for SonarCloud (required for code analysis)
* NPM_TOKEN: access token for NPM (required for publishing packages)
* GH_TOKEN: access token for GitHub (required for publishing releases)

If you are using TravisCI, you can use **[semantic-release-cli](https://github.com/semantic-release/cli)** for setting up the NPM and GitHub tokens.
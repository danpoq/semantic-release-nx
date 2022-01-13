# semantic-release-nx

[![Build Status](https://travis-ci.org/danpoq/semantic-release-nx.svg?branch=main)](https://travis-ci.org/danpoq/semantic-release-nx) [![npm](https://img.shields.io/npm/v/semantic-release-nx.svg)](https://www.npmjs.com/package/semantic-release-nx) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Apply [`semantic-release`'s](https://github.com/semantic-release/semantic-release) automatic publishing to a monorepo managed by [Nx](https://github.com/nrwl/nx).

## Why

This library is a fork of `semantic-release-monorepo`, which allows you to use `semantic-release` with a single repository containing many `npm` packages, with configuration for use in an Nx workspace.

We want to attribute only commits that affect the package being released with `semantic-release`.

`semantic-release-monorepo` filters analyzed commits by package path. However, Nx builds apps/libraries in a `dist` folder whilst commits are being made to files in `apps` or `libs`.

## How

Instead of attributing all commits to a single package, commits are assigned to packages based on the files that a commit touched.

If a commit touched a file in an Nx project, it will be considered for that package's next release. A single commit can belong to multiple packages and may trigger the release of multiple packages.

In order to avoid version collisions, generated git tags are namespaced using the given package's name: `<package-name>-<version>`.

## Install

Add `semantic-release` and `semantic-release-nx` to your Nx repo.

```sh
yarn add semantic-release semantic-release-nx --dev
```

## Usage

1. Add a `release` target for the packages that you want to semantically release.
2. Run `semantic-release` in the executor commands and apply `semantic-release-nx` via the [`extends`](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#extends) option. You can pass in your own [configuration](https://semantic-release.gitbook.io/semantic-release/usage/configuration#options) here.

```json
{
  "projects": {
    "<my-lib>": {
      "targets": {
        "release": {
          "executor": "@nrwl/workspace:run-commands",
          "dependsOn": [{ "target": "build", "projects": "self" }],
          "options": {
            "commands": [
              {
                "command": "semantic-release -e semantic-release-nx",
                "cwd": "dist/libs/<my-lib>"
              }
            ]
          }
        }
      }
    }
  }
```

3. Add `"nx release"` to your CI.

You can release all affected packages with:

```sh
nx affected --target=release
```

## Advanced

This library modifies the `context` object passed to `semantic-release` plugins in the following way to make them compatible with an Nx workspace.

| Step             | Description                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `analyzeCommits` | Filters `context.commits` to only include the given monorepo package's commits.                                                                                                                                                                                                                                                                                                                                                  |
| `generateNotes`  | <ul><li>Filters `context.commits` to only include the given monorepo package's commits.</li><li>Modifies `context.nextRelease.version` to use the [monorepo git tag format](#how). The wrapped (default) `generateNotes` implementation uses this variable as the header for the release notes. Since all release notes end up in the same Github repository, using just the version as a header introduces ambiguity.</li></ul> |

### tagFormat

Pre-configures the [`tagFormat` option](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#tagformat) to use the [monorepo git tag format](#how).

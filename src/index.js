const readPkg = require('read-pkg');
const { compose } = require('ramda');
const withOnlyPackageCommits = require('./only-package-commits');
const versionToGitTag = require('semantic-release-monorepo/src/version-to-git-tag');
const logPluginVersion = require('semantic-release-monorepo/src/log-plugin-version');
const { wrapStep } = require('semantic-release-plugin-decorators');
const {
  mapNextReleaseVersion,
  withOptionsTransforms,
} = require('semantic-release-monorepo/src/options-transforms');

const analyzeCommits = wrapStep(
  'analyzeCommits',
  compose(logPluginVersion('analyzeCommits'), withOnlyPackageCommits),
  {
    wrapperName: 'semantic-release-nx',
  }
);

const generateNotes = wrapStep(
  'generateNotes',
  compose(
    logPluginVersion('generateNotes'),
    withOnlyPackageCommits,
    withOptionsTransforms([mapNextReleaseVersion(versionToGitTag)])
  ),
  {
    wrapperName: 'semantic-release-nx',
  }
);

const success = wrapStep(
  'success',
  compose(
    logPluginVersion('success'),
    withOnlyPackageCommits,
    withOptionsTransforms([mapNextReleaseVersion(versionToGitTag)])
  ),
  {
    wrapperName: 'semantic-release-nx',
  }
);

const fail = wrapStep(
  'fail',
  compose(
    logPluginVersion('fail'),
    withOnlyPackageCommits,
    withOptionsTransforms([mapNextReleaseVersion(versionToGitTag)])
  ),
  {
    wrapperName: 'semantic-release-nx',
  }
);

module.exports = {
  analyzeCommits,
  generateNotes,
  success,
  fail,
  tagFormat: readPkg.sync().name + '-v${version}',
};

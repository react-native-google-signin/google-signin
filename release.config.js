const join = require('path').join;
const readFileSync = require('fs').readFileSync;

module.exports = {
  branches: ['master'],
  plugins: [
    '@semantic-release/commit-analyzer',
    [
      '@semantic-release/release-notes-generator',
      {
        writerOpts: {
          footerPartial: readFileSync(
            join(__dirname, '.github/footer.hbs'),
            'utf-8',
          ),
        },
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: 'package.json',
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};

const path = require('path');
const fs = require('fs-extra');
const watch = require('node-watch');
const rimraf = require('rimraf');
const minimatch = require('minimatch');

function log(cmd, ...args) {
  console.log(cmd.padEnd(11, '.') + ':', ...args);
}

function copyAndWatch(source, destination, fileGlob) {
  const logging_source = path.relative('.', source);
  const logging_dest = path.relative('.', destination);

  log('Cleaning', logging_dest);
  rimraf(destination, () => {
    log('Copying', `"${logging_source}" to "${logging_dest}"`);
    fs.copy(source, destination, err => {
      if (err) console.error(err);
    });

    log('Watching', logging_source);
    watch(source, (_, filename) => {
      const localPath = filename.split(source).pop();
      if (matchesFile(localPath, fileGlob)) {
        const destinationPath = `${destination}${localPath}`;
        log('Copying', `"${filename}" to "${destinationPath}"`);
        fs.copy(filename, destinationPath, err => {
          if (err) console.error(err);
        });
      }
    });
  });
}

function matchesFile(filename, fileGlob) {
  if (fileGlob == null) return true;
  return minimatch(path.basename(filename), fileGlob);
}

// only JavaScript files need to be copied over
// the iOS and Android example projects can edit the native module directly
const SRC_DIR = path.resolve('../src');
const DEST_DIR = path.resolve('./node_modules/react-native-google-signin/src');

// Remove DEST_DIR/../example dir since it messes up with hastemap module resolver
const EXAMPLE_DIR = path.resolve(DEST_DIR, '..', 'example');
log('Cleaning', path.relative('.', EXAMPLE_DIR));
fs.removeSync(EXAMPLE_DIR);
log('Cleaned', path.relative('.', EXAMPLE_DIR));

// Start watcher
copyAndWatch(SRC_DIR, DEST_DIR);

const express = require('express'),
  p = require('path'),
  chokidar = require('chokidar'),
  chalk = require('chalk'),
  fs = require('fs'),
  dayjs = require('dayjs'),
  { spawn } = require('child_process'),
  nocache = require('nocache');

const port = 8200;
const disableCache = true;

const app = express();

if (disableCache) {
  app.use(nocache())
  app.set('etag', false)
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
}

chokidar.watch('./server/components/**/*.vue').on('all', (event, path) => {
  path = path.replace(/\\/g, '/');
  const outputFile = path.split('.')[0];
  if (event == 'unlink') {
    if (fs.existsSync(outputFile + '.umd.min.js')) {
      fs.unlinkSync(outputFile + '.umd.min.js');
      fs.unlinkSync(outputFile + '.umd.min.js.map');
      console.log(dayjs().format('HH:mm:ss') + ' - ' + chalk.green.blue('Cleared: ') + p.basename(path));
    }
  } else {
    var child = spawn('npx vue-cli-service build --target lib --formats umd-min --no-clean --dest ' + p.dirname(path) + ' --name "' + p.basename(path).split('.')[0] + '" ' + path, {
      shell: true
    });
    child.on('exit', function (exitCode) {
      if (exitCode === 0) {
        console.log(dayjs().format('HH:mm:ss') + ' - ' + chalk.green.bold('Compiled: ') + p.basename(path) + ' -> ' + p.basename(path).split('.')[0] + '.umd.min.js');
      }
    });
  }
});

app.get('*', (req, res) => {
  const componentPath = p.join(__dirname, 'components', req.path);
  if (fs.existsSync(componentPath)) {
    res.sendFile(componentPath)
  } else {
    res.status(404).send('Component not found');
  }
})

app.listen(port);

// eslint-disable-next-line no-console
console.log(chalk.magenta.bold('Vue Component Repository'))
console.log(`Listening on: http://localhost:${port}`);

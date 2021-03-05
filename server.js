const http = require('http');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');
const mqtt = require('./src/util/mqtt.util');
const app = require('./src/app');
const logger = require('./src/util/logger.util');
const time = require('./src/util/time.util');
const constants = require('./src/constants');

const { PORT, STORAGE_PATH } = constants;

logger.log(`Frigate Events started @ ${time.current()}`, {
  dashes: true,
});
logger.log(constants);

http.Server(app).listen(PORT, () => {
  logger.log(`listening on 0.0.0.0:${PORT}`, { verbose: true });
});

mqtt.connect();

if (!fs.existsSync(`${STORAGE_PATH}/matches`)) {
  fs.mkdirSync(`${STORAGE_PATH}/matches`, { recursive: true });
}
if (!fs.existsSync(`${STORAGE_PATH}/names`)) {
  fs.mkdirSync(`${STORAGE_PATH}/names`, { recursive: true });
}

schedule.scheduleJob({ hour: 4, minute: 0 }, () => {
  logger.log('purging local matched images');
  fs.readdir(`${STORAGE_PATH}/matches`, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      // eslint-disable-next-line no-shadow
      fs.unlink(path.join(`${STORAGE_PATH}/matches`, file), (err) => {
        if (err) throw err;
      });
    }
  });
});

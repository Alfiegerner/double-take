const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');
const logger = require('./logger.util');
const { STORAGE } = require('../constants');

module.exports.folders = () => {
  return {
    matches: async () => {
      let folders = await fs.promises.readdir(`${STORAGE.PATH}/matches`, { withFileTypes: true });
      folders = folders
        .filter((file) => file.isDirectory() && file.name !== 'unknown')
        .map((file) => file.name);
      return folders;
    },
    train: async () => {
      let folders = await fs.promises.readdir(`${STORAGE.PATH}/train`, { withFileTypes: true });
      folders = folders.filter((file) => file.isDirectory()).map((file) => file.name);
      return folders;
    },
  };
};

module.exports.files = () => {
  return {
    traverse: async (path) => {
      const output = [];
      let folders = await fs.promises.readdir(`${STORAGE.PATH}/${path}`, { withFileTypes: true });
      folders = folders.filter((file) => file.isDirectory()).map((file) => file.name);

      for (const folder of folders) {
        let images = await fs.promises.readdir(`${STORAGE.PATH}/${path}/${folder}`, {
          withFileTypes: true,
        });
        images = images
          .filter((file) => file.isFile())
          .map((file) => file.name)
          .filter(
            (file) =>
              file.toLowerCase().includes('.jpeg') ||
              file.toLowerCase().includes('.jpg') ||
              file.toLowerCase().includes('.png')
          );
        images.forEach((filename) => {
          const { birthtime } = fs.statSync(`${STORAGE.PATH}/${path}/${folder}/${filename}`);
          output.push({ name: folder, filename, key: `${path}/${folder}/${filename}`, birthtime });
        });
      }
      return output.sort((a, b) => (a.birthtime < b.birthtime ? 1 : -1));
    },
    train: async () => {
      return this.files().traverse('train');
    },
    matches: async () => {
      return this.files().traverse('matches');
    },
  };
};

module.exports.writer = async (file, data) => {
  fs.writeFileSync(file, data);
};

module.exports.writerStream = async (stream, file) => {
  return new Promise((resolve) => {
    const out = fs.createWriteStream(file);
    stream.pipe(out);
    out
      .on('finish', () => {
        resolve();
      })
      .on('error', (error) => {
        logger.log(`writer error: ${error.message}`);
      });
  });
};

module.exports.writeMatches = (name, source, destination) => {
  try {
    if (!fs.existsSync(`${STORAGE.PATH}/matches/${name}`)) {
      fs.mkdirSync(`${STORAGE.PATH}/matches/${name}`);
    }
    fs.copyFile(source, destination, (error) => {
      if (error) {
        logger.log(`write match error: ${error.message}`);
      }
    });
  } catch (error) {
    logger.log(`create match folder error: ${error.message}`);
  }
};

module.exports.copy = (source, destination) => {
  fs.copyFile(source, destination, (error) => {
    if (error) {
      logger.log(`copy file error: ${error.message}`);
    }
  });
};

module.exports.delete = (destination) => {
  try {
    if (fs.existsSync(destination)) {
      fs.unlinkSync(destination);
    }
  } catch (error) {
    logger.log(`delete error: ${error.message}`);
  }
};

module.exports.move = (source, destination) => {
  try {
    if (fs.existsSync(source)) {
      fs.renameSync(source, destination);
    }
  } catch (error) {
    logger.log(`move error: ${error.message}`);
  }
};

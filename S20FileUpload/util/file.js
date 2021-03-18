const fs = require("fs");
const path = require("path");

const rootPath = path.dirname(require.main.filename);
exports.deleteFile = (filePath) => {
  fs.unlink(path.join(rootPath, filePath), (err) => {
    if (err) {
      throw err;
    }
  });
};

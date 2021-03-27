const fs = require("fs");
const path = require("path");

const rootPath = path.dirname(require.main.filename);
exports.deleteFile = (filePath, next) => {
  fs.unlink(path.join(rootPath, filePath), (err) => {
    if (err) {
      next(err); //Improve for the case where the file is not longer on the server before deleting (passing next(err))
    }
  });
};

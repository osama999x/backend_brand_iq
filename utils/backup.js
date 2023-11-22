var fs = require("fs");
var _ = require("lodash");
const { stringToDate } = require("./stringToData");
const { empty } = require("./empty");
var exec = require("child_process").exec;
//const path = require("../public/database");

var dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: "admin",
  pass: "admin123",
  authSource: "admin",
  database: "MSAFA-qa",
  autoBackup: true,
  removeOldBackup: true,
  keepLastDaysBackup: 2,
  host: "20.212.227.60",
  port: 27017,
  autoBackupPath: __dirname + "../public/",
};

// Auto backup script
exports.dbAutoBackUp = function () {
  console.log("Running auto backup job...");
  // check for auto backup is enabled or disabled
  if (dbOptions.autoBackup == true) {
    var date = new Date();
    var beforeDate, oldBackupDir, oldBackupPath;
    currentDate = stringToDate(date); // Current date
    var newBackupDir =
      currentDate.getFullYear() +
      "-" +
      (currentDate.getMonth() + 1) +
      "-" +
      currentDate.getDate();
    var newBackupPath = dbOptions.autoBackupPath + "mongodump-" + newBackupDir; // New backup path for current backup process
    console.log("new backup path", newBackupPath);
    // check for remove old backup after keeping # of days given in configuration
    if (dbOptions.removeOldBackup == true) {
      beforeDate = _.clone(currentDate);
      beforeDate.setDate(beforeDate.getDate() - dbOptions.keepLastDaysBackup); // Substract number of days to keep backup and remove old backup
      oldBackupDir =
        beforeDate.getFullYear() +
        "-" +
        (beforeDate.getMonth() + 1) +
        "-" +
        beforeDate.getDate();
      oldBackupPath = dbOptions.autoBackupPath + "mongodump-" + oldBackupDir; // old backup(after keeping # of days)
      console.log("Old backup path: ", oldBackupPath);
    }
    var cmd =
      "mongodump --host " +
      dbOptions.host +
      " --port " +
      dbOptions.port +
      " --db " +
      dbOptions.database +
      " --username " +
      dbOptions.user +
      " --password " +
      dbOptions.pass +
      " --out " +
      newBackupPath; // Command for mongodb dump process
    console.log("Command: ", cmd);
    exec(cmd, function (error, stdout, stderr) {
      if (empty(error)) {
        console.log("Backup successful!");
        // check for remove old backup after keeping # of days given in configuration
        if (dbOptions.removeOldBackup == true) {
          if (fs.existsSync(oldBackupPath)) {
            exec("rm -rf " + oldBackupPath, function (err) {});
          }
        }
      } else {
        console.log("Backup failed:", error);
      }
    });
  }
};

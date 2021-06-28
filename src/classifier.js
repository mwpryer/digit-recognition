const { spawn } = require("child_process");

const classify = (data) => {
  return new Promise((resolve, reject) => {
    let py = spawn("python", ["classifier.py"], { cwd: __dirname });
    let res = "";

    py.stdout.on("data", (stdout) => {
      res += stdout.toString();
    });

    py.on("close", () => {
      resolve(res);
    });

    py.on("error", (err) => {
      reject(err);
    });

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();
  });
};

module.exports = classify;

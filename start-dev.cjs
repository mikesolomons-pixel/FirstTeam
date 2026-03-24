const { spawn } = require("child_process");
const child = spawn(
  "npx",
  ["next", "dev", "--turbopack", "--port", "3001"],
  {
    stdio: "inherit",
    cwd: "C:\\Users\\Mikes\\OneDrive\\Desktop\\FirstTeam",
    shell: true,
    env: { ...process.env, PATH: "C:\\Program Files\\nodejs;" + process.env.PATH }
  }
);
child.on("exit", (code) => process.exit(code || 0));

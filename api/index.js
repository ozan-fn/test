const { spawn } = require("child_process");

const port = process.env.PORT || "8080";

const args = [
  "php-server",
  "-r",
  "phpMyAdmin-5.2.3-english/",
  "-l",
  `:${port}`,
];

const server = spawn("./frankenphp", args, {
  stdio: "inherit",
  shell: false,
});

server.on("error", (err) => {
  console.error("Failed to start FrankenPHP:", err);
  process.exit(1);
});

server.on("exit", (code, signal) => {
  if (signal) {
    console.log(`FrankenPHP stopped by signal ${signal}`);
    process.exit(1);
  }

  process.exit(code ?? 0);
});
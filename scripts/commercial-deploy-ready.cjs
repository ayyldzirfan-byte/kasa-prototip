const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const commercial = path.join(root, "commercial");
const node = process.execPath;

const steps = [
  [node, ["test-commercial-vercel-config.cjs"], root],
  [node, ["test-commercial-cloud-adapter.cjs"], root],
  [node, [path.join(commercial, "node_modules", "jest", "bin", "jest.js"), "--runInBand"], commercial],
  [node, [path.join(commercial, "node_modules", "typescript", "bin", "tsc"), "--noEmit"], commercial],
  [node, [path.join(commercial, "node_modules", "next", "dist", "bin", "next"), "build"], commercial],
];

for (const [command, args, cwd] of steps) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit", shell: false });
  if (result.error) {
    console.error(`commercial deploy-ready command failed: ${command} ${args.join(" ")}`);
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status || 1);
}

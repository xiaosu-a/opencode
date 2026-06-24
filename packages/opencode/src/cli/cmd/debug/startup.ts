import { EOL } from "os"
import { cmd } from "../cmd"

export const StartupCommand = cmd({
  command: "startup",
  describe: "显示启动事件和耗时",
  builder: (yargs) => yargs,
  handler() {
    process.stdout.write(performance.now().toString() + EOL)
  },
})

import { cmd } from "./cmd"
import { UI } from "@/cli/ui"
import { errorMessage } from "@sumocode-ai/tui/util/error"
import { validateSession } from "../tui/validate-session"
import { ServerAuth } from "@/server/auth"

export const AttachCommand = cmd({
  command: "attach <url>",
  describe: "连接到正在运行的 SumoCode 服务器",
  builder: (yargs) =>
    yargs
      .positional("url", {
        type: "string",
        describe: "服务器 URL，例如 http://localhost:4096",
        demandOption: true,
      })
      .option("dir", {
        type: "string",
        description: "运行目录",
      })
      .option("continue", {
        alias: ["c"],
        describe: "继续上一次会话",
        type: "boolean",
      })
      .option("session", {
        alias: ["s"],
        type: "string",
        describe: "要继续的会话 ID",
      })
      .option("fork", {
        type: "boolean",
        describe: "继续时创建会话分支（与 --continue 或 --session 配合使用）",
      })
      .option("password", {
        alias: ["p"],
        type: "string",
        describe: "Basic auth 密码（默认读取 SUMOCODE_SERVER_PASSWORD）",
      })
      .option("username", {
        alias: ["u"],
        type: "string",
        describe: "Basic auth 用户名（默认读取 SUMOCODE_SERVER_USERNAME 或 'sumocode'）",
      })
      .option("mini", {
        type: "boolean",
        describe: "启动最小化交互界面",
        default: false,
      })
      .option("replay", {
        type: "boolean",
        hidden: true,
      })
      .option("no-replay", {
        type: "boolean",
        describe: "恢复时和调整大小后禁用 mini 会话历史回放",
      })
      .option("replay-limit", {
        type: "number",
        describe: "mini 回放最多显示最近 N 条消息",
      }),
  handler: async (args) => {
    if (args.replay === true) {
      UI.error("--replay is not supported; replay is enabled by default")
      process.exitCode = 1
      return
    }
    const noReplay = args.replay === false || args.noReplay === true

    const directory = (() => {
      if (!args.dir) return undefined
      try {
        process.chdir(args.dir)
        return process.cwd()
      } catch {
        // If the directory doesn't exist locally (remote attach), pass it through.
        return args.dir
      }
    })()

    if (args.mini) {
      const { runMini } = await import("./run")
      await runMini({
        attach: args.url,
        directory,
        password: args.password,
        username: args.username,
        continue: args.continue,
        session: args.session,
        fork: args.fork,
        replay: noReplay ? false : undefined,
        replayLimit: args.replayLimit,
      })
      return
    }

    const unsupported = [
      ["--no-replay", noReplay],
      ["--replay-limit", args.replayLimit !== undefined],
    ].find((entry) => entry[1])?.[0]
    if (unsupported) {
      UI.error(`${unsupported} requires --mini`)
      process.exitCode = 1
      return
    }

    const { TuiConfig } = await import("@/config/tui")
    if (args.fork && !args.continue && !args.session) {
      UI.error("--fork requires --continue or --session")
      process.exitCode = 1
      return
    }

    const headers = ServerAuth.headers({ password: args.password, username: args.username })
    const config = await TuiConfig.get()

    try {
      await validateSession({
        url: args.url,
        sessionID: args.session,
        directory,
        headers,
      })
    } catch (error) {
      UI.error(errorMessage(error))
      process.exitCode = 1
      return
    }

    const { Effect } = await import("effect")
    const { run } = await import("../tui/layer")
    const { createLegacyTuiPluginHost } = await import("@/plugin/tui/runtime")
    await Effect.runPromise(
      run({
        url: args.url,
        config,
        pluginHost: createLegacyTuiPluginHost(),
        args: {
          continue: args.continue,
          sessionID: args.session,
          fork: args.fork,
        },
        directory,
        headers,
      }),
    )
  },
})

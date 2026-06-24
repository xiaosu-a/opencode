import { Effect } from "effect"
import { effectCmd } from "../../effect-cmd"

export const AgentCommand = effectCmd({
  command: "agent <name>",
  describe: "显示 agent 详情",
  builder: (yargs) =>
    yargs
      .positional("name", {
        type: "string",
        demandOption: true,
        description: "agent 名称",
      })
      .option("tool", {
        type: "string",
        description: "要执行的 tool ID",
      })
      .option("params", {
        type: "string",
        description: "以 JSON 或 JS 对象字面量表示的 tool 参数",
      }),
  handler: (args) =>
    Effect.gen(function* () {
      const { debugAgent } = yield* Effect.promise(() => import("./agent.handler"))
      return yield* debugAgent(args)
    }),
})

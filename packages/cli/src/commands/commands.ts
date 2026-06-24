import { Argument, Flag } from "effect/unstable/cli"
import { Spec } from "../framework/spec"

declare const SUMOCODE_CLI_NAME: string | undefined

export const Commands = Spec.make(typeof SUMOCODE_CLI_NAME === "string" ? SUMOCODE_CLI_NAME : "opencode", {
  description: "SumoCode 2.0 预览版命令行界面",
  commands: [
    Spec.make("debug", {
      description: "调试与故障排除工具",
      commands: [Spec.make("agents", { description: "列出所有智能体" })],
    }),
    Spec.make("migrate", { description: "将 v1 数据迁移到 v2" }),
    Spec.make("service", {
      description: "管理后台服务器",
      commands: [
        Spec.make("start", { description: "启动后台服务器" }),
        Spec.make("restart", { description: "重启后台服务器" }),
        Spec.make("status", { description: "显示后台服务器状态" }),
        Spec.make("stop", { description: "停止后台服务器" }),
        Spec.make("password", {
          description: "获取或设置服务器密码",
          params: { value: Argument.string("value").pipe(Argument.optional) },
        }),
      ],
    }),
    Spec.make("serve", {
      description: "启动 v2 API 服务器",
      params: {
        hostname: Flag.string("hostname").pipe(Flag.withDefault("127.0.0.1")),
        port: Flag.integer("port").pipe(Flag.optional),
        register: Flag.boolean("register").pipe(Flag.withDefault(false)),
      },
    }),
  ],
})

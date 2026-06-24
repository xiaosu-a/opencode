import type { Argv, InferredOptionTypes } from "yargs"
import { ConfigV1 } from "@sumocode-ai/core/v1/config/config"
import type { Config } from "@/config/config"
import { Effect } from "effect"

const options = {
  port: {
    type: "number" as const,
    describe: "监听端口",
    default: 0,
  },
  hostname: {
    type: "string" as const,
    describe: "监听主机名",
    default: "127.0.0.1",
  },
  mdns: {
    type: "boolean" as const,
    describe: "启用 mDNS 服务发现（默认主机名设为 0.0.0.0）",
    default: false,
  },
  "mdns-domain": {
    type: "string" as const,
    describe: "mDNS 服务的自定义域名（默认：sumocode.local）",
    default: "sumocode.local",
  },
  cors: {
    type: "string" as const,
    array: true,
    describe: "允许 CORS 的额外域名",
    default: [] as string[],
  },
}

export type NetworkOptions = InferredOptionTypes<typeof options>

export function withNetworkOptions<T>(yargs: Argv<T>) {
  return yargs.options(options)
}
export const resolveNetworkOptions = Effect.fn("Cli.resolveNetworkOptions")(function* (args: NetworkOptions) {
  const { Config } = yield* Effect.promise(() => import("@/config/config"))
  const config = yield* Config.Service.use((cfg) => cfg.getGlobal())
  return resolveNetworkOptionsNoConfig(args, config)
})

export function resolveNetworkOptionsNoConfig(args: NetworkOptions, config?: ConfigV1.Info) {
  const portExplicitlySet = process.argv.includes("--port")
  const hostnameExplicitlySet = process.argv.includes("--hostname")
  const mdnsExplicitlySet = process.argv.includes("--mdns")
  const mdnsDomainExplicitlySet = process.argv.includes("--mdns-domain")
  const mdns = mdnsExplicitlySet ? args.mdns : (config?.server?.mdns ?? args.mdns)
  const mdnsDomain = mdnsDomainExplicitlySet ? args["mdns-domain"] : (config?.server?.mdnsDomain ?? args["mdns-domain"])
  const port = portExplicitlySet ? args.port : (config?.server?.port ?? args.port)
  const hostname = hostnameExplicitlySet
    ? args.hostname
    : mdns && !config?.server?.hostname
      ? "0.0.0.0"
      : (config?.server?.hostname ?? args.hostname)
  const configCors = config?.server?.cors ?? []
  const argsCors = Array.isArray(args.cors) ? args.cors : args.cors ? [args.cors] : []
  const cors = [...configCors, ...argsCors]

  return { hostname, port, mdns, mdnsDomain, cors }
}

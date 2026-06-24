import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["SUMOCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]
const fff = process.env["SUMOCODE_DISABLE_FFF"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("SUMOCODE_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  SUMOCODE_AUTO_HEAP_SNAPSHOT: truthy("SUMOCODE_AUTO_HEAP_SNAPSHOT"),
  SUMOCODE_GIT_BASH_PATH: process.env["SUMOCODE_GIT_BASH_PATH"],
  SUMOCODE_CONFIG: process.env["SUMOCODE_CONFIG"],
  SUMOCODE_CONFIG_CONTENT: process.env["SUMOCODE_CONFIG_CONTENT"],
  SUMOCODE_DISABLE_AUTOUPDATE: truthy("SUMOCODE_DISABLE_AUTOUPDATE"),
  SUMOCODE_ALWAYS_NOTIFY_UPDATE: truthy("SUMOCODE_ALWAYS_NOTIFY_UPDATE"),
  SUMOCODE_DISABLE_PRUNE: truthy("SUMOCODE_DISABLE_PRUNE"),
  SUMOCODE_DISABLE_TERMINAL_TITLE: truthy("SUMOCODE_DISABLE_TERMINAL_TITLE"),
  SUMOCODE_SHOW_TTFD: truthy("SUMOCODE_SHOW_TTFD"),
  SUMOCODE_DISABLE_AUTOCOMPACT: truthy("SUMOCODE_DISABLE_AUTOCOMPACT"),
  SUMOCODE_DISABLE_MODELS_FETCH: truthy("SUMOCODE_DISABLE_MODELS_FETCH"),
  SUMOCODE_DISABLE_MOUSE: truthy("SUMOCODE_DISABLE_MOUSE"),
  SUMOCODE_FAKE_VCS: process.env["SUMOCODE_FAKE_VCS"],
  SUMOCODE_SERVER_PASSWORD: process.env["SUMOCODE_SERVER_PASSWORD"],
  SUMOCODE_SERVER_USERNAME: process.env["SUMOCODE_SERVER_USERNAME"],
  SUMOCODE_DISABLE_FFF: fff === undefined ? process.platform === "win32" : truthy("SUMOCODE_DISABLE_FFF"),

  // Experimental
  SUMOCODE_EXPERIMENTAL_FILEWATCHER: Config.boolean("SUMOCODE_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  SUMOCODE_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("SUMOCODE_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  SUMOCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("SUMOCODE_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  SUMOCODE_MODELS_URL: process.env["SUMOCODE_MODELS_URL"],
  SUMOCODE_MODELS_PATH: process.env["SUMOCODE_MODELS_PATH"],
  SUMOCODE_DB: process.env["SUMOCODE_DB"],

  SUMOCODE_WORKSPACE_ID: process.env["SUMOCODE_WORKSPACE_ID"],
  SUMOCODE_EXPERIMENTAL_WORKSPACES: enabledByExperimental("SUMOCODE_EXPERIMENTAL_WORKSPACES"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get SUMOCODE_DISABLE_PROJECT_CONFIG() {
    return truthy("SUMOCODE_DISABLE_PROJECT_CONFIG")
  },
  get SUMOCODE_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("SUMOCODE_EXPERIMENTAL_REFERENCES")
  },
  get SUMOCODE_TUI_CONFIG() {
    return process.env["SUMOCODE_TUI_CONFIG"]
  },
  get SUMOCODE_CONFIG_DIR() {
    return process.env["SUMOCODE_CONFIG_DIR"]
  },
  get SUMOCODE_PURE() {
    return truthy("SUMOCODE_PURE")
  },
  get SUMOCODE_PERMISSION() {
    return process.env["SUMOCODE_PERMISSION"]
  },
  get SUMOCODE_PLUGIN_META_FILE() {
    return process.env["SUMOCODE_PLUGIN_META_FILE"]
  },
  get SUMOCODE_CLIENT() {
    return process.env["SUMOCODE_CLIENT"] ?? "cli"
  },
}

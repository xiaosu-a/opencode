import { run as runTui, type TuiInput } from "@sumocode-ai/tui"
import { Global } from "@sumocode-ai/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}

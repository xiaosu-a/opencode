import { describe, expect } from "bun:test"
import { Effect, Layer } from "effect"
import { AgentV2 } from "@sumocode-ai/core/agent"
import { FSUtil } from "@sumocode-ai/core/fs-util"
import { SkillPlugin } from "@sumocode-ai/core/plugin/skill"
import { SkillV2 } from "@sumocode-ai/core/skill"
import { SkillDiscovery } from "@sumocode-ai/core/skill/discovery"
import { testEffect } from "../lib/effect"
import { host } from "./host"

const it = testEffect(
  SkillV2.layer.pipe(
    Layer.provide(FSUtil.defaultLayer),
    Layer.provide(SkillDiscovery.defaultLayer),
    Layer.provideMerge(AgentV2.locationLayer),
  ),
)

describe("SkillPlugin.Plugin", () => {
  it.effect("registers the built-in customize-opencode skill", () =>
    Effect.gen(function* () {
      const skill = yield* SkillV2.Service
      yield* SkillPlugin.Plugin.effect(host({ skill: { ...skill, reload: skill.reload } }))

      expect(yield* skill.list()).toContainEqual(
        expect.objectContaining({
          name: "customize-opencode",
          description: expect.stringContaining("opencode's own configuration"),
        }),
      )
    }),
  )
})

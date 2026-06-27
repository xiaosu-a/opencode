import { Credential } from "@sumocode-ai/core/credential"
import { EventV2 } from "@sumocode-ai/core/event"
import { FileSystem } from "@sumocode-ai/core/filesystem"
import { FSUtil } from "@sumocode-ai/core/fs-util"
import { Global } from "@sumocode-ai/core/global"
import { Npm } from "@sumocode-ai/core/npm"
import { PluginV2 } from "@sumocode-ai/core/plugin"
import { RepositoryCache } from "@sumocode-ai/core/repository-cache"
import { Ripgrep } from "@sumocode-ai/core/ripgrep"
import { SkillDiscovery } from "@sumocode-ai/core/skill/discovery"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"
import { tempLocationLayer } from "../fixture/location"

export const PluginTestLayer = Layer.mergeAll(FileSystem.locationLayer, PluginV2.locationLayer).pipe(
  Layer.provideMerge(
    Layer.mergeAll(
      Credential.defaultLayer,
      EventV2.defaultLayer,
      FetchHttpClient.layer,
      FSUtil.defaultLayer,
      Global.defaultLayer,
      Layer.succeed(
        Npm.Service,
        Npm.Service.of({
          add: () => Effect.succeed({ directory: "", entrypoint: undefined }),
          install: () => Effect.void,
          which: () => Effect.succeed(undefined),
        }),
      ),
      RepositoryCache.defaultLayer,
      SkillDiscovery.defaultLayer,
      Ripgrep.defaultLayer,
      tempLocationLayer,
    ),
  ),
)

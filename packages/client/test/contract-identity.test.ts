import { expect, test } from "bun:test"
import { Schema } from "effect"
import { AgentV2 } from "@sumocode-ai/core/agent"
import { Location as CoreLocation } from "@sumocode-ai/core/location"
import { ModelV2 } from "@sumocode-ai/core/model"
import { SessionV2 } from "@sumocode-ai/core/session"
import { SessionInput as CoreSessionInput } from "@sumocode-ai/core/session/input"
import { SessionMessage as CoreSessionMessage } from "@sumocode-ai/core/session/message"
import { Prompt as CorePrompt } from "@sumocode-ai/core/session/prompt"
import { Agent } from "@sumocode-ai/schema/agent"
import { Location } from "@sumocode-ai/schema/location"
import { Model } from "@sumocode-ai/schema/model"
import { Project } from "@sumocode-ai/schema/project"
import { Provider } from "@sumocode-ai/schema/provider"
import { Prompt } from "@sumocode-ai/schema/prompt"
import { Session } from "@sumocode-ai/schema/session"
import { SessionInput } from "@sumocode-ai/schema/session-input"
import { SessionMessage } from "@sumocode-ai/schema/session-message"
import { Workspace } from "@sumocode-ai/schema/workspace"
import { Api } from "@sumocode-ai/server/api"
import { compile, emitPromise } from "@sumocode-ai/httpapi-codegen"
import { HttpApi } from "effect/unstable/httpapi"
import { EventGroup, SessionGroup } from "../src/contract"

test("Core and Server reuse the authoritative Schema and Protocol values", () => {
  expect(AgentV2.ID).toBe(Agent.ID)
  expect(CoreLocation.Ref).toBe(Location.Ref)
  expect(ModelV2.Ref).toBe(Model.Ref)
  expect(SessionV2.Info).toBe(Session.Info)
  expect(CoreSessionInput.Admitted).toBe(SessionInput.Admitted)
  expect(CoreSessionMessage.Message).toBe(SessionMessage.Message)
  expect(CorePrompt).toBe(Prompt)
  expect(Api.groups["server.session"].identifier).toBe("server.session")
  expect(SessionGroup.identifier).toBe(Api.groups["server.session"].identifier)
  expect(EventGroup.identifier).toBe(Api.groups["server.event"].identifier)
  expect(Session.ID.create()).toStartWith("ses_")
  expect(Project.ID.global).toBe("global")
  expect(Provider.ID.anthropic).toBe("anthropic")
  expect(Workspace.ID.create()).toStartWith("wrk_")
})

test("client and Server Session contracts generate identically", () => {
  const options = { groupNames: { "server.session": "sessions" } }
  const server = compile(HttpApi.make("server").add(Api.groups["server.session"]), options)
  const client = compile(HttpApi.make("client").add(SessionGroup), options)

  expect(emitPromise(client)).toEqual(emitPromise(server))
})

test("shared DTO schemas construct and decode plain objects", () => {
  const made = Prompt.make({ text: "hello" })
  const decoded = Schema.decodeUnknownSync(Prompt)({ text: "hello" })
  const content = Schema.decodeUnknownSync(SessionMessage.AssistantText)({ type: "text", id: "part_1", text: "hi" })

  expect(Object.getPrototypeOf(made)).toBe(Object.prototype)
  expect(Object.getPrototypeOf(decoded)).toBe(Object.prototype)
  expect(Object.getPrototypeOf(content)).toBe(Object.prototype)
  expect(Prompt.ast.annotations?.identifier).toBe("Prompt")
  expect(SessionMessage.AssistantText.ast.annotations?.identifier).toBe("Session.Message.Assistant.Text")
  expect(CoreSessionMessage.AssistantText).toBe(SessionMessage.AssistantText)
})

import { makeDefaultApi } from "@sumocode-ai/protocol/api"
import { InvalidRequestError, SessionNotFoundError } from "@sumocode-ai/protocol/errors"
import { HttpApi, HttpApiMiddleware } from "effect/unstable/httpapi"

class LocationMiddleware extends HttpApiMiddleware.Service<LocationMiddleware>()(
  "@sumocode-ai/client/LocationMiddleware",
) {}

class SessionLocationMiddleware extends HttpApiMiddleware.Service<SessionLocationMiddleware>()(
  "@sumocode-ai/client/SessionLocationMiddleware",
  { error: [InvalidRequestError, SessionNotFoundError] },
) {}

const Api = makeDefaultApi({
  locationMiddleware: LocationMiddleware,
  sessionLocationMiddleware: SessionLocationMiddleware,
})

export const SessionGroup = Api.groups["server.session"]
export const EventGroup = Api.groups["server.event"]
export const ClientApi = HttpApi.make("opencode-client").add(SessionGroup).add(EventGroup)

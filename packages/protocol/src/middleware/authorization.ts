import { HttpApiMiddleware } from "effect/unstable/httpapi"
import { UnauthorizedError } from "../errors"

export class Authorization extends HttpApiMiddleware.Service<Authorization>()("@sumocode/HttpApiAuthorization", {
  error: UnauthorizedError,
}) {}

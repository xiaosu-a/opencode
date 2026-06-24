import path from "path"

process.env.SUMOCODE_DB = ":memory:"
process.env.SUMOCODE_MODELS_PATH = path.join(import.meta.dir, "plugin", "fixtures", "models-dev.json")
process.env.SUMOCODE_DISABLE_MODELS_FETCH = "true"

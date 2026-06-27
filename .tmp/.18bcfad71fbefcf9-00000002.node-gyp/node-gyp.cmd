if not defined npm_config_node_gyp (
  bun x --silent node-gyp %*
) else (
  node "%npm_config_node_gyp%" %*
)

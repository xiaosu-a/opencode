const stage = process.env.SST_STAGE || "dev"

export default {
  url: stage === "production" ? "https://sumocode.ai" : `https://${stage}.sumocode.ai`,
  console: stage === "production" ? "https://sumocode.ai/auth" : `https://${stage}.sumocode.ai/auth`,
  email: "help@anoma.ly",
  socialCard: "https://social-cards.sst.dev",
  github: "https://github.com/anomalyco/opencode",
  discord: "https://sumocode.ai/discord",
  headerLinks: [
    { name: "app.header.home", url: "/" },
    { name: "app.header.docs", url: "/docs/" },
  ],
}

export function getConfig() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "ahhc";

  let config;

  if (orgId === "ahhc") {
    const { ahhcConfig } = require("./organizations/ahhc.config");
    config = ahhcConfig;
  } else if (orgId === "auf") {
    const { aufConfig } = require("./organizations/auf.config");
    config = aufConfig;
  } else if (orgId === "awauk") {
    const { awaukConfig } = require("./organizations/awauk.config");
    config = awaukConfig;
  } else {
    throw new Error(`Unknown organization: ${orgId}`);
  }

  return config;
}

export const config = getConfig();

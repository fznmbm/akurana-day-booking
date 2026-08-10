export function getConfig() {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "ahhc";

  let config;

  if (orgId === "ahhc") {
    const { ahhcConfig } = require("./organizations/ahhc.config");
    config = ahhcConfig;
  } else if (orgId === "islahtrust") {
    const { islahtrustConfig } = require("./organizations/islahtrust.config");
    config = islahtrustConfig;
  } else {
    throw new Error(`Unknown organization: ${orgId}`);
  }

  return config;
}

export const config = getConfig();

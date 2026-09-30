/*
  The Midnight network Kredit runs on. Everything that names a network or
  talks to one reads it from here; set NEXT_PUBLIC_MIDNIGHT_NETWORK to switch.
*/
const id = (process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK || "preview") as "preview" | "preprod";

export const network = {
  id,
  name: id === "preprod" ? "Preprod" : "Preview",
  label: `Midnight ${id === "preprod" ? "Preprod" : "Preview"}`,
  indexer: `https://indexer.${id}.midnight.network/api/v4/graphql`,
  indexerWs: `wss://indexer.${id}.midnight.network/api/v4/graphql/ws`,
  faucet: `https://faucet.${id}.midnight.network/`,
} as const;

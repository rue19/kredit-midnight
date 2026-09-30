"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/*
  Wallet state is restored on the client, so anything that renders it must
  wait for mount or the server and client markup disagree.
*/
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

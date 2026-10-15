"use client";

import { type EffectCallback, useEffect } from "react";

export function useMountEffect(effect: EffectCallback) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: Explicit mount/cleanup boundary; callers capture only mount-stable resources.
  useEffect(effect, []);
}

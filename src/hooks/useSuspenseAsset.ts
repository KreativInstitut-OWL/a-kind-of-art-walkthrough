import { useApp } from "@playcanvas/react/hooks";
import { fetchAsset } from "@playcanvas/react/utils";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSuspenseAsset({
  src,
  type = "container",
  props,
}: {
  src: string;
  type?: string;
  props?: Record<string, unknown>;
}) {
  const app = useApp();

  const queryFn = useCallback(
    () => fetchAsset({ app, url: src, type, props }),
    [app, props, src, type]
  );

  return useSuspenseQuery({
    queryKey: ["asset", type, src, props],
    queryFn,
    // stale after 1 week (in ms)
    staleTime: 1000 * 60 * 60 * 24 * 7,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

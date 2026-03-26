import { useTranslation } from "react-i18next";
import type { LocalizedString } from "@/types";
import { getLocalizedString } from "@/utils";

interface LoadingOverlayProps {
  displayName?: LocalizedString;
}

export function LoadingOverlay({ displayName }: LoadingOverlayProps) {
  const { t } = useTranslation();

  const localizedDisplayName = displayName
    ? getLocalizedString(displayName)
    : undefined;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="text-xl font-medium mb-4">
          {t("loading", { sceneName: localizedDisplayName })}
        </div>
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
}

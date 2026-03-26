/**
 * Basic GTM tracking utility
 * Only works if GTM is set up in the surrounding system
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export interface TrackData {
  event?: string;
  eventData: {
    category?: string;
    action: string;
    label: string;
  };
}

export function trackData(data: TrackData): void {
  // Ensure dataLayer exists on the global window
  if (!window.dataLayer) {
    window.dataLayer = [];
  }

  const { category = "AKindOfArt", action, label } = data.eventData;

  // Push the event data to dataLayer
  window.dataLayer.push({
    event: data.event ?? "ce.interaction",
    eventData: {
      category,
      action,
      label,
    },
  });
}

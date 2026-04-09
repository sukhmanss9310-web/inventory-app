import { useEffect, useState } from "react";

const isStandaloneMode = () =>
  window.matchMedia?.("(display-mode: standalone)")?.matches ||
  window.navigator.standalone === true;

export const PwaInstallPrompt = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [offlineReady, setOfflineReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(() =>
    typeof window === "undefined" ? false : isStandaloneMode()
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };

    const handleOfflineReady = () => {
      setOfflineReady(true);
      setDismissed(false);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("ops-pwa-offline-ready", handleOfflineReady);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("ops-pwa-offline-ready", handleOfflineReady);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed || dismissed || (!installPromptEvent && !offlineReady)) {
    return null;
  }

  const handleInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4 sm:bottom-6 sm:px-6">
      <div className="mx-auto flex max-w-md items-end justify-between gap-3 rounded-[26px] border border-slate-200 bg-white/95 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {offlineReady ? "Offline mode is ready" : "Install on your phone"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {offlineReady
              ? "You can reopen the dashboard even when the network is unstable."
              : "Add this dashboard to your home screen for quick mobile access."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {installPromptEvent ? (
            <button
              type="button"
              onClick={handleInstall}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Install
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

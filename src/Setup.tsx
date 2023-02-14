import clsx from "clsx";
import styles from "./styles/main.module.scss";
import { useEffect, useRef, useState } from "react";
import GithubCircle from "./assets/github-circle.svg";
import Wrench from "./assets/wrench.svg";
import search from "./search";

export default function Setup() {
  const websiteAddress = useRef<HTMLInputElement | null>(null);
  const proxySettingsContainer = useRef<HTMLDivElement | null>(null);
  const [bareServerURL, setBareServerURL] = useState<string>(
    localStorage["bare server url"] ||
      (process.env.NODE_ENV === "production" ? "" : process.env.BARE_SERVER) ||
      ""
  );
  const [url, setUrl] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const renderProxy = bareServerURL && url;
  /**
   * Validation error
   */
  const [bareServerError, setBareServerError] = useState<string | null>(null);
  const bareServerInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    localStorage["bare server url"] = bareServerURL;
  }, [bareServerURL]);

  // hide overflow such as the scrollbar while user is in the proxy
  useEffect(() => {
    if (!renderProxy) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [renderProxy]);

  return renderProxy ? (
    <spadium-proxy className={styles.window} src={url} server={bareServerURL} />
  ) : (
    <main className={styles.content}>
      <div className={styles.nav}>
        <div
          className={styles.proxySettingsContainer}
          ref={proxySettingsContainer}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget))
              setSettingsOpen(false);
          }}
          tabIndex={0}
        >
          <button
            className={clsx(
              styles.item,
              styles.settings,
              settingsOpen && styles.open
            )}
            onClick={() => setSettingsOpen(!settingsOpen)}
          >
            <Wrench />
          </button>
          <div
            className={clsx(styles.proxySettings, settingsOpen && styles.open)}
          >
            <h3>Proxy Settings</h3>
            <label>
              Bare server address:
              <br />
              <input
                placeholder="https://uv.holyubofficial.net/"
                onChange={(event) => {
                  try {
                    new URL(
                      event.currentTarget.value,
                      process.env.NODE_ENV === "production"
                        ? undefined
                        : location.toString()
                    );
                    setBareServerError(null);
                    setBareServerURL(event.currentTarget.value);
                  } catch (err) {
                    setBareServerError("Invalid URL");
                  }
                }}
                ref={bareServerInput}
                type="text"
                defaultValue={bareServerURL}
              />
            </label>
            {bareServerError && (
              <span className={styles.error}>{bareServerError}</span>
            )}
          </div>
        </div>
        <div className={styles.item}>
          <a href="https://github.com/e9x/spadium-offline">
            <GithubCircle />
          </a>
        </div>
      </div>
      <div className={styles.main}>
        <h1 className={styles.title}>Spadium</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (websiteAddress.current === null)
              throw new TypeError("Website URL input doesn't exist.");

            if (!bareServerURL) {
              setBareServerError("Specify a Bare server.");
              setSettingsOpen(true);
              return;
            }

            setUrl(
              search(
                websiteAddress.current.value,
                "https://www.google.com/search?q=%s"
              )
            );
          }}
        >
          <input
            ref={websiteAddress}
            type="text"
            className={styles.address}
            placeholder="Search Google or type a URL"
          />
        </form>
      </div>
    </main>
  );
}

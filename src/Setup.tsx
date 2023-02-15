import BareClient from "@tomphttp/bare-client";
import clsx from "clsx";
import styles from "./styles/main.module.scss";
import { useEffect, useMemo, useRef, useState } from "react";
import { ReactComponent as GithubCircle } from "./assets/github-circle.svg";
import { ReactComponent as Wrench } from "./assets/wrench.svg";
import { ReactComponent as Spade } from "./assets/spade.svg";
import search from "./search";

export default function Setup() {
  const websiteAddress = useRef<HTMLInputElement | null>(null);
  const proxySettingsContainer = useRef<HTMLDivElement | null>(null);
  const [bareServerURL, setBareServerURL] = useState<string>(
    localStorage["bare server url"] ||
      (process.env.NODE_ENV === "production"
        ? process.env.REACT_APP_DEFAULT_BARE_SERVER
        : process.env.REACT_APP_BARE_SERVER) ||
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

  /**
   * Omnibox completions
   */
  const client = useMemo(
    () =>
      bareServerURL
        ? new BareClient(getBareServerURL(bareServerURL))
        : undefined,
    [bareServerURL]
  );

  const [omniValue, setOmniValue] = useState("");
  const [dataList, setDataList] = useState<string[] | null>(null);
  const abort = useRef(new AbortController());

  useEffect(() => {
    if (!client || !omniValue) return;

    abort.current.abort();
    abort.current = new AbortController();
    // clear the list
    setDataList([]);

    // fetch bing suggestions
    client
      .fetch(
        `https://www.bing.com/AS/Suggestions?${new URLSearchParams({
          qry: omniValue,
          cvid: "\u0001",
        })}`,
        {
          signal: abort.current.signal,
        }
      )
      .then(async (res) => {
        const text = await res.text();

        if (!res.ok) throw new Error(text);

        const rg = /<span class="sa_tm_text">(.*?)<\/span>/g;
        let matchResult: RegExpMatchArray | null = null;
        const list: string[] = [];

        while ((matchResult = rg.exec(text)) !== null)
          list.push(stripHtml(matchResult[1]));

        setDataList(list);
      });
  }, [client, omniValue]);

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
    <div className={styles.window}>
      <spadium-proxy src={url} server={getBareServerURL(bareServerURL)} />{" "}
    </div>
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
                placeholder="https://Bare-server-URL/"
                onChange={(event) => {
                  try {
                    getBareServerURL(event.currentTarget.value);
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
        <h1 className={styles.title}>
          Sp
          <Spade className={styles.spade} />
          dium
        </h1>
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
            list="address"
            type="text"
            className={styles.address}
            placeholder="Search Google or type a URL"
            onInput={(event) => {
              setOmniValue(event.currentTarget.value);
            }}
          />
          <datalist id="address">
            {dataList?.map((option, i) => (
              <option key={i}>{option}</option>
            ))}
          </datalist>
        </form>
      </div>
    </main>
  );
}

function getBareServerURL(partial: string) {
  return new URL(
    partial,
    process.env.NODE_ENV === "production" ? undefined : location.toString()
  ).toString();
}

// import { stripHtml } from "string-strip-html";
/**
 * Removes HTML tags from a string
 * @param html Raw HTML
 */
function stripHtml(html: string) {
  const div = document.createElement("div");
  // this is safe
  // the div isn't connected
  div.innerHTML = html;
  return div.textContent || "";
}

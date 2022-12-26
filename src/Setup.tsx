import { h, Fragment } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import search from "./search";

export default function Setup() {
  const bareServer = useRef<HTMLInputElement | null>(null);
  const websiteAddress = useRef<HTMLInputElement | null>(null);
  const defaultWebsiteAddress = useMemo(
    () => localStorage.getItem("website url") || "https://www.google.com/",
    []
  );
  const defaultBareServerURL = useMemo(
    () =>
      localStorage.getItem("bare server url") ||
      (process.env.NODE_ENV === "production" ? "" : process.env.BARE_SERVER),
    []
  );
  const [bareServerURL, setBareServerURL] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const renderProxy = bareServerURL && url;

  // hide overflow such as the scrollbar while user is in the proxy
  useEffect(() => {
    if (!renderProxy) return;
    document.documentElement.style.overflow = "hidden";
    return () => (document.documentElement.style.overflow = "");
  }, [renderProxy]);

  return renderProxy ? (
    <spadium-proxy
      style={{
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
      }}
      src={url}
      server={bareServerURL}
    />
  ) : (
    <>
      <h1>Spadium</h1>
      <hr />
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (bareServer.current === null)
            throw new TypeError("Bare server URL input doesn't exist.");
          if (websiteAddress.current === null)
            throw new TypeError("Website URL input doesn't exist.");

          localStorage.setItem("bare server url", bareServer.current.value);
          localStorage.setItem("website url", websiteAddress.current.value);

          setBareServerURL(bareServer.current.value);
          setUrl(
            search(
              websiteAddress.current.value,
              "https://www.google.com/search?q=%s"
            )
          );
        }}
      >
        <h3>Proxy Settings</h3>
        <label>
          Bare server:
          <br />
          <input
            ref={bareServer}
            onInput={(event) => {
              try {
                new URL(event.currentTarget.value, location.toString());
                event.currentTarget.setCustomValidity("");
              } catch (err) {
                event.currentTarget.setCustomValidity("Invalid URL");
              }
            }}
            type="text"
            defaultValue={defaultBareServerURL}
          />
        </label>
        <hr />
        <h3>Website Settings</h3>
        <label>
          Address:
          <br />
          <input
            ref={websiteAddress}
            type="text"
            defaultValue={defaultWebsiteAddress}
          />
        </label>
        <hr />
        <input type="submit" value="Start" />
      </form>
    </>
  );
}

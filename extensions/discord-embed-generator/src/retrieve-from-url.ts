import { showToast, Clipboard, Toast } from "@raycast/api";
import fetch from "node-fetch";
import { fetchFromGen } from "./functions";

export default async function Command() {
  const clipboard = await Clipboard.readText();
  if (!clipboard) return showToast(Toast.Style.Failure, "Clipboard is empty");

  try {
    new URL(clipboard);
  } catch (error) {
    return showToast(Toast.Style.Failure, "Clipboard is not a valid URL");
  }

  const clipboardURL = new URL(clipboard);

  if (/https:\/\/embed\.(rauf\.wtf|rauf\.workers\.dev)/.test(clipboard)) {
    await fetchFromGen(clipboard);
  } else if (/https:\/\/is\.gd\//.test(clipboard.toString())) {
    if (!/https:\/\/is\.gd\/\d{13}$/.test(clipboard.toString())) {
      return showToast(Toast.Style.Failure, "Invalid URL format");
    }

    const toast = await showToast(Toast.Style.Animated, "Fetching data...");
    const params = new URLSearchParams({ format: "json", shorturl: clipboardURL.pathname.slice(1) });
    const response = await fetch(`https://is.gd/forward.php?${params}`).catch(() => {
      toast.style = Toast.Style.Failure;
      toast.title = "Couldn't fetch data from the web";
      toast.message = "Check your Internet conenction";
    });

    if (!response) return;

    if (!response.ok) return showToast(Toast.Style.Failure, "Request didn't succeed. Please try again later.");

    const { errorcode, url } = (await response.json()) as { errorcode?: 1 | 2 | 3 | 4; url?: string };

    if (errorcode) {
      const errorMessage = {
        1: "The short URL was not found",
        2: "The short URL was disabled by the URL shortener",
        3: "The rate limit was exceeded",
        4: "The service is currently unavailable",
      };
      return showToast(Toast.Style.Failure, "URL shortener error:", errorMessage[errorcode]);
    } else if (url) {
      if (!url.toString().match(/https:\/\/embed\.(rauf\.wtf|rauf\.workers\.dev)/))
        return showToast(Toast.Style.Failure, "URL is not a valid embed URL");
      await fetchFromGen(url);
    }
  } else return showToast(Toast.Style.Failure, "URL is not a valid embed URL");
}

import { getPreferenceValues, launchCommand, showToast, LocalStorage, LaunchType, Toast } from "@raycast/api";
import fetch, { Response } from "node-fetch";

const { baseURL } = getPreferenceValues();
export { generateShortened, generateEmbedURL, fetchFromGen, addToHistory, launch };
export type { Values };

interface Values {
  author?: string;
  title?: string;
  description?: string;
  color?: string;
  image?: string;
  redirect?: string;
}

function generateEmbedURL(values: Values) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value);
  }

  const link = new URL(baseURL);
  link.search = params.toString();

  return link.toString();
}

async function generateShortened(values: Values) {
  const link = generateEmbedURL(values);

  const requestURL = new URL("https://is.gd/create.php");

  const params = new URLSearchParams();
  params.set("shorturl", Date.now().toString());
  params.set("url", link);
  params.set("format", "json");

  requestURL.search = params.toString();

  const response = (await fetch(requestURL.toString())) as Response;
  if (response.ok) {
    const result = (await response.json()) as {
      error_code?: 3 | 4;
      shorturl?: string;
    };
    if (result.shorturl) {
      return result.shorturl;
    } else {
      const errorMessage = {
        3: "Rate limit was exceeded",
        4: "Service currently unavailable",
        6: "Unknown error",
      };
      throw new Error(errorMessage[result.error_code ?? 6]);
    }
  }
  throw new Error("Request didn't succeed. Please try again later.");
}

async function addToHistory(values: Values, date: number) {
  const storage = await LocalStorage.allItems();
  const array = Object.keys(storage);
  array.sort((a, b) => Number(b) - Number(a));

  if (array.length >= 30) {
    while (array.length >= 30) {
      await LocalStorage.removeItem(array.pop() ?? "");
    }
  }

  await LocalStorage.setItem(date.toString(), generateEmbedURL(values));
}

async function fetchFromGen(url: string) {
  const newURL = new URL(url.replace(/&amp;/g, "&"));
  const params = new URLSearchParams(newURL.search);
  const settings = Object.fromEntries(params.entries());
  if (Object.values(settings).length === 0 || Object.values(settings).every((value) => value === ""))
    return showToast(Toast.Style.Failure, "The URL returns an empty embed");
  await launch(
    settings.author,
    settings.title,
    settings.description,
    settings.color,
    settings.image,
    settings.redirect
  );
  await showToast(Toast.Style.Success, "Succesfully fetched!");
}

async function launch(
  author?: string,
  title?: string,
  description?: string,
  color?: string,
  image?: string,
  redirect?: string
) {
  await launchCommand({
    name: "generate",
    type: LaunchType.UserInitiated,
    context: {
      author: author,
      title: title,
      description: description,
      color: color,
      image: image,
      redirect: redirect,
    },
  });
}

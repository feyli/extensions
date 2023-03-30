import { Action, Clipboard, Icon, Toast, Application, showHUD, showToast, popToRoot, ActionPanel } from "@raycast/api";
import { generateEmbedURL, generateShortened, Values } from "./functions";
import { addToHistory } from "./functions";

export { PasteToApp, CopyToClipboard, Actions };

function PasteToApp(props: { frontmostApp?: Application }) {
  const { frontmostApp } = props;
  return (
    <Action.SubmitForm
      title={"Paste to " + frontmostApp?.path.split("/").pop()?.split(".").shift() || "Active App"}
      onSubmit={async (values: Values) => {
        const toast = await showToast(Toast.Style.Animated, "Generating URL...");
        try {
          const url = await generateShortened(values);
          Clipboard.paste(url).then(() => {
            toast.hide();
            showHUD("Pasted to " + frontmostApp?.path.split("/").pop()?.split(".").shift() || "Active App");

            addToHistory(values, Date.now());
            popToRoot();
          });
        } catch (e) {
          toast.style = Toast.Style.Failure;
          toast.title = "Error with URL shortener";
          toast.message = e instanceof Error ? e.message : String(e);
        }
        toast.primaryAction = {
          title: "Continue without shortened URL",
          onAction: () => {
            const url = generateEmbedURL(values);
            Clipboard.paste(url).then(() => {
              toast.hide();
              showHUD("Pasted to " + frontmostApp?.path.split("/").pop()?.split(".").shift() || "Active App");

              addToHistory(values, Date.now());
              popToRoot();
            });
          },
        };
      }}
      icon={{ fileIcon: frontmostApp?.path || "" } || Icon.Link}
    />
  );
}

function CopyToClipboard() {
  return (
    <Action.SubmitForm
      title={"Copy to Clipboard"}
      onSubmit={async (values: Values) => {
        const toast = await showToast(Toast.Style.Animated, "Generating URL...");
        try {
          const url = await generateShortened(values);
          await Clipboard.copy(url);
          toast.style = Toast.Style.Success;
          toast.title = "Copied to clipboard";
          toast.message = url;

          await addToHistory(values, Date.now());
          await popToRoot();
        } catch (e) {
          toast.style = Toast.Style.Failure;
          toast.title = "Error with URL shortener";
          toast.message = e instanceof Error ? e.message : String(e);

          toast.primaryAction = {
            title: "Continue without shortened URL",
            onAction: () => {
              const url = generateEmbedURL(values);
              Clipboard.copy(generateEmbedURL(values)).then(() => {
                toast.style = Toast.Style.Success;
                toast.title = "Copied to clipboard";
                toast.message = url;

                addToHistory(values, Date.now());
                popToRoot();
              });
            },
          };
        }
      }}
      icon={Icon.Clipboard}
    />
  );
}

function Actions(props: { frontmostApp?: Application; defaultAction: "copy" | "paste"; colorPreview: string }) {
  const { frontmostApp, defaultAction, colorPreview } = props;
  return (
    <ActionPanel>
      {defaultAction === "paste" ? (
        <>
          <PasteToApp frontmostApp={frontmostApp} />
          <CopyToClipboard />
          <ActionPanel.Item title={"Preview Color"} icon={{ source: Icon.CircleFilled, tintColor: colorPreview }} />
        </>
      ) : (
        <>
          <CopyToClipboard />
          <PasteToApp frontmostApp={frontmostApp} />
          <ActionPanel.Item title={"Preview Color"} icon={{ source: Icon.CircleFilled, tintColor: colorPreview }} />
        </>
      )}
    </ActionPanel>
  );
}

import { Form, getPreferenceValues, getFrontmostApplication, Application } from "@raycast/api";
import { Values } from "./functions";
import { useEffect, useState } from "react";
import { Actions } from "./components";

export default function Generate(props: { draftValues?: Values; launchContext?: Values }) {
  const { launchContext } = props;
  const { draftValues } = props;
  interface Preferences {
    baseURL: "https://embed.rauf.workers.dev/" | "https://embed.rauf.wtf/";
    defaultAction: "copy" | "paste";
  }

  const { defaultAction } = getPreferenceValues() as Preferences;
  const [frontmostApp, setFrontmostApp] = useState<Application>();
  const [author, setAuthor] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [img, setImg] = useState<string>("");
  const [redirect, setRedirect] = useState<string>("");

  useEffect(() => {
    getFrontmostApplication().then((app) => setFrontmostApp(app));
  }, []);

  return (
    <Form
      enableDrafts={true}
      actions={<Actions frontmostApp={frontmostApp} defaultAction={defaultAction} colorPreview={color} />}
    >
      <Form.TextField
        onChange={(newValue) => setAuthor(newValue)}
        error={
          author.length === 0 && title.length === 0 && description.length === 0
            ? "You need at least an author, a title or a description."
            : ""
        }
        title={"Author Text"}
        id="author"
        defaultValue={launchContext?.author || draftValues?.author}
      />
      <Form.TextField
        onChange={(newValue) => setTitle(newValue)}
        error={
          author.length === 0 && title.length === 0 && description.length === 0
            ? "You need at least an author, a title or a description."
            : ""
        }
        title={"Title Text"}
        id="title"
        defaultValue={launchContext?.title || draftValues?.title}
      />
      <Form.TextArea
        onChange={(newValue) => setDescription(newValue)}
        error={
          author.length === 0 && title.length === 0 && description.length === 0
            ? "You need at least an author, a title or a description."
            : ""
        }
        title={"Description"}
        id="description"
        defaultValue={launchContext?.description || draftValues?.description}
      />
      <Form.TextField
        title={"Sidebar Color"}
        id="color"
        defaultValue={launchContext?.color || draftValues?.color}
        error={
          color.length > 0 && !color.match(/^[0-9A-F]{6}$/i)
            ? "The color must be formatted in hexadecimal (without #)"
            : ""
        }
        onChange={(newValue) => setColor(newValue)}
        placeholder={"HEX format (without #)"}
        info={"The color must be formatted in hexadecimal (without #). You can preview the color in the Action Panel"}
      />
      <Form.TextField
        title={"Image URL"}
        id={"image"}
        error={
          img.length > 0 && title.length === 0 && author.length === 0
            ? "This image will cause the embed not to show. Discord will only render the image without the embed."
            : img.length > 0 && !img.match(/^(https?|ftp):\/\/[^\s/$.?#]+\.\S+$/)
            ? "The image must be a valid URL"
            : ""
        }
        defaultValue={launchContext?.image || draftValues?.image}
        onChange={(newValue) => setImg(newValue)}
      />
      <Form.TextField
        title={"Redirect URL"}
        id={"redirect"}
        error={
          redirect.length > 0 && !redirect.match(/^(https?|ftp):\/\/[^\s/$.?#]+\.\S+$/)
            ? "The redirect URL must be a valid URL"
            : ""
        }
        onChange={(newValue) => setRedirect(newValue)}
        defaultValue={launchContext?.redirect || draftValues?.redirect}
      />
      <Form.Separator />
      <Form.Description
        title={"Important"}
        text={
          "If you include an image without a title or an author (even if you have a description), Discord will only render the image without an embed. Though, you can include a description without author or title if there's no image"
        }
      />
    </Form>
  );
}

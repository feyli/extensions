import {
  ActionPanel,
  List,
  Action,
  showToast,
  launchCommand,
  Toast,
  Icon,
  LocalStorage,
  LaunchType,
} from "@raycast/api";
import { launch, Values } from "./functions";
import { useEffect, useState } from "react";

export default function Command() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [items, setItems] = useState<{ name: number; image?: string; values: Values }[]>([]);
  const [searchText, setSearchText] = useState("");
  const [filteredList, filterList] = useState<{ name: number; values: Values }[]>([]);

  useEffect(() => {
    async function main() {
      const array = [] as { name: number; values: object }[];
      const storage = await LocalStorage.allItems();

      Object.keys(storage).forEach(function (key: string) {
        const params = new URLSearchParams(new URL(storage[key]).search);
        const settings = Object.fromEntries(params.entries());

        array.push({
          name: Number(key),
          values: {
            author: settings.author,
            title: settings.title,
            description: settings.description,
            color: settings.color,
            image: settings.image,
            redirect: settings.redirect,
          },
        });
        array.sort((a, b) => {
          return b.name - a.name;
        });
        filterList(array);
        setItems(array);
      });
    }

    main().then(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (searchText === "") return filterList(items);

    filterList(
      items.filter(
        (item) =>
          Object.keys(item.values).some((key) =>
            (item.values as Record<string, string | undefined>)[key]?.toLowerCase().includes(searchText.toLowerCase())
          ) ||
          new Date(item.name)
            .toLocaleString("en-UK", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
              second: "numeric",
            })
            .toLowerCase()
            .includes(searchText.toLowerCase())
      )
    );
  }, [searchText]);

  return (
    <List
      isShowingDetail={filteredList.length !== 0}
      onSearchTextChange={(text) => setSearchText(text)}
      filtering={false}
      searchBarPlaceholder={"You can search an embed using any of its property"}
      isLoading={isLoading}
    >
      {items.length !== 0 && !isLoading ? (
        filteredList.length !== 0 ? (
          filteredList.map((item) => (
            <List.Item
              title={new Date(item.name).toLocaleString()}
              icon={Icon.List}
              key={item.name}
              actions={
                <ActionPanel>
                  <ActionPanel.Item
                    title={"Open in Generator"}
                    onAction={() =>
                      launch(
                        item.values.author,
                        item.values.title,
                        item.values.description,
                        item.values.color,
                        item.values.image,
                        item.values.redirect
                      )
                    }
                    icon={Icon.Maximize}
                  />
                  <ActionPanel.Item
                    title="Delete From History"
                    onAction={async () => {
                      await LocalStorage.removeItem(item.name.toString());
                      setItems(items.filter((i) => i.name !== item.name));
                      filterList(items.filter((i) => i.name !== item.name));
                      await showToast(Toast.Style.Success, "Deleted embed from history");
                    }}
                    shortcut={{ modifiers: ["cmd"], key: "backspace" }}
                    icon={Icon.Trash}
                    style={Action.Style.Destructive}
                  />
                  <ActionPanel.Item
                    title="Clear History"
                    onAction={async () => {
                      await LocalStorage.clear();
                      setItems([]);
                      filterList([]);
                      await showToast(Toast.Style.Success, "Cleared history");
                    }}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
                    style={Action.Style.Destructive}
                    icon={Icon.Multiply}
                  />
                </ActionPanel>
              }
              detail={
                <List.Item.Detail
                  markdown={item.values.image ? `![Embed Image](${item.values.image})` : ""}
                  metadata={
                    <List.Item.Detail.Metadata>
                      <List.Item.Detail.Metadata.Label title={"Information"} />
                      <List.Item.Detail.Metadata.Label
                        title={"Creation Date"}
                        icon={Icon.Clock}
                        text={new Date(item.name).toLocaleString("en-UK", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          minute: "numeric",
                          hour: "numeric",
                          second: "numeric",
                        })}
                      />
                      {item.values.author && (
                        <>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label title={"Author"} text={item.values.author} />
                        </>
                      )}
                      {item.values.title && (
                        <>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label title={"Title"} text={item.values.title} />
                        </>
                      )}
                      {item.values.description && (
                        <>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label title={"Description"} text={item.values.description} />
                        </>
                      )}
                      {item.values.color && (
                        <>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Label
                            title={"Color"}
                            icon={{ source: Icon.CircleFilled, tintColor: item.values.color }}
                            text={item.values.color}
                          />
                        </>
                      )}
                      {item.values.redirect && (
                        <>
                          <List.Item.Detail.Metadata.Separator />
                          <List.Item.Detail.Metadata.Link
                            title={"Redirection"}
                            text={item.values.redirect}
                            target={item.values.redirect}
                          />
                        </>
                      )}
                    </List.Item.Detail.Metadata>
                  }
                />
              }
            />
          ))
        ) : (
          <List.EmptyView
            title={"Nothing was found with your search query"}
            description={"Reminder: you can search an embed using any of its property"}
            icon={Icon.ClearFormatting}
          />
        )
      ) : (
        <List.EmptyView
          title={"Your history is empty"}
          description={"Create an embed by pressing Enter"}
          icon={Icon.XMarkCircle}
          actions={
            <ActionPanel>
              <ActionPanel.Item
                title={"Open The Generator"}
                icon={Icon.Forward}
                onAction={() => launchCommand({ name: "generate", type: LaunchType.UserInitiated })}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}

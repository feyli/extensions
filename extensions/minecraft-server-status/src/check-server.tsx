import { Form, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { getStatus, ServerStatus } from "./index";
import { useState } from "react";
import Style = Toast.Style;

type Values = {
  address: string;
  port: number;
  bedrock: boolean;
};

export default function Command() {
  const [data, setData] = useState<ServerStatus | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function updateData(values: Values) {
    setIsLoading(true);
    await showToast({ title: "Loading data...", style: Style.Animated });
    const response: ServerStatus = await (await getStatus(values.address, values.bedrock, values.port)).json();
    setData(response);
    setIsLoading(false);
    await showToast({ title: "Loaded data!", style: Style.Success });
  }

  return (
    <Form
      isLoading={isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={updateData} />
        </ActionPanel>
      }
    >
      <Form.Description text="Please enter server details below." />
      <Form.TextField id="address" title="Address" placeholder="Hostname/IP address" storeValue />
      <Form.TextField
        id="port"
        title="Port"
        placeholder="Usually 25565"
        info="This isn't always required."
        storeValue
      />
      <Form.Checkbox id="checkbox" title="Bedrock" label="True?" storeValue />
    </Form>
  );
}

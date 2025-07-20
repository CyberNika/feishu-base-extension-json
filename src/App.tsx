import { useEffect, useMemo, useState, useRef } from "react";

import { bitable } from "@lark-base-open/js-sdk";
import { Button, Divider, Form, Toast, Typography } from "@douyinfe/semi-ui";
import { JsonEditor } from "json-edit-react";

import "./App.css";
import { FormApi } from "@douyinfe/semi-ui/lib/es/form";

export default function App() {
  const formApiRef =
    useRef<FormApi<Awaited<ReturnType<typeof bitable.base.getSelection>>>>();

  const [selectedCellText, setSelectedCellText] = useState<any>();
  const selectedCellData = useMemo(() => {
    console.log("selectedCellText", selectedCellText);

    if (selectedCellText === "") {
      return {
        type: "empty-text",
        message: "请添加 JSON 数据",
        data: {},
      } as const;
    }

    if (!selectedCellText) {
      return {
        type: "empty",
        message: "请选择 JSON 数据",
        data: selectedCellText,
      } as const;
    }

    try {
      const object = JSON.parse(selectedCellText);

      return {
        type: "json",
        message: "success",
        data: object,
      } as const;
    } catch (error) {
      console.log("JSON 解析失败", selectedCellText);

      return {
        type: "non-json",
        message: "不是合法的 JSON",
        data: selectedCellText,
      } as const;
    }
  }, [selectedCellText]);
  const syncSelectionCellText = async (s = formApiRef.current?.getValues()) => {
    if (s?.tableId && s.recordId && s.fieldId) {
      const table = await bitable.base.getTableById(s.tableId);

      const cellValues = await table.getCellValue(s.fieldId, s.recordId);

      if (Array.isArray(cellValues)) {
        const text = cellValues?.map((item: any) => item.text).join("");

        setSelectedCellText(text);
      } else if (!cellValues) {
        setSelectedCellText("");
      } else {
        setSelectedCellText(undefined);
      }
    } else {
      setSelectedCellText(undefined);
    }
  };

  useEffect(() => {
    const syncSelectionValue = async () => {
      const selection = await bitable.base.getSelection();

      formApiRef.current?.setValues(selection);

      syncSelectionCellText(selection);
    };

    syncSelectionValue();

    const off = bitable.base.onSelectionChange(async () => {
      syncSelectionValue();
    });

    return () => {
      off();
    };
  }, []);

  return (
    <main className="main">
      <div
        style={{
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography.Title heading={6}>数据</Typography.Title>

        <div>
          <Button
            size="small"
            theme="solid"
            disabled={!formApiRef.current?.getValue("tableId")}
            onClick={async () => {
              const selection = formApiRef.current?.getValues();

              if (
                selection?.tableId &&
                selection.recordId &&
                selection.fieldId
              ) {
                const table = await bitable.base.getTableById(
                  selection.tableId
                );
                await table.setCellValue(
                  selection.fieldId,
                  selection.recordId,
                  selectedCellText
                );
              } else {
                Toast.error("请选择数据");
              }
            }}
          >
            保存
          </Button>
          <Button
            size="small"
            style={{ marginLeft: 5 }}
            theme="outline"
            onClick={() => {
              syncSelectionCellText();
            }}
          >
            重置
          </Button>
        </div>
      </div>

      {selectedCellData.type === "json" ||
      selectedCellData.type === "empty-text" ? (
        <JsonEditor
          data={selectedCellData.data}
          rootName="data"
          collapse={1}
          setData={(value) => {
            setSelectedCellText(JSON.stringify(value));
          }}
        />
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "#999",
            border: "1px solid #eee",
            borderRadius: 4,
            padding: "10px 0",
            fontSize: 14,
          }}
        >
          {selectedCellData.message}
        </div>
      )}

      <Divider style={{ margin: "15px 0" }} />

      <Typography.Title heading={6} style={{ marginBottom: 6 }}>
        选区
      </Typography.Title>

      <Form
        labelPosition="inset"
        getFormApi={(formApi) => {
          formApiRef.current = formApi;
        }}
      >
        <Form.Input label="baseId" field="baseId" readonly />
        <Form.Input label="tableId" field="tableId" readonly />
        <Form.Input label="viewId" field="viewId" readonly />
        <Form.Input label="fieldId" field="fieldId" readonly />
        <Form.Input label="recordId" field="recordId" readonly />
      </Form>
    </main>
  );
}

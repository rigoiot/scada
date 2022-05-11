import React from "react";
import { InputNumber, Form, Table, Input, Select } from "antd";
import InputColor from "./inputColor";
import styles from "./TslPropertyTable.less";

const { Option } = Select;

interface ModalFormProps {
  tslPropertys: [];
  handleTslPropertys: (value: any) => void;
  type: string;
  system: string;
}

const markPosition = [
  {
    value: "insideStartTop",
    label: "头部上",
  },
  {
    value: "insideStartBottom",
    label: "头部下",
  },
  {
    value: "middle",
    label: "中部上",
  },
  {
    value: "insideMiddleBottom",
    label: "中部下",
  },
  {
    value: "insideEndTop",
    label: "尾部上",
  },
  {
    value: "insideEndBottom",
    label: "尾部下",
  },
];

const TslPropertyTable: React.FC<ModalFormProps> = (props) => {
  const { tslPropertys, handleTslPropertys, type, system } = props;
  const columns = [
    ["station", "iot"].includes(system) && {
      title: "连接设备",
      dataIndex: system === "station" ? "equipmentName" : "deviceNickname",
      ellipsis: true,
      width: 140,
    },
    {
      title: "功能名称",
      dataIndex: "tslPropertyName",
      ellipsis: true,
      width: 160,
    },
    {
      title: "标识符",
      dataIndex: "identifier",
      ellipsis: true,
      width: 100,
    },
  ].filter(Boolean);
  const pieColumns = [
    ...columns,
    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      width: 100,
      fixed: "right",
      render: (value: any, record: any) => (
        <a
          onClick={() => {
            const temArr = tslPropertys.filter((item) => {
              return item.tslPropertyId !== record.tslPropertyId;
            });
            handleTslPropertys(temArr);
          }}
        >
          移除
        </a>
      ),
    },
  ];
  const chartColumns = [
    ...columns,
    {
      title: "曲线乘数",
      dataIndex: "chartNum",
      width: 120,
      render: (value: any, record: any) => {
        return (
          <InputNumber
            min={0}
            defaultValue={value || 1}
            value={value}
            onChange={(val) => {
              const arr = tslPropertys.map((rs: any) => {
                if (
                  rs.deviceId === record.deviceId &&
                  rs.tslPropertyId === record.tslPropertyId
                ) {
                  return { ...rs, chartNum: val };
                } else {
                  return rs;
                }
              });
              handleTslPropertys(arr);
            }}
          />
        );
      },
    },
    {
      title: "曲线颜色",
      dataIndex: "chartColor",
      width: 180,
      render: (value: any, record: any) => {
        return (
          <Form.Item
            valuePropName="color"
            className={styles.inputColor}
            style={{ width: "100%" }}
          >
            <InputColor
              color={value}
              onChange={(val) => {
                const arr = tslPropertys.map((rs: any) => {
                  if (
                    rs.deviceId === record.deviceId &&
                    rs.tslPropertyId === record.tslPropertyId
                  ) {
                    return { ...rs, chartColor: val?.hex };
                  } else {
                    return rs;
                  }
                });
                handleTslPropertys(arr);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "设定值",
      dataIndex: "markLine",
      width: 500,
      render: (value: any, record: any) => {
        return (
          <div style={{ display: "flex" }}>
            <InputNumber
              placeholder="设定值"
              style={{ width: "25%" }}
              defaultValue={value?.markNum}
              value={value?.markNum}
              onChange={(val) => {
                const arr = tslPropertys.map((rs: any) => {
                  if (
                    rs.deviceId === record.deviceId &&
                    rs.tslPropertyId === record.tslPropertyId
                  ) {
                    return { ...rs, markLine: { ...value, markNum: val } };
                  } else {
                    return rs;
                  }
                });
                handleTslPropertys(arr);
              }}
            />
            <Input
              style={{ width: "25%", marginLeft: "5px" }}
              value={value?.markData}
              onChange={({ target }) => {
                const arr = tslPropertys.map((rs: any) => {
                  if (
                    rs.deviceId === record.deviceId &&
                    rs.tslPropertyId === record.tslPropertyId
                  ) {
                    return {
                      ...rs,
                      markLine: { ...value, markData: target.value },
                    };
                  } else {
                    return rs;
                  }
                });
                handleTslPropertys(arr);
              }}
              placeholder="提示"
            />
            <Select
              style={{ width: "25%", margin: "0 5px" }}
              placeholder="位置"
              value={value?.markPosition}
              onSelect={(val) => {
                const arr = tslPropertys.map((rs: any) => {
                  if (
                    rs.deviceId === record.deviceId &&
                    rs.tslPropertyId === record.tslPropertyId
                  ) {
                    return { ...rs, markLine: { ...value, markPosition: val } };
                  } else {
                    return rs;
                  }
                });
                handleTslPropertys(arr);
              }}
            >
              {markPosition.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
            <Form.Item
              valuePropName="color"
              className={styles.inputColor}
              style={{ width: "25%" }}
            >
              <InputColor
                color={value?.markColor || "#ff0000"}
                onChange={(val) => {
                  const arr = tslPropertys.map((rs: any) => {
                    if (
                      rs.deviceId === record.deviceId &&
                      rs.tslPropertyId === record.tslPropertyId
                    ) {
                      return {
                        ...rs,
                        markLine: { ...value, markColor: val?.hex },
                      };
                    } else {
                      return rs;
                    }
                  });
                  handleTslPropertys(arr);
                }}
              />
            </Form.Item>
          </div>
        );
      },
    },
    {
      title: "操作",
      dataIndex: "option",
      valueType: "option",
      width: 100,
      fixed: "right",
      render: (value: any, record: any) => (
        <a
          onClick={() => {
            const temArr = tslPropertys.filter((item) => {
              return item.tslPropertyId !== record.tslPropertyId;
            });
            handleTslPropertys(temArr);
          }}
        >
          移除
        </a>
      ),
    },
  ];
  return (
    <Table
      className={styles.table}
      dataSource={tslPropertys}
      columns={type === "chart" ? chartColumns : pieColumns}
      scroll={{ x: columns.length * 60 }}
      pagination={false}
    />
  );
};

export default TslPropertyTable;

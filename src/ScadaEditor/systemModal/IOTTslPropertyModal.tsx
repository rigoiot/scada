import React, { useState, useRef, useEffect } from "react";
import { Modal, Select, message } from "antd";
import ProTable, { ProColumns } from "@ant-design/pro-table";
import SearchForm from "@/components/CreateForm/SearchForm";
import { dataTypes } from "./Constant";
import ExtendConfig from "./ExtendConfig";

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  scadaModelID: string;
  type: string;
  queryAllTslPropertiesByGatewayID: (val: any) => void;
  queryAllDeviceDataSources: (val: any) => void;
}

const PropertyModal: React.FC<ModalFormProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    scadaModelID,
    type,
    queryAllTslPropertiesByGatewayID,
    queryAllDeviceDataSources,
  } = props;
  const [sorter, setSorter] = useState<any>({});
  const [tslProperty, setTslProperty] = useState<any>({});
  const [gateways, setGateways] = useState([]);
  const [gatewayId, setGatewayId] = useState("");
  const [extendVisible, setExtendVisible] = useState<boolean>(false);
  const [values, setValues] = useState({});
  const [tslPropertys, setTslPropertys] = useState<any>([]);
  const [selectType, setSelectType] = useState<string>("radio");
  const actionRef = useRef<any>();
  useEffect(() => {
    queryAllDeviceDataSources({ scadaModelID: scadaModelID, pageSize: 0 })
      .then((res) => {
        setGateways(res.data);
        setGatewayId(res.data[0]?.gateway.id);
      })
      .catch(() => {
        message.error("查询失败");
      });
    switch (type) {
      case "chart":
        setSelectType("checkbox");
        break;
      case "pie":
        setSelectType("checkbox");
        break;
      default:
        setSelectType("radio");
    }
  }, []);
  useEffect(() => {
    if (gatewayId) {
      actionRef.current && actionRef.current.reset();
      actionRef.current && actionRef.current.reload();
    }
  }, [gatewayId]);
  const columns: ProColumns[] = [
    {
      title: "连接设备",
      dataIndex: "device",
      ellipsis: true,
      hideInSearch: true,
      width: 140,
      renderText: (val) => val?.deviceNickname,
    },
    {
      title: "通道",
      dataIndex: "device",
      ellipsis: true,
      hideInSearch: true,
      width: 140,
      renderText: (val) => val.channel?.channelName,
    },
    {
      title: "协议",
      dataIndex: "device",
      ellipsis: true,
      hideInSearch: true,
      width: 100,
      renderText: (val) => val.channel?.protocolType,
    },
    {
      title: "功能名称",
      dataIndex: "tslProperty",
      ellipsis: true,
      hideInSearch: true,
      width: 180,
      renderText: (val) => val?.name,
    },
    {
      title: "标识符",
      dataIndex: "tslProperty",
      hideInSearch: true,
      width: 180,
      renderText: (val) => val?.identifier,
    },
    {
      title: "数据类型",
      dataIndex: "tslProperty",
      ellipsis: true,
      hideInSearch: true,
      width: 180,
      renderText: (val) => {
        const dt = _.nth(
          _.filter(dataTypes, { value: val?.dataType && val?.dataType.type }),
          0
        );
        return dt ? <span>{`${dt.name}${dt.desc}`}</span> : "-";
      },
    },
    {
      title: "扩展描述",
      dataIndex: "tslProperty",
      hideInSearch: true,
      width: 100,
      render: (val) => {
        return (
          <a
            onClick={() => {
              setValues(val?.extendConfig);
              setExtendVisible(true);
            }}
          >
            扩展描述详情
          </a>
        );
      },
    },
  ];
  const inlineColumns = [
    {
      dataIndex: "key",
      placeholder: "功能名称",
    },
  ];
  const handleSubmit = () => {
    const tag = Math.random().toString(16).substr(2, 6);
    if (type === "chart" || type === "pie") {
      const arr = tslPropertys.map((rs: any) => {
        return {
          deviceId: rs.device?.id,
          deviceNickname: rs.device?.deviceNickname,
          tslPropertyId: rs.tslProperty?.id,
          tslPropertyName: rs.tslProperty?.name,
          identifier: rs.tslProperty?.identifier,
          chartColor:
            "#" + Math.random().toString(16).substr(2, 6).toUpperCase(),
          chartNum: 1,
        };
      });
      onSubmit({ [tag]: arr });
    } else {
      const {
        device: { channel },
      } = tslProperty;
      const registerAddress =
        tslProperty.tslProperty?.extendConfig?.registerAddress;
      const isBit = tslProperty.tslProperty?.extendConfig?.type === "bits";
      const bitVal = tslProperty.tslProperty?.extendConfig?.bitMask;
      let register =
        registerAddress !== undefined
          ? `${Number(registerAddress) + 1}/${registerAddress}`
          : "";
      if (isBit && bitVal !== undefined) {
        const bitShow = Math.log2(bitVal);
        register =
          registerAddress !== undefined
            ? `${
                Number(registerAddress) + 1
              }.${bitShow}/${registerAddress}.${bitShow}`
            : "";
      }
      onSubmit({
        [tag]: {
          tslPropertyId: tslProperty.tslProperty.id,
          name:
            channel?.protocolType === "modbus"
              ? tslProperty.tslProperty.name + "  地址: " + register
              : tslProperty.tslProperty.name,
          deviceId: tslProperty.device.id,
          identifier: tslProperty.tslProperty?.identifier,
          title: tslProperty.tslProperty.name,
          unit: tslProperty.tslProperty?.dataType?.specs?.unitName,
        },
      });
    }
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      width={1104}
      destroyOnClose
      title=""
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      cancelText="取消"
      okText="确定"
    >
      <ProTable
        tableLayout="fixed"
        options={{
          fullScreen: false,
          density: false,
          reload: true,
          setting: false,
        }}
        actionRef={actionRef}
        rowKey={(record, index) =>
          `complete${record?.tslProperty?.id}${record?.device?.id}${index}`
        }
        rowSelection={{
          type: selectType,
          onSelect: (selectedRows) => {
            setTslProperty(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            setTslPropertys(selectedRows);
          },
        }}
        tableAlertRender={false}
        params={sorter}
        headerTitle={
          <div style={{ display: "flex" }}>
            {gateways.length !== 0 && (
              <Select
                defaultValue={gateways[0]?.gateway?.id}
                onSelect={(val) => {
                  setGatewayId(val);
                  actionRef.current && actionRef.current.reload();
                }}
                style={{
                  marginRight: "10px",
                  width: "191px",
                  paddingTop: "10px",
                }}
              >
                {gateways.map((v: any) => (
                  <Select.Option key={v.gateway?.id} value={v.gateway?.id}>
                    {v.gateway?.gatewayName}
                  </Select.Option>
                ))}
              </Select>
            )}
            <SearchForm
              columns={inlineColumns}
              onSearch={(rs: any) => {
                setSorter(rs);
                actionRef.current && actionRef.current.reset();
                actionRef.current && actionRef.current.reload();
              }}
            />
          </div>
        }
        search={false}
        scroll={{
          x: columns.length * 60,
        }}
        request={(params) =>
          gatewayId &&
          queryAllTslPropertiesByGatewayID({
            gatewayID: gatewayId,
            ...params,
          })
        }
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共有${total}条`,
        }}
      />
      {visible && (
        <ExtendConfig
          visible={extendVisible}
          onCancle={() => {
            setValues({});
            setExtendVisible(false);
          }}
          values={values}
        />
      )}
    </Modal>
  );
};

export default PropertyModal;

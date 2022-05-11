import React, { useState, useRef, useEffect } from "react";
import { Modal, Select, message } from "antd";
import ProTable, { ProColumns } from "@ant-design/pro-table";
import SearchForm from "@/components/CreateForm/SearchForm";
import { Equipment } from "./data";
import { dataTypes } from "./Constant";
import ExtendConfig from "./ExtendConfig";
import { category } from "@/utils/utils";

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  stationID: string;
  type: string;
  queryAllTslPropertiesInStation: (values: any) => void;
  queryAllEquipments: (values: any) => void;
}

const PropertyModal: React.FC<ModalFormProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    stationID,
    type,
    queryAllTslPropertiesInStation,
    queryAllEquipments,
  } = props;
  const [sorter, setSorter] = useState<any>({});
  const [tslProperty, setTslProperty] = useState<any>({});
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [equipment, setEquipment] = useState<Equipment>({});
  const [values, setValues] = useState({});
  const [extendVisible, setExtendVisible] = useState<boolean>(false);
  const [tslPropertys, setTslPropertys] = useState<any>([]);
  const [selectType, setSelectType] = useState<string>("radio");
  const actionRef = useRef<any>();
  useEffect(() => {
    queryAllEquipments({
      stationID,
      pageSize: 0,
      isGroup: false,
      sorter: "name asc",
      category,
    })
      .then((res) => {
        setEquipments(res.data);
        setEquipment(res.data[0]);
      })
      .catch(() => {
        message.error("查询异常");
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
    if (equipments?.id) {
      actionRef.current && actionRef.current.reset();
      actionRef.current && actionRef.current.reload();
    }
  }, [equipment?.id]);
  const columns: ProColumns[] = [
    {
      title: "连接设备",
      dataIndex: ["equipment", "name"],
      ellipsis: true,
      hideInSearch: true,
      width: 140,
    },
    {
      title: "功能名称",
      dataIndex: ["tslProperty", "name"],
      ellipsis: true,
      hideInSearch: true,
      width: 180,
    },
    {
      title: "标识符",
      dataIndex: ["tslProperty", "identifier"],
      hideInSearch: true,
      width: 180,
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
    if (tslProperty?.tslProperty?.id || tslPropertys.length !== 0) {
      const tag = Math.random().toString(16).substr(2, 6);
      if (type === "chart" || type === "pie") {
        const arr = tslPropertys.map((rs: any) => {
          return {
            deviceId: rs.equipment?.deviceID,
            equipmentName: rs.equipment?.name,
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
        onSubmit({
          [tag]: {
            tslPropertyId: tslProperty.tslProperty.id,
            name: tslProperty.tslProperty.name,
            deviceId: tslProperty.equipment?.deviceID,
            identifier: tslProperty.tslProperty?.identifier,
            title: tslProperty.tslProperty.name,
            unit: tslProperty?.tslProperty?.dataType?.specs?.unitName,
          },
        });
      }
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
        headerTitle={
          <div style={{ display: "flex" }}>
            {equipments.length !== 0 && (
              <Select
                defaultValue={equipments[0]?.id}
                onSelect={(val, option) => {
                  setEquipment(option.equipment);
                  actionRef.current && actionRef.current.reload();
                }}
                style={{
                  marginRight: "10px",
                  width: "191px",
                }}
              >
                {equipments.map((v: any) => (
                  <Select.Option key={v?.id} value={v?.id} equipment={v}>
                    {v?.name}
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
        params={{
          ...sorter,
          equipmentID: equipment?.id,
          stationID,
        }}
        request={(params) => {
          if (!params?.equipmentID) {
            return Promise.resolve([]) as any;
          }
          return queryAllTslPropertiesInStation(params);
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共有${total}条`,
        }}
      />
      {extendVisible && (
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

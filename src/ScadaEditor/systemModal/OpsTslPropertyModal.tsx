import React, { useState, useRef, useEffect } from 'react';
import { Modal, message } from 'antd';
import ProTable from '@ant-design/pro-table';
import SearchForm from '@/components/CreateForm/SearchForm';
import { dataTypes } from './Constant';
import ExtendConfig from './ExtendConfig';
import { HandleRequest } from '../../util';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  equipmentID: string;
  type: string;
  queryAllEquipmentVariable: (values: any) => void;
}

const PropertyModal: React.FC<ModalFormProps> = props => {
  const { onSubmit, onCancel, visible, equipmentID, type, queryAllEquipmentVariable } = props;
  const [sorter, setSorter] = useState<any>({});
  const [tslProperty, setTslProperty] = useState<any>({});
  const [values, setValues] = useState({});
  const [extendVisible, setExtendVisible] = useState<boolean>(false);
  const [tslPropertys, setTslPropertys] = useState<any>([]);
  const [selectType, setSelectType] = useState<string>('radio');
  const [loading, setLoading] = useState<boolean>(true);
  const [variableList, setVariableList] = useState<any[]>([]);
  const [showVariableList, setShowVariableList] = useState<any[]>([]);
  const actionRef = useRef<any>();

  const queryEquipmentVariables = () => {
    if (!equipmentID) {
      return;
    }
    setLoading(true);
    HandleRequest(queryAllEquipmentVariable, {
      equipmentID,
      pageSize: 0,
    }).then(rs => {
      setLoading(false);
      if (rs.error) {
        message.error(`表格查询异常(${rs.error})`);
        return;
      }
      setVariableList(
        (rs.data || []).sort((a, b) =>
          `${a.property?.name || ''}`.localeCompare(`${b.property?.name || ''}`, 'zh-CN')
        )
      );
    });
  };

  useEffect(() => {
    switch (type) {
      case 'chart':
        setSelectType('checkbox');
        break;
      case 'pie':
        setSelectType('checkbox');
        break;
      default:
        setSelectType('radio');
    }
  }, []);

  useEffect(() => queryEquipmentVariables(), equipmentID);

  useEffect(() => {
    if (variableList.length) {
      let tmp: any[] = variableList;
      setLoading(true);
      if (sorter.key) {
        tmp = variableList.filter(
          v => v.property.name.includes(sorter.key) || v.property.identifier.includes(sorter.key)
        );
      }
      setLoading(false);
      setShowVariableList(tmp);
    } else {
      setShowVariableList([]);
    }
  }, [variableList, sorter]);
  const columns = [
    {
      title: '功能名称',
      dataIndex: ['property', 'name'],
      ellipsis: true,
      width: 150,
    },
    {
      title: '标识符',
      dataIndex: ['property', 'identifier'],
      ellipsis: true,
      width: 100,
    },
    {
      title: '采集模型名称',
      dataIndex: ['equipmentConf', 'device', 'product', 'productName'],
      width: 150,
      ellipsis: true,
    },
    {
      title: '关联网关名称',
      dataIndex: ['equipmentConf', 'opsGateway', 'name'],
      width: 150,
      ellipsis: true,
    },
    {
      title: '数据类型',
      dataIndex: ['property', 'dataType'],
      ellipsis: true,
      width: 150,
      renderText: (dataType: any) => {
        if (!dataType?.type) {
          return '-';
        }
        const dt = dataTypes.find(x => x.value === dataType?.type) || {
          name: dataType.type,
          desc: '',
        };
        return dt ? `${dt.name}${dt.desc}` : '-';
      },
    },
    {
      title: '扩展描述',
      dataIndex: ['property', 'extendConfig'],
      hideInSearch: true,
      width: 100,
      render: val =>
        val ? (
          <a
            onClick={() => {
              setValues(val);
              setExtendVisible(true);
            }}
          >
            扩展描述详情
          </a>
        ) : (
          '-'
        ),
    },
  ];
  const inlineColumns = [
    {
      dataIndex: 'key',
      placeholder: '功能名称/标识符',
    },
  ];
  const handleSubmit = () => {
    if (tslProperty?.property?.id || tslPropertys.length !== 0) {
      const tag = Math.random()
        .toString(16)
        .substr(2, 6);
      if (type === 'chart' || type === 'pie') {
        const arr = tslPropertys.map((rs: any) => {
          return {
            deviceId: rs.equipmentConf?.deviceID,
            tslPropertyId: rs.property?.id,
            tslPropertyName: rs.property?.name,
            identifier: rs.property?.identifier,
            chartColor:
              '#' +
              Math.random()
                .toString(16)
                .substr(2, 6)
                .toUpperCase(),
            chartNum: 1,
          };
        });
        onSubmit({ [tag]: arr });
      } else {
        onSubmit({
          [tag]: {
            tslPropertyId: tslProperty.property.id,
            name: tslProperty.property.name,
            deviceId: tslProperty.equipmentConf?.deviceID,
            identifier: tslProperty.property?.identifier,
            title: tslProperty.property.name,
            unit: tslProperty?.property?.dataType?.specs?.unitName,
          },
        });
      }
    }
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
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
          reload: false,
          setting: false,
        }}
        actionRef={actionRef}
        rowKey={record => `complete${record?.property?.id}${record?.equipmentConf?.deviceID}`}
        rowSelection={{
          type: selectType,
          preserveSelectedRowKeys: true,
          onSelect: selectedRows => {
            setTslProperty(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            setTslPropertys(selectedRows);
          },
        }}
        loading={loading}
        dataSource={showVariableList}
        tableAlertRender={false}
        headerTitle={
          <div style={{ display: 'flex' }}>
            <SearchForm columns={inlineColumns} onSearch={val => setSorter(val)} />
          </div>
        }
        search={false}
        scroll={{
          x: columns.length * 60,
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: total => `共有${total}条`,
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

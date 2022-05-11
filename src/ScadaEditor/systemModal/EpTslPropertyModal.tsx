import React, { useState, useRef, useEffect } from 'react';
import { Modal, Select, message } from 'antd';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import SearchForm from '@/components/CreateForm/SearchForm';
import { Monitor } from './data';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  enterpriseID: string;
  type: string;
  getAllMonitors: (values: any) => void;
  getAllTslProperties: (values: any) => void;
}

const PropertyModal: React.FC<ModalFormProps> = props => {
  const {
    onSubmit,
    onCancel,
    visible,
    enterpriseID,
    type,
    getAllMonitors,
    getAllTslProperties,
  } = props;
  const [sorter, setSorter] = useState<any>({});
  const [tslProperty, setTslProperty] = useState<any>({});
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [monitor, setMonitor] = useState<Monitor>({});
  const [tslPropertys, setTslPropertys] = useState<any>([]);
  const [selectType, setSelectType] = useState<string>('radio');
  const actionRef = useRef<any>();
  useEffect(() => {
    getAllMonitors({
      enterpriseID,
      pageSize: 0,
      sorter: 'name asc',
    })
      .then(res => {
        setMonitors(res.data);
        setMonitor(res.data[0]);
      })
      .catch(() => {
        message.error('查询异常');
      });
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
  useEffect(() => {
    if (monitor?.id) {
      actionRef.current?.reset();
      actionRef.current?.reload();
    }
  }, [monitor?.id]);
  const columns: ProColumns[] = [
    {
      title: '功能名称',
      dataIndex: 'name',
      width: 180,
      ellipsis: true,
    },
    {
      title: '标识符',
      dataIndex: 'identifier',
      ellipsis: true,
      copyable: true,
      width: 190,
    },
    {
      title: '单位',
      dataIndex: ['dataType', 'type'],
      ellipsis: true,
      width: 140,
      renderText: (text, record) => {
        const { specs } = record.dataType;
        return specs.unitName;
      },
    },
  ];
  const inlineColumns = [
    {
      dataIndex: 'key',
      placeholder: '功能名称',
    },
  ];
  const handleSubmit = () => {
    if (tslProperty?.id || tslPropertys.length !== 0) {
      const tag = Math.random()
        .toString(16)
        .substr(2, 6);
      if (type === 'chart' || type === 'pie') {
        const arr = tslPropertys.map((rs: any) => {
          return {
            deviceId: monitor?.deviceID,
            monitorName: monitor?.name,
            tslPropertyId: rs?.id,
            tslPropertyName: rs?.name,
            identifier: rs?.identifier,
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
            tslPropertyId: tslProperty.id,
            name: tslProperty.name,
            deviceId: monitor?.deviceID,
            identifier: tslProperty?.identifier,
            title: tslProperty.name,
            unit: tslProperty?.dataType?.specs?.unitName,
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
          reload: true,
          setting: false,
        }}
        actionRef={actionRef}
        rowKey={(record, index) => `complete${record?.id}${index}`}
        rowSelection={{
          type: selectType,
          onSelect: selectedRows => {
            setTslProperty(selectedRows);
          },
          onChange: (selectedRowKeys, selectedRows) => {
            setTslPropertys(selectedRows);
          },
        }}
        tableAlertRender={false}
        headerTitle={
          <div style={{ display: 'flex' }}>
            {monitors.length !== 0 && (
              <Select
                defaultValue={monitors[0]?.id}
                onSelect={(val, option) => {
                  setMonitor(option.monitor);
                  actionRef.current?.reset();
                  actionRef.current?.reload();
                }}
                style={{
                  marginRight: '10px',
                  width: '191px',
                }}
              >
                {monitors.map((v: any) => (
                  <Select.Option key={v?.id} value={v?.id} monitor={v}>
                    {v?.name}
                  </Select.Option>
                ))}
              </Select>
            )}
            <SearchForm
              columns={inlineColumns}
              onSearch={(rs: any) => {
                setSorter(rs);

                actionRef.current?.reset();
                actionRef.current?.reload();
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
          productId: monitor?.productID,
        }}
        request={params => {
          if (!params?.productId) {
            return Promise.resolve([]) as any;
          }
          return getAllTslProperties(params);
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: total => `共有${total}条`,
        }}
      />
    </Modal>
  );
};

export default PropertyModal;

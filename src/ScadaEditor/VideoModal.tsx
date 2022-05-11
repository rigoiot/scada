import React, { useState, useRef } from 'react';
import { Modal } from 'antd';
import ProTable, { ProColumns } from '@ant-design/pro-table';
import SearchForm from '@/components/CreateForm/SearchForm';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  id: string;
  system: string;
  queryAllVideos: (val: any) => void;
}

const VideoModal: React.FC<ModalFormProps> = props => {
  const { onSubmit, onCancel, visible, id, queryAllVideos, system } = props;
  const [sorter, setSorter] = useState<any>({});
  const [video, setVideo] = useState<any>({});

  const actionRef = useRef<any>();
  const columns: ProColumns[] = [
    {
      title: '视频名称',
      dataIndex: 'name',
      ellipsis: true,
      width: 160,
    },
    {
      title: '序列号',
      dataIndex: ['station', 'ep'].includes(system) ? 'deviceSerial' : 'serialNumber',
      ellipsis: true,
      width: 160,
    },
    {
      title: '通道号',
      dataIndex: 'channelNo',
      width: 100,
    },
    {
      title: '视频地址',
      dataIndex: 'videoURL',
      ellipsis: true,
      width: 250,
    },
    {
      title: '视频服务商',
      dataIndex: ['videoTypeInfo', 'name'],
      width: 150,
      ellipsis: true,
    },
  ];
  const inlineColumns = [
    {
      dataIndex: 'key',
      placeholder: '视频名称',
    },
  ];
  const handleSubmit = () => {
    onSubmit({
      name: video.name,
      videoID: video.id,
    });
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      width={900}
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
        rowKey="id"
        rowSelection={{
          type: 'radio',
          onSelect: selectedRows => {
            setVideo(selectedRows);
          },
        }}
        tableAlertRender={false}
        params={sorter}
        headerTitle={
          <SearchForm
            columns={inlineColumns}
            onSearch={(rs: any) => {
              setSorter(rs);
              actionRef.current && actionRef.current.reset();
              actionRef.current && actionRef.current.reload();
            }}
          />
        }
        search={false}
        scroll={{
          x: columns.length * 60,
        }}
        request={params => queryAllVideos({ id, ...params })}
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

export default VideoModal;

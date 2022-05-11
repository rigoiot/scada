import React, { useState } from 'react';
import { Modal, Tabs, Button } from 'antd';
import System from './System';
import styles from './index.less';

const { TabPane } = Tabs;

interface ModalProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  queryScadaGroups: (values: any) => void;
  queryScadaComponents: (values: any) => void;
}

const ImportComponent: React.FC<ModalProps> = props => {
  const { onSubmit, onCancel, visible, queryScadaGroups, queryScadaComponents } = props;
  const [selectData, setSelectData] = useState<any>();

  const handleSubmit = async () => {
    if (selectData) {
      onSubmit(selectData);
    }
  };

  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      width={700}
      destroyOnClose
      title="图库"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          确定
        </Button>,
      ]}
      className={styles.importModal}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="系统图库" key="1">
          <System
            onSelect={val => setSelectData(val)}
            queryScadaGroups={queryScadaGroups}
            queryScadaComponents={queryScadaComponents}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default ImportComponent;

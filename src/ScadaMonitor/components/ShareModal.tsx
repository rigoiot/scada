import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Typography, message } from 'antd';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  deviceId: string;
  queryAccountWeChatConf: () => void;
}

const ShareModal: React.FC<ModalFormProps> = props => {
  const { onCancel, onSubmit, visible, deviceId, queryAccountWeChatConf } = props;
  const [url, setUrl] = useState<string>();

  const getAccountWeChatConf = () => {
    queryAccountWeChatConf().then(rs => {
      if (rs.error) {
        message.error(`链接获取异常(${rs.error}),请稍后再试`);
        return;
      }
      const {
        data: { payload },
      } = rs;
      setUrl(
        `http://c.rigo.io/scada-web/?api=${
          payload.weChatAPI
        }&deviceId=${deviceId}&token=${localStorage.getItem(AUTH_TOKEN_NAME)}&platformType=IOT`
      );
    });
  };

  useEffect(() => {
    getAccountWeChatConf();
  }, []);

  const handleSubmit = () => {
    onSubmit({ url });
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      width={600}
      destroyOnClose
      title="组态分享"
      okText="跳转"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
    >
      <Descriptions>
        <Descriptions.Item label="链接">
          <div style={{ maxWidth: '32em', height: '22px' }}>
            <Typography.Paragraph copyable ellipsis>
              {url}
            </Typography.Paragraph>
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ShareModal;

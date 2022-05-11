import React from 'react';
import { Modal, Descriptions, Typography, Form, Input, Button } from 'antd';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  values: string;
  shareType: string;
}
const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 17 },
};

const ShareModal: React.FC<ModalFormProps> = props => {
  const { onCancel, onSubmit, visible, values, shareType } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    onSubmit(fieldsValue);
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      width={600}
      destroyOnClose
      title={shareType === 'export' ? '分享' : '导入'}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      footer={
        shareType === 'export'
          ? []
          : [
              <Button key="back" onClick={onCancel}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>
                导入
              </Button>,
            ]
      }
    >
      {shareType === 'export' ? (
        <Descriptions>
          <Descriptions.Item label="链接">
            <div style={{ maxWidth: '32em', height: '22px' }}>
              <Typography.Paragraph copyable ellipsis>
                {values}
              </Typography.Paragraph>
            </div>
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Form {...formLayout} form={form}>
          <Form.Item label="注意">
            <span className="ant-form-text">导入画面会覆盖当前画面</span>
          </Form.Item>
          <Form.Item name="url" label="链接" rules={[{ required: true }, { type: 'url' }]}>
            <Input placeholder="请输入链接" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ShareModal;

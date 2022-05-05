import React from 'react';
import { Modal, Form, InputNumber } from 'antd';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 17 },
  wrapperCol: { span: 24 },
};

interface ModalFormProps {
  cancle: () => void;
  confirm: (values: any) => void;
  visible: boolean;
  loading: boolean;
  container: any;
  title: string;
}

const WriteForm: React.FC<ModalFormProps> = props => {
  const { cancle, confirm, visible, loading, container, title } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    confirm(fieldsValue);
  };

  return (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      title={`设置${title}`}
      visible={visible}
      onCancel={cancle}
      onOk={handleSubmit}
      getContainer={container}
    >
      <Form {...formLayout} form={form} layout="vertical">
        <FormItem
          name="write"
          label="写值范围: -2147483648~2147483647 (十进制)"
          rules={[
            {
              required: true,
              message: '请输入写值范围',
            },
          ]}
        >
          <InputNumber style={{ width: '100%' }} min={-2147483648} max={2147483647} />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default WriteForm;

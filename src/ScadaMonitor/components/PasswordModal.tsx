import React from "react";
import { Modal, Form, Input } from "antd";

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};

interface ModalFormProps {
  cancle: () => void;
  confirm: (values: any) => void;
  visible: boolean;
  loading: boolean;
  container: any;
}

const PasswordModal: React.FC<ModalFormProps> = (props) => {
  const { cancle, confirm, visible, loading, container } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    confirm(fieldsValue);
  };

  const CheckLength = (
    value: string,
    label: string = "",
    min?: number,
    max: number = 45
  ) => {
    if (!value) {
      return Promise.resolve();
    }
    const newvalue = value.replace(/[^\x00-\xff]/g, "***");
    if (min && newvalue.length < min) {
      return Promise.reject(
        new Error(`${label}长度限制${min}-${max}位，中文算3位`)
      );
    }
    if (newvalue.length > max) {
      return Promise.reject(new Error(`${label}长度限制${max}位，中文算3位`));
    }
    return Promise.resolve();
  };

  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      title="密码验证"
      visible={visible}
      onCancel={cancle}
      onOk={handleSubmit}
      getContainer={container}
    >
      <Form {...formLayout} form={form}>
        <FormItem
          name="password"
          label="密码"
          rules={[
            {
              required: true,
            },
            {
              validator: (_, value) => CheckLength(value, "密码", 6),
            },
          ]}
        >
          <Input.Password placeholder="请输入密码" />
        </FormItem>
      </Form>
    </Modal>
  );
};

export default PasswordModal;

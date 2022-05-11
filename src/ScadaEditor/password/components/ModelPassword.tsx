import React, { useState, useEffect } from "react";
import { Modal, Form, Input } from "antd";
import { CheckLength } from "../../../util";

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
  type: string;
}

const ModelPassword: React.FC<ModalFormProps> = (props) => {
  const { cancle, confirm, visible, loading, type } = props;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    confirm(fieldsValue);
  };

  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      title={type === "update" ? "修改密码" : "显示密码"}
      visible={visible}
      onCancel={cancle}
      onOk={handleSubmit}
    >
      <Form {...formLayout} form={form}>
        <FormItem
          name="verifyCode"
          label="用户登录密码"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input.Password placeholder="请输入登录用户密码" />
        </FormItem>
        {type === "update" && (
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
        )}
      </Form>
    </Modal>
  );
};

export default ModelPassword;

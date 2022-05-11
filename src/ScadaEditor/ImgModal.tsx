import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Tabs, Radio } from 'antd';
import styles from './modalStyle.less';
import UploadFileServer from '@/components/UploadFileServer';
import CommonProperty from './CommonProperty';

const { TabPane } = Tabs;

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  values: any;
  scadaModelID: string;
  isModal: boolean;
}

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};
const rightFormLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 18 },
};

const ImageModal: React.FC<ModalFormProps> = props => {
  const { onSubmit, onCancel, visible, values, scadaModelID, isModal } = props;
  const [form] = Form.useForm();
  const [radio, setRadio] = useState(1);
  const [showRuleProperty, setShowRuleProperty] = useState<any>({});
  const { propertys } = values;

  useEffect(() => {
    if (values) {
      setShowRuleProperty({});
    }
  }, [values]);

  const handleSubmit = async (showRuleP: any) => {
    const fieldsValue = await form.validateFields();
    if (showRuleP[Object.keys(showRuleP)[0]]) {
      propertys[Object.keys(showRuleP)[0]] = showRuleP[Object.keys(showRuleP)[0]];
      delete propertys[values.showTag];
    }
    onSubmit({
      ...values,
      ...fieldsValue,
      propertys,
      showTag: Object.keys(showRuleP)[0] || values.showTag,
      isModal,
    });
  };
  const imgOnChange = (e: { target: { value: React.SetStateAction<number> } }) => {
    setRadio(e.target.value);
  };

  const renderForm = () =>
    Object.keys(values).length !== 0 && (
      <Form
        {...(isModal ? formLayout : rightFormLayout)}
        form={form}
        initialValues={{
          ...values,
        }}
        size={isModal ? 'middle' : 'small'}
        onValuesChange={() => !isModal && handleSubmit(showRuleProperty)}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab={values.name || '一般设置'} key="1">
            <span style={{ margin: '0 0 20px 20px', display: 'block' }}>
              <Radio.Group value={radio} onChange={imgOnChange}>
                <Radio value={1}>本地上传</Radio>
                <Radio value={2}>URL地址</Radio>
              </Radio.Group>
            </span>
            {radio === 1 && (
              <Form.Item label="图片预览" name="img" labelCol={{ span: isModal ? 4 : 8 }}>
                <UploadFileServer type="jpg/jpeg/png/gif/svg" num={1} size={5} />
              </Form.Item>
            )}
            {radio === 2 && (
              <Form.Item label="URL" name="img" labelCol={{ span: isModal ? 2 : 6 }}>
                <Input />
              </Form.Item>
            )}
          </TabPane>
          <TabPane tab="显示设置" key="2">
            <CommonProperty
              values={values}
              scadaModelID={scadaModelID}
              propertys={propertys}
              onChangeShowProperty={val => {
                setShowRuleProperty(val);
                handleSubmit(val);
              }}
              isModal={isModal}
            />
          </TabPane>
        </Tabs>
      </Form>
    );

  return isModal ? (
    <Modal
      maskClosable={false}
      style={{ top: '60px' }}
      destroyOnClose
      title={values.name || '属性编辑'}
      visible={visible}
      onCancel={onCancel}
      onOk={() => handleSubmit(showRuleProperty)}
      cancelText="取消"
      okText="确定"
      className={styles.modal}
    >
      {renderForm()}
    </Modal>
  ) : (
    renderForm()
  );
};

export default ImageModal;

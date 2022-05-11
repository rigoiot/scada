import React, { useState } from "react";
import { Modal, Tabs, Button, message, Form } from "antd";
import System from "./System";
import UserPalette from "./UserPalette";
import CommonProperty from "../CommonProperty";
import styles from "./index.less";
import { AddProjectField } from "../../util";

const { TabPane } = Tabs;

interface ModalProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  type: string;
  values: any;
  scadaModelID: string;
  system: string;
  deleteScadaUserComponent: (val: any) => void;
  addScadaUserComponent: (val: any) => void;
  queryScadaGroups: (val: any) => void;
  queryAllScadaUserComponents: (val: any) => void;
  queryScadaComponents: (val: any) => void;
  queryCurrent: () => void;
}
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

const Gallery: React.FC<ModalProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    type,
    values,
    scadaModelID,
    system,
    addScadaUserComponent,
    deleteScadaUserComponent,
    queryScadaGroups,
    queryAllScadaUserComponents,
    queryScadaComponents,
    queryCurrent,
  } = props;
  const [selectData, setSelectData] = useState<any>();
  const [tabsKey, setTabsKey] = useState<string>("1");
  const [showRuleProperty, setShowRuleProperty] = useState<any>({});
  const { propertys } = values;
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    if (showRuleProperty[Object.keys(showRuleProperty)[0]]) {
      propertys[Object.keys(showRuleProperty)[0]] =
        showRuleProperty[Object.keys(showRuleProperty)[0]];
      delete propertys[values.showTag];
    }
    onSubmit({
      ...values,
      ...fieldsValue,
      propertys,
      selectData,
      showTag: Object.keys(showRuleProperty)[0] || values.showTag,
    });
  };

  const addUserComponent = () => {
    const value = AddProjectField({
      name: selectData.item?.name,
      groupID: selectData.item?.groupID,
      userComponentData: selectData.item?.componentData,
      userComponentType: selectData.item?.componentType,
    });
    addScadaUserComponent({ scadaUserComponent: value }).then((rs) => {
      if (rs.error) {
        message.error("导入失败");
        return;
      }
      message.success("导入成功");
    });
  };

  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      width={700}
      destroyOnClose
      title="图库"
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      afterClose={() => {
        setTabsKey("1");
      }}
      footer={
        type !== "editor"
          ? [
              <Button
                key="back"
                onClick={() => {
                  onCancel();
                }}
              >
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={handleSubmit}>
                确定
              </Button>,
            ]
          : null
      }
      className={type === "editor" ? styles.modal : styles.importModal}
    >
      <Tabs
        defaultActiveKey="1"
        onChange={(key) => {
          setTabsKey(key);
        }}
      >
        <TabPane tab="用户图库" key="1">
          {tabsKey === "1" && (
            <UserPalette
              onSelect={(val) => setSelectData(val)}
              type={type}
              queryAllScadaUserComponents={queryAllScadaUserComponents}
              deleteScadaUserComponent={deleteScadaUserComponent}
              addScadaUserComponent={addScadaUserComponent}
              queryScadaGroups={queryScadaGroups}
              queryScadaComponents={queryScadaComponents}
              queryCurrent={queryCurrent}
            />
          )}
        </TabPane>
        <TabPane tab="系统图库" key="2">
          <System
            onSelect={(val) => setSelectData(val)}
            queryScadaGroups={queryScadaGroups}
            queryScadaComponents={queryScadaComponents}
          />
          {type === "editor" && (
            <Button
              onClick={() => addUserComponent()}
              className={styles.button}
            >
              导入
            </Button>
          )}
        </TabPane>
        {type !== "editor" && (
          <TabPane tab="显示设置" key="3">
            <Form
              {...formLayout}
              form={form}
              initialValues={{
                ...values,
              }}
            >
              <CommonProperty
                values={values}
                scadaModelID={scadaModelID}
                propertys={propertys}
                onChangeShowProperty={(val) => setShowRuleProperty(val)}
                isModal={true}
              />
            </Form>
          </TabPane>
        )}
      </Tabs>
    </Modal>
  );
};

export default Gallery;

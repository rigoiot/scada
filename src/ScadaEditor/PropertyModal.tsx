import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Tabs,
  InputNumber,
  Table,
  Descriptions,
  Select,
  Radio,
} from "antd";
import InputColor from "./inputColor";
import styles from "./modalStyle.less";
import TslPropertyModal from "./TslPropertyModal";
import { MenuOutlined } from "@ant-design/icons";
import CommonProperty from "./CommonProperty";
import UploadFileServer from "@/components/UploadFileServer";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface ModalFormProps {
  onCancel?: () => void;
  onSubmit: (values: any) => void;
  visible?: boolean;
  values: any;
  scadaModelID: string;
  isModal: boolean;
  queryAllTslPropertiesByGatewayID?: (values: any) => void;
  queryAllDeviceDataSources?: (values: any) => void;
  system: string;
}

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};
const rightFormLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 18 },
};

const columns = [
  {
    title: "状态",
    dataIndex: "state",
  },
  {
    title: "条件",
    dataIndex: "condition",
  },
  {
    title: "渲染色",
    dataIndex: "background",
    ellipsis: true,
  },
];
const data = [
  { state: 0, condition: "False", background: "#ff0000" },
  { state: 1, condition: "True", background: "#00ff00" },
];
const defaultData = [
  {
    state: 0,
    condition: { rule: "==", num: 0 },
    label: "0",
    textColor: "#000",
    align: "left",
    vAlign: "middle",
    font: "24px arial, sans-serif",
  },
  {
    state: 1,
    condition: { rule: "==", num: 1 },
    label: "1",
    textColor: "#000",
    align: "left",
    vAlign: "middle",
    font: "24px arial, sans-serif",
  },
];
const egData = [
  {
    state: 0,
    condition: { rule: "==", num: 0 },
    label: "#ff0000",
  },
  {
    state: 1,
    condition: { rule: "==", num: 1 },
    label: "#00ff00",
  },
];
const textColumns = [
  {
    title: "状态",
    dataIndex: "state",
  },
  {
    title: "条件",
    dataIndex: "condition",
    render: (val) => val?.rule + (val?.num || val?.num == 0 ? val?.num : ""),
  },
  {
    title: "标签",
    ellipsis: true,
    dataIndex: "label",
  },
];

const PropertyModal: React.FC<ModalFormProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    values,
    scadaModelID,
    isModal,
    queryAllTslPropertiesByGatewayID,
    queryAllDeviceDataSources,
    system,
  } = props;
  const { propertys } = values;
  const [form] = Form.useForm();
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [tslProperty, setTslProperty] = useState<any>({});
  const [showRuleProperty, setShowRuleProperty] = useState<any>({});
  const [indicator, setindicator] = useState<string>("text");
  const [textData, setTextData] = useState<any>(
    values.textData || (values.type === "eg" ? egData : defaultData)
  );
  const [state, setState] = useState<any>(
    values.type === "IndicatorLight"
      ? (values.indicatorLight && values.indicatorLight[0]) || data[0]
      : (values.textData && values.textData[0]) || textData[0]
  );
  const [indicatorLight, setIndicatorLight] = useState<any>(
    values.indicatorLight || data
  );
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>();

  const handleSubmit = async (
    tslP: any,
    showRuleP: any,
    indicatorL: any,
    text: any,
    temIndicator: any
  ) => {
    const fieldsValue = await form.validateFields();
    if (tslP[Object.keys(tslP)[0]]) {
      propertys[Object.keys(tslP)[0]] = tslP[Object.keys(tslP)[0]];
      delete propertys[values.tag];
    }
    if (showRuleP[Object.keys(showRuleP)[0]]) {
      propertys[Object.keys(showRuleP)[0]] =
        showRuleP[Object.keys(showRuleP)[0]];
      delete propertys[values.showTag];
    }
    onSubmit({
      ...values,
      ...fieldsValue,
      propertys,
      indicatorLight: indicatorL,
      textData: text,
      indicator: temIndicator,
      tag: Object.keys(tslP)[0] || values.tag,
      showTag: Object.keys(showRuleP)[0] || values.showTag,
      isModal: isModal,
    });
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setState(selectedRows[0]);
      indicator === "img" &&
        form.setFieldsValue({
          img: new RegExp("^http.*$").test(selectedRows[0]?.label)
            ? selectedRows[0]?.label
            : "",
        });
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => {
      return {
        disabled: false,
        state: record.state,
        defaultChecked: record.state === state.state,
      };
    },
  };

  useEffect(() => {
    if (values) {
      setindicator(values.type === "eg" ? "lamp" : values?.indicator || "text");
      values?.indicator === "img" &&
        form.setFieldsValue({ img: values.textData[0]?.label });
      setTslProperty({});
      setShowRuleProperty({});
    }
  }, [values]);

  const renderForm = () => (
    <>
      {Object.keys(values).length !== 0 && (
        <Form
          {...(isModal ? formLayout : rightFormLayout)}
          form={form}
          initialValues={{
            ...values,
          }}
          size={isModal ? "middle" : "small"}
          onValuesChange={() =>
            !isModal &&
            handleSubmit(
              tslProperty,
              showRuleProperty,
              indicatorLight,
              textData,
              indicator
            )
          }
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab={values.name || "数据绑定"} key="1">
              <Row gutter={24}>
                <Col span={24}>
                  <FormItem
                    labelCol={{ span: isModal ? 3 : 5 }}
                    name="tag"
                    label="变量名"
                  >
                    {values.tag && !Object.values(tslProperty)[0]?.name && (
                      <Input
                        value={propertys[values.tag]?.name}
                        disabled
                        addonAfter={
                          <MenuOutlined
                            onClick={() => handleModalVisible(true)}
                          />
                        }
                      />
                    )}
                    {(!values.tag || Object.values(tslProperty)[0]?.name) && (
                      <Input
                        value={Object.values(tslProperty)[0]?.name}
                        disabled
                        addonAfter={
                          <MenuOutlined
                            onClick={() => handleModalVisible(true)}
                          />
                        }
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="状态" key="2">
              {(indicatorLight || data) && values.type === "IndicatorLight" && (
                <>
                  <label>状态数：</label>
                  <InputNumber min={1} defaultValue={2} readOnly={true} />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginLeft: "10px",
                    }}
                  >
                    当多个状态条件同时满足时，状态最小的条目有效。
                  </span>
                  <Table
                    rowSelection={{
                      type: "radio",
                      ...rowSelection,
                    }}
                    rowKey="state"
                    columns={columns}
                    dataSource={indicatorLight || data}
                    size="small"
                    pagination={false}
                    style={{ marginTop: "10px" }}
                  />
                  <Descriptions
                    title=""
                    column={1}
                    style={{
                      background: "#fafafa",
                      marginTop: "10px",
                      padding: "10px",
                    }}
                  >
                    <Descriptions.Item label="状态">
                      {state?.state}
                    </Descriptions.Item>
                    <Descriptions.Item
                      label="渲染色"
                      className={styles.stateColor}
                    >
                      <FormItem valuePropName="color" style={{ width: "100%" }}>
                        <InputColor
                          color={state.background || ""}
                          onChange={(color) => {
                            const arr = indicatorLight.concat();
                            arr.forEach(
                              (item: { state: any; background: string }) => {
                                if (item.state === state.state) {
                                  item.background = `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`;
                                }
                              }
                            );
                            setIndicatorLight(arr);
                            !isModal &&
                              handleSubmit(
                                tslProperty,
                                showRuleProperty,
                                arr,
                                textData,
                                indicator
                              );
                          }}
                        />
                      </FormItem>
                    </Descriptions.Item>
                  </Descriptions>
                </>
              )}
              {textData && ["textIndicator", "eg"].includes(values.type) && (
                <>
                  <label>状态数：</label>
                  <InputNumber
                    min={1}
                    defaultValue={textData.length}
                    value={textData.length}
                    onChange={(value) => {
                      const arr = textData.concat();
                      if (value >= textData.length) {
                        for (let i = textData.length; i < value; i++) {
                          arr.push({
                            state: i,
                            condition: { rule: "==", num: i },
                            label: "",
                            textColor: "#000",
                            align: "center",
                            vAlign: "middle",
                            font: "24px arial, sans-serif",
                          });
                        }
                      } else {
                        arr.splice(value, textData.length - value);
                      }
                      !isModal &&
                        handleSubmit(
                          tslProperty,
                          showRuleProperty,
                          indicatorLight,
                          arr,
                          indicator
                        );
                      setTextData(arr);
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#999",
                      marginLeft: "10px",
                    }}
                  >
                    当多个状态条件同时满足时，状态最小的条目有效。
                  </span>
                  <Table
                    rowSelection={{
                      type: "radio",
                      ...rowSelection,
                    }}
                    rowKey="state"
                    columns={textColumns}
                    dataSource={textData}
                    size="small"
                    pagination={false}
                    style={{ marginTop: "10px" }}
                    scroll={{
                      y: 150,
                    }}
                  />
                  <Descriptions
                    title=""
                    column={1}
                    style={{
                      background: system === "iot" ? "#fafafa" : undefined,
                      marginTop: "10px",
                      padding: "10px 10px 0 10px",
                    }}
                  >
                    <Descriptions.Item label="状态">
                      {state?.state}
                    </Descriptions.Item>
                    <Descriptions.Item label="条件" className={styles.desItem}>
                      <Select
                        key={state?.condition.rule || "=="}
                        defaultValue={state?.condition.rule || "=="}
                        onChange={(val) => {
                          const arr = textData.concat();
                          arr.forEach((item) => {
                            if (item.state === state.state) {
                              item.condition.rule = val;
                              val === "~"
                                ? delete item.condition.num
                                : (item.condition.num =
                                    item.condition.num || 0);
                            }
                          });
                          setTextData(arr);
                          !isModal &&
                            handleSubmit(
                              tslProperty,
                              showRuleProperty,
                              indicatorLight,
                              arr,
                              indicator
                            );
                        }}
                      >
                        <Option value="==">==</Option>
                        <Option value="!=">!=</Option>
                        <Option value=">">&gt;</Option>
                        <Option value="<">&lt;</Option>
                        <Option value=">=">&gt;=</Option>
                        <Option value="<=">&lt;=</Option>
                        <Option value="&">&amp;</Option>
                        <Option value="|">|</Option>
                        <Option value="~">~</Option>
                        <Option value="^">^</Option>
                      </Select>
                      {state?.condition.rule !== "~" && (
                        <InputNumber
                          style={{ marginLeft: "10px" }}
                          key={state?.state}
                          defaultValue={state?.condition.num || 0}
                          onChange={(value) => {
                            const arr = textData.concat();
                            arr.forEach((item) => {
                              if (item.state === state.state) {
                                item.condition.num = value;
                              }
                            });
                            setTextData(arr);
                            !isModal &&
                              handleSubmit(
                                tslProperty,
                                showRuleProperty,
                                indicatorLight,
                                arr,
                                indicator
                              );
                          }}
                        />
                      )}
                    </Descriptions.Item>
                    {values.type !== "eg" && (
                      <Descriptions.Item>
                        <Radio.Group
                          onChange={(e) => {
                            setindicator(e.target.value);
                            switch (e.target.value) {
                              case "text":
                                setTextData(defaultData);
                                !isModal &&
                                  handleSubmit(
                                    tslProperty,
                                    showRuleProperty,
                                    indicatorLight,
                                    defaultData,
                                    e.target.value
                                  );
                                setState(defaultData[0]);
                                break;
                              case "lamp":
                                setTextData(
                                  defaultData.map((rs) => {
                                    return { ...rs, label: "#00ff00" };
                                  })
                                );
                                !isModal &&
                                  handleSubmit(
                                    tslProperty,
                                    showRuleProperty,
                                    indicatorLight,
                                    defaultData.map((rs, index) => ({
                                      ...rs,
                                      label:
                                        index === 0 ? "#ff0000" : "#00ff00",
                                    })),
                                    e.target.value
                                  );
                                setState({
                                  ...defaultData[0],
                                  label: "#ff0000",
                                });
                                break;
                              case "img":
                                form.setFieldsValue({ img: "" });
                                setTextData(defaultData);
                                !isModal &&
                                  handleSubmit(
                                    tslProperty,
                                    showRuleProperty,
                                    indicatorLight,
                                    defaultData,
                                    e.target.value
                                  );
                                setState(defaultData[0]);
                                break;
                            }
                          }}
                          value={indicator}
                        >
                          <Radio value="text">字</Radio>
                          <Radio value="lamp">指示灯</Radio>
                          <Radio value="img">图片</Radio>
                        </Radio.Group>
                      </Descriptions.Item>
                    )}
                    {indicator === "text" && (
                      <>
                        <Descriptions.Item label="标签">
                          <TextArea
                            key={state?.state}
                            defaultValue={state?.label}
                            rows={3}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.label = val.target.value;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          />
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="文本颜色"
                          className={styles.stateColor}
                        >
                          <FormItem
                            valuePropName="color"
                            style={{ width: "100%" }}
                          >
                            <InputColor
                              color={state?.textColor || "#000"}
                              onChange={(val) => {
                                const arr = textData.concat();
                                arr.forEach(
                                  (item: { state: any; textColor: string }) => {
                                    if (item.state === state.state) {
                                      item.textColor = `rgba(${val.rgb.r},${val.rgb.g},${val.rgb.b},${val.rgb.a})`;
                                    }
                                  }
                                );
                                !isModal &&
                                  handleSubmit(
                                    tslProperty,
                                    showRuleProperty,
                                    indicatorLight,
                                    arr,
                                    indicator
                                  );
                                setTextData(arr);
                              }}
                            />
                          </FormItem>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="水平对齐"
                          span={isModal ? 0.5 : 1}
                        >
                          <Select
                            key={state?.state || "left"}
                            defaultValue={state?.align || "left"}
                            style={{ width: 120, height: 30 }}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.align = val;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          >
                            <Select.Option value="left">左对齐</Select.Option>
                            <Select.Option value="center">
                              水平居中
                            </Select.Option>
                            <Select.Option value="right">右对齐</Select.Option>
                          </Select>
                        </Descriptions.Item>
                        <Descriptions.Item
                          label="垂直对齐"
                          span={isModal ? 0.5 : 1}
                        >
                          <Select
                            key={state?.state || "middle"}
                            defaultValue={state?.vAlign || "middle"}
                            style={{ width: 120, height: 30 }}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.vAlign = val;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          >
                            <Select.Option value="top">顶部对齐</Select.Option>
                            <Select.Option value="middle">
                              垂直居中
                            </Select.Option>
                            <Select.Option value="bottom">
                              底部对齐
                            </Select.Option>
                          </Select>
                        </Descriptions.Item>
                        <Descriptions.Item label="文本字体">
                          <Input
                            key={state?.state}
                            defaultValue={state?.font}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.font = val.target.value;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          />
                        </Descriptions.Item>
                      </>
                    )}
                    {indicator === "lamp" && (
                      <Descriptions.Item
                        label="渲染色"
                        className={styles.stateColor}
                      >
                        <FormItem
                          valuePropName="color"
                          style={{ width: "100%" }}
                        >
                          <InputColor
                            color={state.label || ""}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.label = `rgba(${val.rgb.r},${val.rgb.g},${val.rgb.b},${val.rgb.a})`;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          />
                        </FormItem>
                      </Descriptions.Item>
                    )}
                    {indicator === "img" && (
                      <Descriptions.Item className={styles.upload}>
                        <Form.Item name="img">
                          <UploadFileServer
                            type="jpg/jpeg/png/gif"
                            num={1}
                            size={10}
                            onChange={(val) => {
                              const arr = textData.concat();
                              arr.forEach((item) => {
                                if (item.state === state.state) {
                                  item.label = val;
                                }
                              });
                              !isModal &&
                                handleSubmit(
                                  tslProperty,
                                  showRuleProperty,
                                  indicatorLight,
                                  arr,
                                  indicator
                                );
                              setTextData(arr);
                            }}
                          />
                        </Form.Item>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </>
              )}
            </TabPane>
            <TabPane tab="显示设置" key="3">
              <CommonProperty
                values={values}
                scadaModelID={scadaModelID}
                propertys={propertys}
                onChangeShowProperty={(val) => {
                  setShowRuleProperty(val);
                  !isModal &&
                    handleSubmit(
                      tslProperty,
                      val,
                      indicatorLight,
                      textData,
                      indicator
                    );
                }}
                isModal={isModal}
              />
            </TabPane>
          </Tabs>
        </Form>
      )}
      {modalVisible && (
        <TslPropertyModal
          onSubmit={async (value: any) => {
            setTslProperty(value);
            handleModalVisible(false);
            !isModal &&
              handleSubmit(
                value,
                showRuleProperty,
                indicatorLight,
                textData,
                indicator
              );
          }}
          onCancel={() => handleModalVisible(false)}
          visible={modalVisible}
          scadaModelID={scadaModelID}
        />
      )}
    </>
  );

  return isModal ? (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      destroyOnClose
      title={values.name || "属性编辑"}
      visible={visible}
      onCancel={onCancel}
      onOk={() =>
        handleSubmit(
          tslProperty,
          showRuleProperty,
          indicatorLight,
          textData,
          indicator
        )
      }
      cancelText="取消"
      okText="确定"
      maskClosable={false}
      className={styles.modal}
    >
      {renderForm()}
    </Modal>
  ) : (
    renderForm()
  );
};

export default PropertyModal;

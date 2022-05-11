import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Checkbox,
  Row,
  Col,
  Tabs,
  Radio,
  Select,
} from "antd";
import styles from "./modalStyle.less";
import TslPropertyModal from "./TslPropertyModal";
import { MenuOutlined } from "@ant-design/icons";
import InputColor from "./inputColor";
import CommonProperty from "./CommonProperty";
import TslPropertyTable from "./TslPropertyTable";

const { TabPane } = Tabs;

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  values: any;
  scadaModelID: string;
  queryAllTslPropertiesByGatewayID?: (values: any) => void;
  queryAllDeviceDataSources?: (values: any) => void;
  system: string;
}

const FormItem = Form.Item;

const types = [
  { value: "1h", label: "最近1小时" },
  { value: "12h", label: "最近12小时" },
  { value: "1d", label: "最近1天" },
  { value: "7d", label: "最近7天" },
  { value: "1M", label: "最近30天" },
];
const refreshType = [
  { value: "10", label: "10分钟" },
  { value: "30", label: "30分钟" },
  { value: "60", label: "60分钟" },
  { value: "120", label: "120分钟" },
];
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};

const ChartModal: React.FC<ModalFormProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    values,
    scadaModelID,
    queryAllTslPropertiesByGatewayID,
    queryAllDeviceDataSources,
    system,
  } = props;
  const [form] = Form.useForm();
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [tslProperty, setTslProperty] = useState<any>({});
  const [tslPropertys, setTslPropertys] = useState<any>({});
  const [width, setWidth] = useState<number>(500);
  const [showRuleProperty, setShowRuleProperty] = useState<any>({});

  const { propertys } = values;

  useEffect(() => {
    switch (values?.type) {
      case "chart":
        setWidth(700);
        break;
      case "pie":
        setWidth(600);
        break;
      default:
        setWidth(500);
    }
  }, []);

  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    if (tslProperty[Object.keys(tslProperty)[0]]) {
      propertys[Object.keys(tslProperty)[0]] =
        tslProperty[Object.keys(tslProperty)[0]];
      delete propertys[values.tag];
    }
    if (tslPropertys[Object.keys(tslPropertys)[0]]) {
      propertys[Object.keys(tslPropertys)[0]] =
        tslPropertys[Object.keys(tslPropertys)[0]];
      Object.keys(tslPropertys)[0] !== values.tag &&
        delete propertys[values.tag];
    }
    if (showRuleProperty[Object.keys(showRuleProperty)[0]]) {
      propertys[Object.keys(showRuleProperty)[0]] =
        showRuleProperty[Object.keys(showRuleProperty)[0]];
      delete propertys[values.showTag];
    }
    onSubmit({
      ...values,
      ...fieldsValue,
      propertys,
      tag:
        Object.keys(tslProperty)[0] ||
        Object.keys(tslPropertys)[0] ||
        values.tag,
      showTag: Object.keys(showRuleProperty)[0] || values.showTag,
    });
  };

  // 变量更改
  const handleSetTslPropertys = (val: any) => {
    setTslPropertys({ [Object.keys(tslPropertys)[0] || values.tag]: val });
  };
  // 数组去重
  const uniq = (arr: any[]) => {
    const result = [];
    const obj = {};
    for (let i = 0; i < arr.length; i++) {
      if (!obj[arr[i].tslPropertyId + arr[i].deviceId]) {
        result.push(arr[i]);
        obj[arr[i].tslPropertyId + arr[i].deviceId] = true;
      }
    }
    return result;
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      width={width}
      destroyOnClose
      title={values.name || "属性编辑"}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      cancelText="取消"
      okText="确定"
      maskClosable={false}
      className={styles.modal}
    >
      {Object.keys(values).length !== 0 && (
        <Form
          {...formLayout}
          form={form}
          initialValues={{
            ...values,
            legendShow: true,
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="一般属性" key="1">
              {values.type !== "chart" && (
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      labelCol={{ span: 5, offset: 0 }}
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
              )}
              {values.type === "pie" && (
                <>
                  <FormItem
                    labelCol={{ span: 5, offset: 0 }}
                    name="isRing"
                    valuePropName="checked"
                    label="是否环图"
                  >
                    <Checkbox />
                  </FormItem>
                  <TslPropertyTable
                    tslPropertys={
                      tslPropertys[Object.keys(tslPropertys)[0]] ||
                      propertys[values.tag]
                    }
                    handleTslPropertys={(val: any) =>
                      handleSetTslPropertys(val)
                    }
                    type="pie"
                    system={system}
                  />
                </>
              )}
              {(values.type === "chart" || values.type === "barChart") && (
                <>
                  <Form.Item
                    initialValue={
                      values.type === "barChart" ? "interval" : "line"
                    }
                    labelCol={{ span: 5, offset: 0 }}
                    name="chartType"
                    label="曲线类型"
                  >
                    {values.type === "barChart" ? (
                      <Radio.Group>
                        <Radio value="interval">柱状图</Radio>
                      </Radio.Group>
                    ) : (
                      <Radio.Group>
                        <Radio value="line">折线图</Radio>
                        <Radio value="smooth">曲线图</Radio>
                        <Radio value="bar">柱状图</Radio>
                        <Radio value="hv">阶梯折线图</Radio>
                        <Radio value="area">面积图</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                  {values.type !== "chart" && (
                    <Form.Item
                      labelCol={{ span: 5, offset: 0 }}
                      className={styles.inputColor}
                      name="chartColor"
                      label="曲线颜色"
                      initialValue={values.chartColor || "#0070cc"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  )}
                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        initialValue="1h"
                        labelCol={{
                          span: values.type === "chart" ? 8 : 11,
                          offset: 0,
                        }}
                        name="time"
                        label="显示时间段"
                      >
                        <Select>
                          {types.map((v) => (
                            <Select.Option key={v.value} value={v.value}>
                              {v.label}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    {values.type === "chart" && (
                      <>
                        <Col span={12}>
                          <Form.Item
                            initialValue="30"
                            labelCol={{ span: 8, offset: 0 }}
                            name="refreshTime"
                            label="刷新周期"
                          >
                            <Select>
                              {refreshType.map((v) => (
                                <Select.Option key={v.value} value={v.value}>
                                  {v.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <FormItem name="chartTitle" label="标题">
                            <Input />
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem
                            name="legendShow"
                            valuePropName="checked"
                            label="图例显示"
                          >
                            <Checkbox />
                          </FormItem>
                        </Col>
                      </>
                    )}
                    <Col span={12}>
                      <Form.Item
                        labelCol={{
                          span: values.type === "chart" ? 8 : 11,
                          offset: 0,
                        }}
                        className={styles.inputColor}
                        name="axisLabelCol"
                        label="刻度文字颜色"
                        initialValue={values.axisLabelCol || "#7c919b"}
                        valuePropName="color"
                        normalize={(v) => {
                          return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                        }}
                      >
                        <InputColor />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}
              {values.type === "gauge" && (
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      initialValue={0}
                      labelCol={{ span: 10, offset: 0 }}
                      name="gauMin"
                      label="最小值"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      initialValue={100}
                      labelCol={{ span: 10, offset: 0 }}
                      name="gauMax"
                      label="最大值"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      initialValue={50}
                      labelCol={{ span: 10, offset: 0 }}
                      name="noticeVal"
                      label="注意值"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      initialValue={80}
                      labelCol={{ span: 10, offset: 0 }}
                      name="warnVal"
                      label="警告值"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 9, offset: 0 }}
                      name="normalCol"
                      label="正常区颜色"
                      initialValue={values.normalCol || "#a1c6ae"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 9, offset: 0 }}
                      name="noticeCol"
                      label="注意区颜色"
                      initialValue={values.noticeCol || "#0070cc"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 9, offset: 0 }}
                      name="warnCol"
                      label="警告区颜色"
                      initialValue={values.warnCol || "#ff0000"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 9, offset: 0 }}
                      name="gauLinColor"
                      label="刻度颜色"
                      initialValue={values.gauLinColor || "#eee"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      initialValue={15}
                      labelCol={{ span: 10, offset: 0 }}
                      name="linWidth"
                      label="轴线宽度"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              {values.type === "container" && (
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item
                      initialValue={100}
                      labelCol={{ span: 10, offset: 0 }}
                      name="conMax"
                      label="最大值"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 10, offset: 0 }}
                      name="conCol"
                      label="容器颜色"
                      initialValue={values.conCol || "#0070cc"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      className={styles.inputColor}
                      labelCol={{ span: 10, offset: 0 }}
                      name="conBackground"
                      label="背景色"
                      initialValue={values.conBackground || "#cccccc"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      labelCol={{ span: 11, offset: 0 }}
                      className={styles.inputColor}
                      name="axisLabelCol"
                      label="刻度文字颜色"
                      initialValue={values.axisLabelCol || "#7c919b"}
                      valuePropName="color"
                      normalize={(v) => {
                        return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                      }}
                    >
                      <InputColor />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <div style={{ padding: "0 0 0 90px" }}>
                      <FormItem name="scaleCheck" valuePropName="checked">
                        <Checkbox>显示刻度</Checkbox>
                      </FormItem>
                    </div>
                  </Col>
                </Row>
              )}
            </TabPane>
            {values.type === "chart" && (
              <TabPane tab="变量" key="2">
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      labelCol={{ span: 4, offset: 0 }}
                      name="tag"
                      label="变量名"
                    >
                      {values.tag && !Object.values(tslProperty)[0]?.name && (
                        <Input
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
                <TslPropertyTable
                  tslPropertys={
                    tslPropertys[Object.keys(tslPropertys)[0]] ||
                    propertys[values.tag]
                  }
                  handleTslPropertys={(val: any) => handleSetTslPropertys(val)}
                  type="chart"
                  system={system}
                />
              </TabPane>
            )}
            <TabPane tab="显示设置" key="3">
              <CommonProperty
                values={values}
                scadaModelID={scadaModelID}
                propertys={propertys}
                onChangeShowProperty={(val) => setShowRuleProperty(val)}
                isModal={true}
              />
            </TabPane>
          </Tabs>
        </Form>
      )}
      {modalVisible && (
        <TslPropertyModal
          onSubmit={async (value: any) => {
            if (values.type === "chart" || values.type === "pie") {
              let temArr = value[Object.keys(value)[0]].concat(
                tslPropertys[Object.keys(tslPropertys)[0]] ||
                  propertys[values.tag] ||
                  []
              );
              setTslPropertys({ [Object.keys(value)[0]]: uniq(temArr) });
            } else {
              setTslProperty(value);
            }
            handleModalVisible(false);
          }}
          onCancel={() => handleModalVisible(false)}
          visible={modalVisible}
          scadaModelID={scadaModelID}
          type={values.type}
          queryAllTslPropertiesByGatewayID={queryAllTslPropertiesByGatewayID}
          queryAllDeviceDataSources={queryAllDeviceDataSources}
        />
      )}
    </Modal>
  );
};

export default ChartModal;

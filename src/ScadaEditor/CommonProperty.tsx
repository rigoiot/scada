import React, { Fragment, useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Checkbox,
  Radio,
  InputNumber,
} from "antd";
import TslPropertyModal from "./TslPropertyModal";
import { MenuOutlined } from "@ant-design/icons";

const FormItem = Form.Item;
const Option = Select.Option;

interface Number {
  values: {};
  scadaModelID: string;
  propertys: any;
  isModal: boolean;
  onChangeShowProperty: (val) => void;
}

const ruleSymbol = [
  {
    name: "==",
    value: "==",
  },
  { name: "!=", value: "!=" },
  { value: ">", name: ">" },
  { value: "<", name: "<" },
  { value: ">=", name: ">=" },
  { value: "<=", name: "<=" },
];

const CommonProperty: React.FC<Number> = (props) => {
  const {
    values,
    scadaModelID,
    propertys,
    onChangeShowProperty,
    isModal,
  } = props;
  const [show, setShow] = useState<string>("show");
  const [ruleType, setRuleType] = useState<string>("pRule");
  const [logic, setLogic] = useState<string>("none");
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [tslProperty, setTslProperty] = useState<any>({});
  const [form] = Form.useForm();

  useEffect(() => {
    if (values) {
      setShow(values.show || "show");
      setRuleType(values.ruleType || "pRule");
      setLogic(values.logic || "none");
      setTslProperty({});
    }
  }, [values]);

  return (
    <Fragment>
      <Row gutter={24}>
        {values.type !== "gallery" && (
          <>
            <Col span={12}>
              <FormItem name="editable" valuePropName="checked" label="可编辑">
                <Checkbox />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="movable" valuePropName="checked" label="可移动">
                <Checkbox />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="scaleY" valuePropName="checked" label="X轴对称">
                <Checkbox />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="scaleX" valuePropName="checked" label="Y轴对称">
                <Checkbox />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="width" label="宽">
                <Input />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="height" label="高">
                <Input />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="positionX" label="X坐标">
                <Input />
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem name="positionY" label="Y坐标">
                <Input />
              </FormItem>
            </Col>
            <Col span={isModal ? 12 : 24}>
              <FormItem
                name="stretch"
                label="拉伸"
                wrapperCol={isModal ? undefined : { span: 17 }}
                labelCol={isModal ? undefined : { span: 7 }}
              >
                <Select>
                  <Option value="fill">任意拉伸</Option>
                  <Option value="uniform">等比拉伸</Option>
                  <Option value="centerUniform">中心拉伸</Option>
                </Select>
              </FormItem>
            </Col>
          </>
        )}
        <Col span={24}>
          <Form.Item
            initialValue="show"
            labelCol={{ span: isModal ? 4 : 7 }}
            wrapperCol={{ span: isModal ? 20 : 17 }}
            name="show"
            label="显隐"
          >
            <Radio.Group onChange={(e) => setShow(e.target.value)}>
              <Radio value="show">一直显示</Radio>
              <Radio value="ruleShow">条件显示</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        {show === "ruleShow" && (
          <>
            <Col span={24}>
              <FormItem labelCol={{ span: isModal ? 4 : 7 }} label="变量名">
                {values.showTag && !Object.values(tslProperty)[0]?.name && (
                  <Input
                    value={propertys[values.showTag]?.name}
                    disabled
                    addonAfter={
                      <MenuOutlined onClick={() => handleModalVisible(true)} />
                    }
                  />
                )}
                {(!values.showTag || Object.values(tslProperty)[0]?.name) && (
                  <Input
                    value={Object.values(tslProperty)[0]?.name}
                    disabled
                    addonAfter={
                      <MenuOutlined onClick={() => handleModalVisible(true)} />
                    }
                  />
                )}
              </FormItem>
            </Col>
            <Col span={24}>
              <Form.Item
                initialValue="pRule"
                wrapperCol={{ offset: 4 }}
                name="ruleType"
              >
                <Radio.Group onChange={(e) => setRuleType(e.target.value)}>
                  <Radio value="pRule">位条件</Radio>
                  <Radio value="wRule">字条件</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            {ruleType === "pRule" && (
              <Col span={24}>
                <Form.Item
                  label="条件"
                  name="rule"
                  labelCol={{ span: isModal ? 4 : 7 }}
                  initialValue={1}
                >
                  <Radio.Group>
                    <Radio value={1}>ON</Radio>
                    <Radio value={0}>OFF</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            )}
            {ruleType === "wRule" && (
              <>
                <Col span={24}>
                  <Form.Item
                    label="条件"
                    labelCol={{ span: isModal ? 4 : 7 }}
                    wrapperCol={isModal ? undefined : { span: 20 }}
                  >
                    <span>读取值</span>
                    <Form.Item
                      name={["ruleOne", "rule"]}
                      initialValue="=="
                      noStyle
                    >
                      <Select style={{ width: "auto", margin: "0 10px" }}>
                        {ruleSymbol.map((rs) => (
                          <Option key={rs.value} value={rs.value}>
                            {rs.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name={["ruleOne", "num"]}
                      initialValue={0}
                      noStyle
                    >
                      <InputNumber
                        style={{ margin: isModal ? 0 : "10px 0 0 46px" }}
                      />
                    </Form.Item>
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="logic"
                    wrapperCol={{ span: 12, offset: isModal ? 4 : 7 }}
                    initialValue="none"
                  >
                    <Select onChange={(val) => setLogic(val)}>
                      <Option value="none">None</Option>
                      <Option value={"&&"}>AND</Option>
                      <Option value={"||"}>OR</Option>
                    </Select>
                  </Form.Item>
                </Col>
                {logic !== "none" && (
                  <Col span={24}>
                    <Form.Item wrapperCol={{ offset: isModal ? 4 : 7 }}>
                      <span>读取值</span>
                      <Form.Item
                        name={["ruleTwo", "rule"]}
                        initialValue="=="
                        noStyle
                      >
                        <Select style={{ width: "auto", margin: "0 10px" }}>
                          {ruleSymbol.map((rs) => (
                            <Option key={rs.value} value={rs.value}>
                              {rs.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        name={["ruleTwo", "num"]}
                        initialValue={0}
                        noStyle
                      >
                        <InputNumber
                          style={{ margin: isModal ? 0 : "10px 0 0 46px" }}
                        />
                      </Form.Item>
                    </Form.Item>
                  </Col>
                )}
              </>
            )}
          </>
        )}
      </Row>
      {modalVisible && (
        <TslPropertyModal
          onSubmit={async (value: any) => {
            const keyArr = Object.keys(value);
            const val = value[keyArr[0]];
            form.setFieldsValue({ valName: val?.title });
            setTslProperty(value);
            onChangeShowProperty(value);
            handleModalVisible(false);
          }}
          onCancel={() => handleModalVisible(false)}
          visible={modalVisible}
          scadaModelID={scadaModelID}
        />
      )}
    </Fragment>
  );
};

export default CommonProperty;

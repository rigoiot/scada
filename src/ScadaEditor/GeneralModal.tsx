import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Row,
  Col,
  Tabs,
  Radio,
  Tooltip,
  message,
  InputNumber,
} from "antd";
import InputColor from "./inputColor";
import styles from "./modalStyle.less";
import TslPropertyModal from "./TslPropertyModal";
import { MenuOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import VideoModal from "./VideoModal";
import CommonProperty from "./CommonProperty";
import UploadFileServer from "@/components/UploadFileServer";

interface ModalFormProps {
  onCancel?: () => void;
  onSubmit: (values: any) => void;
  visible?: boolean;
  values: any;
  scadaModelID: string;
  isModal: boolean;
  queryAllViews: (val: any) => void;
  queryAllVideos: (val: any) => void;
  queryAllTslPropertiesByGatewayID?: (values: any) => void;
  queryAllDeviceDataSources?: (values: any) => void;
  system: string;
  stationID?: string;
}
const { TabPane } = Tabs;
const FormItem = Form.Item;
const { TextArea } = Input;

message.config({
  maxCount: 1,
});

const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 18 },
};
const rightFormLayout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 18 },
};
const noArr = [
  "video",
  "iframe",
  "dataBind",
  "button",
  "switch",
  "time",
  "viewBtn",
  "viewHandle",
  "flow",
  "voltageShock"
];
const validity = [
  { value: "3600", label: "1小时" },
  { value: "43200", label: "12小时" },
  { value: "86400", label: "1天" },
  { value: "604800", label: "7天" },
];
const performs = {
  add: "加",
  sub: "减",
  const: "设置常数",
};
const GeneralModal: React.FC<ModalFormProps> = (props) => {
  const {
    onSubmit,
    onCancel,
    visible,
    values,
    scadaModelID,
    isModal,
    queryAllViews,
    queryAllVideos,
    queryAllTslPropertiesByGatewayID,
    queryAllDeviceDataSources,
    system,
    stationID,
  } = props;
  const videoIDs = { iot: scadaModelID, station: stationID };
  const [form] = Form.useForm();
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [tslProperty, setTslProperty] = useState<any>({});
  const [video, setVideo] = useState<any>();
  const [radio, setRadio] = useState<any>(1);
  const [imgRadio, setImgRadio] = useState<any>(1);
  const [presetSize, setPresetSize] = useState<string>();
  const [jsFuncChecked, setJsFuncChecked] = useState<boolean>(false);
  const [views, setViews] = useState<any>([]);
  const [RW, setRW] = useState<string>("R");
  const [pwSet, setPwSet] = useState<string>("pSet");
  const [showVideo, setShowVideo] = useState<string>("selectVideo");
  const [perform, setPerform] = useState<string>("加");
  const [nameCheck, setNameCheck] = useState<boolean>(true);
  const [showRuleProperty, setShowRuleProperty] = useState<any>({});
  const { propertys } = values;

  useEffect(() => {
    if (Object.keys(values).length !== 0) {
      setPresetSize(values.presetSize);
      setJsFuncChecked(values.JSFuncCheck);
      if (values.type === "viewHandle") {
        queryAllViews({ scadaModelID: scadaModelID, viewType: "Web" }).then(
          (rs) => {
            if (rs.error) {
              message.error("画面获取失败");
              return;
            }
            const { data: payload } = rs;
            setViews(payload.payload?.results || []);
          }
        );
      }
      setRW(values.RW || "R");
      setPwSet(values.pwSet || "pSet");
      setNameCheck(values.nameCheck);
      setPerform(performs[values.perform] || "加");
      form.setFieldsValue(values);
      setTslProperty({});
      setShowRuleProperty({});
    }
  }, [values]);

  const bagOnChange = (e: any) => {
    setRadio(e.target.value);
  };
  const imgOnChange = (e: any) => {
    setImgRadio(e.target.value);
  };

  const isFunc = (value: string, callback: any) => {
    if (value !== "") {
      try {
        new Function("return " + value);
        callback();
      } catch (error) {
        callback("函数格式不正确");
      }
    } else {
      callback();
    }
  };
  const handleSubmit = async (tslP: any, showRuleP: any, temVideo: any) => {
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
    const background = {};
    if (fieldsValue.bagImg || fieldsValue.bagColor) {
      background.bagImg = fieldsValue.bagImg || null;
      background.bagColor = fieldsValue.bagColor || null;
    }
    if (fieldsValue.JSFunc) {
      try {
        new Function("return " + fieldsValue.JSFunc);
      } catch (error) {
        message.warning("函数格式不正确");
      }
    }
    const property = tslP[Object.keys(tslP)[0]];

    onSubmit({
      ...values,
      ...fieldsValue,
      ...background,
      video: temVideo || values.video,
      propertys,
      tag: Object.keys(tslP)[0] || values.tag,
      showTag: Object.keys(showRuleP)[0] || values.showTag,
      isModal,
      unit: property ? property?.unit : values.unit,
    });
  };

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
            !isModal && handleSubmit(tslProperty, showRuleProperty, video)
          }
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="一般设置" key="1">
              {values.dataModel && (
                <>
                  <Row gutter={24}>
                    <Col span={24}>
                      <FormItem
                        labelCol={{ span: isModal ? 4 : 8 }}
                        name="presetSize"
                        label="预设尺寸"
                        initialValue="1280*720"
                      >
                        <Select
                          onChange={(val) => {
                            setPresetSize(val);
                          }}
                        >
                          <Select.Option value="3840*2160">
                            3840*2160
                          </Select.Option>
                          <Select.Option value="2560*1440">
                            2560*1440
                          </Select.Option>
                          <Select.Option value="1920*1080">
                            1920*1080
                          </Select.Option>
                          <Select.Option value="1366*768">
                            1366*768
                          </Select.Option>
                          <Select.Option value="1280*720">
                            1280*720
                          </Select.Option>
                          <Select.Option value="1024*760">
                            1024*760
                          </Select.Option>
                          <Select.Option value="800*480">800*480</Select.Option>
                          <Select.Option value="custom">自定义</Select.Option>
                        </Select>
                      </FormItem>
                    </Col>
                    {presetSize === "custom" && (
                      <>
                        <Col span={12}>
                          <FormItem
                            labelCol={{ span: 5, offset: 3 }}
                            name="presetWidth"
                            label="宽"
                          >
                            <Input />
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem
                            labelCol={{ span: 8, offset: 0 }}
                            name="presetHeight"
                            label="高"
                          >
                            <Input />
                          </FormItem>
                        </Col>
                      </>
                    )}
                    <Col span={isModal ? 12 : 24} className={styles.inputColor}>
                      <FormItem
                        labelCol={{ span: 8 }}
                        name="textColor"
                        label="文本颜色"
                        valuePropName="color"
                        normalize={(v) => {
                          return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                        }}
                        initialValue={values.textColor || "#000000"}
                      >
                        <InputColor />
                      </FormItem>
                    </Col>
                    <Col span={24}>
                      <Radio.Group
                        value={radio}
                        onChange={bagOnChange}
                        style={{ margin: "0 0 20px 20px" }}
                      >
                        <Radio value={1}>纯色</Radio>
                        <Radio value={2}>图片</Radio>
                      </Radio.Group>
                    </Col>
                  </Row>
                  <Row gutter={24}>
                    {radio === 1 && (
                      <Col span={24} className={styles.inputColor}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="bagColor"
                          label="背景色"
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.bagColor || "#ffffff"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                    )}
                    {radio === 2 && (
                      <Col span={24}>
                        <Radio.Group
                          value={imgRadio}
                          onChange={imgOnChange}
                          style={{ margin: "0 0 20px 20px" }}
                        >
                          <Radio value={1}>本地上传</Radio>
                          <Radio value={2}>URL地址</Radio>
                        </Radio.Group>
                        {imgRadio === 1 && (
                          <Form.Item
                            label="图片预览"
                            name="bagImg"
                            labelCol={{ span: isModal ? 4 : 8 }}
                          >
                            <UploadFileServer type="jpg/jpeg/png/gif" num={1} />
                          </Form.Item>
                        )}
                        {imgRadio === 2 && (
                          <Form.Item
                            label="URL"
                            name="bagImg"
                            labelCol={{ span: isModal ? 2 : 8 }}
                          >
                            <Input />
                          </Form.Item>
                        )}
                      </Col>
                    )}
                  </Row>
                </>
              )}
              {!values.dataModel && (
                <>
                  <Row gutter={24}>
                    {["switch", "button", "dataBind","voltageShock", "flow"]
                      .toString()
                      .indexOf(values.type) !== -1 && (
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="tag"
                          label="变量名"
                        >
                          {values.tag &&
                            !Object.values(tslProperty)[0]?.name && (
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
                          {(!values.tag ||
                            Object.values(tslProperty)[0]?.name) && (
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
                    )}
                    {values.type === "video" && (
                      <>
                        <Col span={24}>
                          <FormItem name="showVideo">
                            <Radio.Group
                              defaultValue={showVideo}
                              style={{ marginLeft: isModal ? "80px" : "20px" }}
                              onChange={(e) => {
                                setShowVideo(e.target.value);
                              }}
                            >
                              <Radio value="selectVideo">选择</Radio>
                              <Radio value="inputVideo">输入URL</Radio>
                            </Radio.Group>
                          </FormItem>
                          <FormItem
                            labelCol={{ span: isModal ? 4 : 8 }}
                            name="video"
                            label="视频源"
                          >
                            {showVideo === "selectVideo" && (
                              <>
                                {!video?.name && (
                                  <Input
                                    value={values.video?.name}
                                    disabled
                                    addonAfter={
                                      <MenuOutlined
                                        onClick={() => handleModalVisible(true)}
                                      />
                                    }
                                  />
                                )}
                                {video?.name && (
                                  <Input
                                    value={video?.name}
                                    disabled
                                    addonAfter={
                                      <MenuOutlined
                                        onClick={() => handleModalVisible(true)}
                                      />
                                    }
                                  />
                                )}
                              </>
                            )}
                            {showVideo === "inputVideo" && (
                              <Input
                                placeholder="请输入url"
                                value={
                                  video
                                    ? video?.videoURL
                                    : values.video?.videoURL
                                }
                                onChange={(val) => {
                                  setVideo({
                                    name: "URL",
                                    videoURL: val.target.value,
                                  });
                                }}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={24}>
                          <Form.Item
                            labelCol={{ span: isModal ? 4 : 8 }}
                            initialValue="3600"
                            name="validity"
                            label="有效期"
                          >
                            <Select>
                              {validity.map((v) => (
                                <Select.Option key={v.value} value={v.value}>
                                  {v.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    {values.type === "iframe" && (
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: 4 }}
                          name="iframe"
                          label="URL"
                        >
                          <Input />
                        </FormItem>
                      </Col>
                    )}
                    {values.type === "viewHandle" && (
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="viewId"
                          label="画面切换到"
                        >
                          <Select>
                            {views.map(
                              (rs: {
                                tag: string;
                                id: string;
                                name: string;
                              }) => {
                                return (
                                  <Select.Option value={rs.tag || rs.id}>
                                    {rs.name}
                                  </Select.Option>
                                );
                              }
                            )}
                          </Select>
                        </FormItem>
                      </Col>
                    )}
                    {values.type === "flow" && (
                      <>
                        <Col span={24}>
                          <FormItem
                            label="流动规则"
                            labelCol={{ span: isModal ? 4 : 8 }}
                            style={{ marginBottom: 0 }}
                          >
                            <FormItem
                              name="flowRule"
                              style={{ display: "inline-block" }}
                            >
                              <Select style={{ width: isModal ? 160 : 60 }}>
                                <Option value="==">==</Option>
                                <Option value="!=">!=</Option>
                                <Option value=">">&gt;</Option>
                                <Option value="<">&lt;</Option>
                                <Option value=">=">&gt;=</Option>
                                <Option value="<=">&lt;=</Option>
                              </Select>
                            </FormItem>
                            <FormItem
                              name="flowRuleNum"
                              style={{ display: "inline-block" }}
                            >
                              <InputNumber
                                style={{
                                  marginLeft: isModal ? 33 : 10,
                                  width: isModal ? 160 : 50,
                                }}
                              />
                            </FormItem>
                          </FormItem>
                        </Col>
                        <Col
                          span={isModal ? 12 : 24}
                          className={styles.inputColor}
                        >
                          <FormItem
                            name="dashCol"
                            label="虚线色"
                            labelCol={{ span: 8, offset: 0 }}
                            valuePropName="color"
                            normalize={(v) => {
                              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                            }}
                            initialValue={values.dashCol || "#0070cc"}
                          >
                            <InputColor />
                          </FormItem>
                        </Col>
                        <Col span={isModal ? 12 : 24}>
                          <Form.Item
                            labelCol={{ span: 8, offset: 0 }}
                            name="dashWidth"
                            label="虚线宽度"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col
                          span={isModal ? 12 : 24}
                          className={styles.inputColor}
                        >
                          <FormItem
                            name="bagCol"
                            label="背景色"
                            labelCol={{ span: 8, offset: 0 }}
                            valuePropName="color"
                            normalize={(v) => {
                              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                            }}
                            initialValue={values.bagCol || "#d6ebff"}
                          >
                            <InputColor />
                          </FormItem>
                        </Col>
                        <Col span={isModal ? 12 : 24}>
                          <Form.Item
                            labelCol={{ span: 8, offset: 0 }}
                            name="bagWidth"
                            label="背景宽度"
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                  </Row>
                  {values.type === "button" && (
                    <Row>
                      <Col span={24}>
                        <FormItem name="pwSet" wrapperCol={{ span: 24 }}>
                          <Radio.Group
                            defaultValue="pSet"
                            style={{ marginLeft: isModal ? "80px" : "4px" }}
                            onChange={(e) => {
                              setPwSet(e.target.value);
                            }}
                          >
                            <Radio value="pSet">位设定</Radio>
                            <Radio value="wSet">字设定</Radio>
                            <Radio value="reset">复位型</Radio>
                          </Radio.Group>
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        {pwSet === "pSet" && (
                          <FormItem
                            labelCol={{ span: isModal ? 4 : 8 }}
                            name="butVal"
                            initialValue={1}
                            label="执行设置"
                          >
                            <Select>
                              <Select.Option value={1}>开</Select.Option>
                              <Select.Option value={0}>关</Select.Option>
                              <Select.Option value="!">取反</Select.Option>
                            </Select>
                          </FormItem>
                        )}
                        {pwSet === "wSet" && (
                          <>
                            <FormItem
                              labelCol={{ span: isModal ? 4 : 8 }}
                              name="perform"
                              initialValue="add"
                              label="执行设置"
                            >
                              <Select
                                onSelect={(val, option) => {
                                  setPerform(option.children);
                                }}
                              >
                                <Select.Option value="add">加</Select.Option>
                                <Select.Option value="sub">减</Select.Option>
                                <Select.Option value="const">
                                  设置常数
                                </Select.Option>
                              </Select>
                            </FormItem>
                            <Form.Item
                              name="wButVal"
                              label={perform}
                              labelCol={{ span: isModal ? 4 : 8 }}
                              initialValue={1}
                            >
                              <InputNumber precision={0} />
                            </Form.Item>
                          </>
                        )}
                        {pwSet === "reset" && (
                          <>
                            <FormItem
                              labelCol={{ span: isModal ? 4 : 8 }}
                              name="downButVal"
                              initialValue={0}
                              label="按下"
                            >
                              <InputNumber />
                            </FormItem>
                            <FormItem
                              labelCol={{ span: isModal ? 4 : 8 }}
                              name="upButVal"
                              initialValue={1}
                              label="抬起"
                            >
                              <InputNumber />
                            </FormItem>
                          </>
                        )}
                      </Col>
                    </Row>
                  )}
                  {values.type === "switch" && (
                    <Row gutter={24}>
                      <Col span={24}>开状态样式:</Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="bagTrue"
                          label="背景色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.bagTrue || "#0070cc"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="btnTrue"
                          label="按钮色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.btnTrue || "#ffffff"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          name="textTrue"
                          label="文本"
                          labelCol={{ span: 8, offset: 0 }}
                        >
                          <Input />
                        </FormItem>
                      </Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="textTrueCol"
                          label="文本颜色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.textTrueCol || "#ffffff"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={24}>关状态样式:</Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="bagFalse"
                          label="背景色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.bagFalse || "#b1b2b1"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="btnFalse"
                          label="按钮色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.btnFalse || "#ffffff"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          name="textFalse"
                          label="文本"
                          labelCol={{ span: 8, offset: 0 }}
                        >
                          <Input />
                        </FormItem>
                      </Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          name="textFalseCol"
                          label="文本颜色"
                          labelCol={{ span: 8, offset: 0 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.textFalseCol || "#ffffff"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                    </Row>
                  )}
                  {!values.text &&
                    !values.dataModel &&
                    noArr.toString().indexOf(values.type) === -1 && (
                      <Row gutter={24}>
                        <Col span={12} className={styles.inputColor}>
                          <FormItem
                            name="background"
                            label="渲染色"
                            valuePropName="color"
                            normalize={(v) => {
                              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                            }}
                            initialValue={values.background || ""}
                          >
                            <InputColor />
                          </FormItem>
                        </Col>
                        <Col span={12} className={styles.inputColor}>
                          <FormItem
                            name="borderColor"
                            label={values.type === "line" ? "虚线色" : "边框色"}
                            valuePropName="color"
                            normalize={(v) => {
                              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                            }}
                            initialValue={
                              values.borderColor || "rgb(0,150,200)"
                            }
                          >
                            <InputColor />
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem
                            name="borderWidth"
                            label={values.type === "line" ? "线宽" : "边框宽度"}
                          >
                            <Input />
                          </FormItem>
                        </Col>
                        {values.type === "rect" && (
                          <Col span={12}>
                            <FormItem
                              name="gradient"
                              label="渐变"
                              valuePropName="checked"
                            >
                              <Checkbox></Checkbox>
                            </FormItem>
                          </Col>
                        )}
                        {values.type === "line" && (
                          <Col span={12}>
                            <FormItem
                              name="dash"
                              label="实虚线"
                              valuePropName="checked"
                            >
                              <Checkbox></Checkbox>
                            </FormItem>
                          </Col>
                        )}
                      </Row>
                    )}
                  {values.type === "time" && (
                    <Row gutter={24}>
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="dateCheck"
                          label="显示日期"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Checkbox></Checkbox>
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          labelCol={{ span: isModal ? 5 : 8 }}
                          name="dateFormat"
                          label="格式"
                          initialValue="YYYY-MM-DD"
                        >
                          <Select>
                            <Select.Option value="YYYY-MM-DD">
                              YYYY-MM-DD
                            </Select.Option>
                            <Select.Option value="MM-DD-YYYY">
                              MM-DD-YYYY
                            </Select.Option>
                            <Select.Option value="DD-MM-YYYY">
                              DD-MM-YYYY
                            </Select.Option>
                          </Select>
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          labelCol={{ span: isModal ? 6 : 8 }}
                          name="dateSeparator"
                          label="分隔符"
                          initialValue="-"
                        >
                          <Select>
                            <Select.Option value=".">.</Select.Option>
                            <Select.Option value="-">-</Select.Option>
                            <Select.Option value="/">/</Select.Option>
                            <Select.Option value="年月日">年月日</Select.Option>
                          </Select>
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="weekCheck"
                          label="显示星期"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Checkbox></Checkbox>
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 4 : 8 }}
                          name="timeCheck"
                          label="显示时间"
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Checkbox></Checkbox>
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          labelCol={{ span: isModal ? 5 : 8 }}
                          name="timeFormat"
                          label="格式"
                          initialValue="HH:mm:ss"
                        >
                          <Select>
                            <Select.Option value="HH:mm:ss">
                              HH:MM:SS
                            </Select.Option>
                            <Select.Option value="HH:mm">HH:MM</Select.Option>
                          </Select>
                        </FormItem>
                      </Col>
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          labelCol={{ span: isModal ? 5 : 8 }}
                          name="textColor"
                          label="颜色"
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.textColor || ""}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        <FormItem
                          labelCol={{ span: isModal ? 2 : 8 }}
                          name="textFont"
                          label="字体"
                        >
                          <Input />
                        </FormItem>
                      </Col>
                    </Row>
                  )}
                  {values.type === "viewBtn" && (
                    <Row gutter={24}>
                      <Col span={24} className={styles.inputColor}>
                        <FormItem
                          name="selBag"
                          label="选中背景色"
                          labelCol={{ span: isModal ? 5 : 10 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.selBag || "#0070cc"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={24} className={styles.inputColor}>
                        <FormItem
                          name="noSelBag"
                          label="未选中背景色"
                          labelCol={{ span: isModal ? 5 : 10 }}
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.noSelBag || "#d1d2d1"}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                    </Row>
                  )}
                  {(values.text ||
                    ["voltageShock","dataBind", "button", "viewBtn", "viewHandle"].indexOf(
                      values.type
                    ) !== -1) && (
                    <Row gutter={24}>
                      {(values.type === "button" ||
                        values.type === "viewHandle") && (
                        <Col span={24} className={styles.inputColor}>
                          <FormItem
                            name="background"
                            label="渲染色"
                            labelCol={{ span: isModal ? 4 : 8 }}
                            valuePropName="color"
                            normalize={(v) => {
                              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                            }}
                            initialValue={values.background || "#b1b2b1"}
                          >
                            <InputColor />
                          </FormItem>
                        </Col>
                      )}
                      {!["voltageShock","dataBind"].includes(values.type) && (
                        <Col span={isModal ? 12 : 24}>
                          <FormItem
                            name="text"
                            label="文本内容"
                            labelCol={{ span: 8 }}
                          >
                            <Input />
                          </FormItem>
                        </Col>
                      )}
                      {["voltageShock","dataBind"].includes(values.type) && (
                        <>
                          <Col span={24}>
                            <FormItem name="RW">
                              <Radio.Group
                                defaultValue="R"
                                style={{
                                  marginLeft: isModal ? "80px" : "20px",
                                }}
                                onChange={(e) => {
                                  setRW(e.target.value);
                                }}
                              >
                                <Radio value="R">只读</Radio>
                                <Radio value="W">读写</Radio>
                              </Radio.Group>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem
                              name="unitCheck"
                              valuePropName="checked"
                              initialValue={true}
                            >
                              <Checkbox
                                style={{
                                  marginLeft: isModal ? "80px" : "20px",
                                }}
                              >
                                显示单位
                              </Checkbox>
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem
                              name="nameCheck"
                              valuePropName="checked"
                              initialValue={true}
                            >
                              <Checkbox
                                style={{
                                  marginLeft: isModal ? "80px" : "20px",
                                }}
                                onChange={(e) => setNameCheck(e.target.checked)}
                              >
                                显示变量名称
                              </Checkbox>
                            </FormItem>
                          </Col>
                          {nameCheck && (
                            <Col span={24}>
                              <FormItem
                                labelCol={{ span: isModal ? 4 : 8 }}
                                name="valName"
                                label="变量名称"
                                initialValue="变量名称"
                              >
                                <Input />
                              </FormItem>
                            </Col>
                          )}
                          <Col span={24}>
                            <FormItem
                              labelCol={{ span: isModal ? 4 : 8 }}
                              name="dataFormat"
                              label="数据格式"
                              initialValue="##.#"
                            >
                              <Input />
                            </FormItem>
                          </Col>
                        </>
                      )}
                      <Col
                        span={isModal ? 12 : 24}
                        className={styles.inputColor}
                      >
                        <FormItem
                          labelCol={{ span: 8 }}
                          name="textColor"
                          label="文本颜色"
                          valuePropName="color"
                          normalize={(v) => {
                            return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                          }}
                          initialValue={values.textColor || ""}
                        >
                          <InputColor />
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          name="textAlign"
                          label="水平对齐"
                          labelCol={{ span: 8 }}
                        >
                          <Select>
                            <Select.Option value="left">左对齐</Select.Option>
                            <Select.Option value="center">
                              水平居中
                            </Select.Option>
                            <Select.Option value="right">右对齐</Select.Option>
                          </Select>
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          name="textVAlign"
                          label="垂直对齐"
                          labelCol={{ span: 8 }}
                        >
                          <Select>
                            <Select.Option value="top">顶部对齐</Select.Option>
                            <Select.Option value="middle">
                              垂直居中
                            </Select.Option>
                            <Select.Option value="bottom">
                              底部对齐
                            </Select.Option>
                          </Select>
                        </FormItem>
                      </Col>
                      <Col span={isModal ? 12 : 24}>
                        <FormItem
                          labelCol={{ span: 8 }}
                          name="textFont"
                          label="文本字体"
                        >
                          <Input />
                        </FormItem>
                      </Col>
                      {["voltageShock","dataBind"].includes(values.type) && (
                        <>
                          <Col span={12} className={styles.inputColor}>
                            <FormItem
                              name="background"
                              label="背景色"
                              valuePropName="color"
                              normalize={(v) => {
                                return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                              }}
                              initialValue={values.background || "#b1b2b1"}
                            >
                              <InputColor />
                            </FormItem>
                          </Col>
                          <Col span={12} className={styles.inputColor}>
                            <FormItem
                              name="borderColor"
                              label="边框色"
                              valuePropName="color"
                              normalize={(v) => {
                                return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
                              }}
                              initialValue={values.borderColor || "#b1b2b1"}
                            >
                              <InputColor />
                            </FormItem>
                          </Col>
                          <Col span={24}>
                            <FormItem
                              name="JSFuncCheck"
                              valuePropName="checked"
                            >
                              <Checkbox
                                style={{
                                  marginLeft: isModal ? "80px" : "15px",
                                }}
                                onChange={(val) => {
                                  setJsFuncChecked(val.target.checked);
                                }}
                              >
                                JS函数动态转换
                                <Tooltip
                                  title={
                                    <div>
                                      function(val){`{`}
                                      <br />
                                      &thinsp; &thinsp;return
                                      (val*(val+5)-2)/10;
                                      <br />
                                      {`}`}
                                    </div>
                                  }
                                >
                                  <QuestionCircleOutlined
                                    style={{ marginLeft: "10px" }}
                                  />
                                </Tooltip>
                              </Checkbox>
                            </FormItem>
                            {jsFuncChecked && (
                              <FormItem
                                labelCol={{ span: isModal ? 4 : 8 }}
                                name="JSFunc"
                                label="JS函数"
                                style={{ marginTop: "5px" }}
                                rules={
                                  isModal
                                    ? [
                                        {
                                          validator: (rule, value, callback) =>
                                            isFunc(value, callback),
                                        },
                                      ]
                                    : []
                                }
                                initialValue={
                                  values.JSFunc ||
                                  "function(val){\n return (val*(val+5)-2)/10;\n}"
                                }
                              >
                                <TextArea rows={4} />
                              </FormItem>
                            )}
                          </Col>
                        </>
                      )}
                    </Row>
                  )}
                </>
              )}
            </TabPane>
            {!values.dataModel && (
              <TabPane tab="显示设置" key="2">
                <CommonProperty
                  values={values}
                  scadaModelID={scadaModelID}
                  propertys={propertys}
                  onChangeShowProperty={(val) => {
                    setShowRuleProperty(val);
                    !isModal && handleSubmit(tslProperty, val, video);
                  }}
                  isModal={isModal}
                />
              </TabPane>
            )}
            {["switch", "button", "dataBind","voltageShock", "viewBtn"]
              .toString()
              .indexOf(values.type) !== -1 && (
              <TabPane
                tab="控制设置"
                key="3"
                disabled={
                  (RW !== "W" && ["voltageShock","dataBind"].includes(values.type)) ||
                  pwSet === "reset"
                }
              >
                <span
                  style={{
                    marginLeft: "20px",
                    marginBottom: "5px",
                    display: "block",
                  }}
                >
                  安全设置
                </span>
                <Form.Item
                  noStyle
                  name="passwordChecked"
                  valuePropName="checked"
                >
                  <Checkbox
                    style={{
                      marginLeft: "20px",
                    }}
                  >
                    启用密码控制
                  </Checkbox>
                </Form.Item>
              </TabPane>
            )}
          </Tabs>
        </Form>
      )}
      {modalVisible && values.type !== "video" && (
        <TslPropertyModal
          onSubmit={(value: any) => {
            const keyArr = Object.keys(value);
            const val = value[keyArr[0]];
            form.setFieldsValue({ valName: val?.title });
            setTslProperty(value);
            !isModal && handleSubmit(value, showRuleProperty, video);
            handleModalVisible(false);
          }}
          onCancel={() => handleModalVisible(false)}
          visible={modalVisible}
          scadaModelID={scadaModelID}
          queryAllTslPropertiesByGatewayID={queryAllTslPropertiesByGatewayID}
          queryAllDeviceDataSources={queryAllDeviceDataSources}
          system={system}
        />
      )}
      {modalVisible && values.type === "video" && (
        <VideoModal
          onSubmit={(value: any) => {
            setVideo(value);
            !isModal && handleSubmit(tslProperty, showRuleProperty, value);
            handleModalVisible(false);
          }}
          onCancel={() => handleModalVisible(false)}
          visible={modalVisible}
          id={videoIDs[system]}
          system={system}
          queryAllVideos={queryAllVideos}
        />
      )}
    </>
  );
  return isModal ? (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      destroyOnClose
      title={values?.name || "属性编辑"}
      visible={visible}
      onCancel={onCancel}
      onOk={() => handleSubmit(tslProperty, showRuleProperty, video)}
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

export default GeneralModal;

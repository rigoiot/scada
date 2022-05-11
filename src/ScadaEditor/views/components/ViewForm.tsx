import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Tabs,
  InputNumber,
  Radio,
} from "antd";
// 全局
import { CheckLength } from "../../../util";
import styles from "../Views.less";
import UploadFileServer from "@/components/UploadFileServer";
import InputColor from "../../inputColor";
import request from "umi-request";

const FormItem = Form.Item;
const { TabPane } = Tabs;

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 17 },
};
const webPresetSizes = [
  {
    name: "3840*2160",
    value: "3840*2160",
  },
  {
    name: "2560*1440",
    value: "2560*1440",
  },
  {
    name: "1920*1080",
    value: "1920*1080",
  },
  {
    name: "1366*768",
    value: "1366*768",
  },
  {
    name: "1280*720",
    value: "1280*720",
  },
  {
    name: "1024*760",
    value: "1024*760",
  },
  {
    name: "800*480",
    value: "800*480",
  },
  {
    name: "自定义",
    value: "custom",
  },
];
const mobilePresetSizes = [
  {
    name: "1440*2880",
    value: "1440*2880",
  },
  {
    name: "1242*2298",
    value: "1242*2298",
  },
  {
    name: "1080*1920",
    value: "1080*1920",
  },
  {
    name: "750*1334",
    value: "750*1334",
  },
  {
    name: "720*1280",
    value: "720*1280",
  },
  {
    name: "自定义",
    value: "custom",
  },
];
interface ModalFormProps {
  cancle: () => void;
  confirm: (values: any) => void;
  visible: boolean;
  values: any;
  loading: boolean;
}

const ViewForm: React.FC<ModalFormProps> = (props) => {
  const { cancle, confirm, visible, values, loading } = props;
  const [form] = Form.useForm();
  const [presetSize, setPresetSize] = useState<string>("");
  const [radio, setRadio] = useState<any>(1);
  const [imgRadio, setImgRadio] = useState<any>(1);
  const [dataModel, setDataModel] = useState(new ht.DataModel());
  const [initialValues, setInitialValues] = useState<any>();

  useEffect(() => {
    if (values.parentId) {
      request.get(values.modelData).then((response) => {
        let temObj = {};
        dataModel.clear();
        try {
          dataModel.deserialize(response);
        } catch (error) {
          dataModel.deserialize(values.modelData);
        }
        const bagNode = dataModel.getDataByTag("background");
        temObj = {
          presetSize: bagNode.a("presetSize"),
          presetHeight: bagNode.a("presetHeight"),
          presetWidth: bagNode.a("presetWidth"),
          bagColor: bagNode.s("background") || "#ffffff",
          bagImg: bagNode.a("img"),
        };
        setInitialValues(temObj);
        setPresetSize(bagNode.a("presetSize"));
      });
    } else {
      setInitialValues({});
    }
  }, []);
  // 预设尺寸
  const addBackground = (value: any) => {
    if (!dataModel.getDataByTag("background")) {
      var node = new ht.Node();
      node.setImage(require("../../editor/background.json"));
      node.setTag("background");
      node.setPosition({ x: 0, y: 0 });
      node.s("2d.movable", false);
      node.s("2d.selectable", false);
      dataModel.add(node);
      dataModel.moveToTop(node);
    }
    const bagNode = dataModel.getDataByTag("background");
    bagNode.a("presetSize", value.presetSize);
    bagNode.a("presetWidth", value.presetWidth);
    bagNode.a("presetHeight", value.presetHeight);
    let width, height;
    if (value.presetSize !== "custom") {
      const sizeArr = value.presetSize.split("*");
      width = Number(sizeArr[0]);
      height = Number(sizeArr[1]);
    } else {
      width = Number(value.presetWidth);
      height = Number(value.presetHeight);
    }
    bagNode.setWidth(width);
    bagNode.setHeight(height);
    if (value.bagImg) {
      bagNode.a("img", value.bagImg);
      bagNode.setImage(value.bagImg);
    } else if (value.bagColor) {
      bagNode.a("img", undefined);
      bagNode.setImage(require("../../editor/background.json"));
      bagNode.s(
        "background",
        value.bagColor?.hex || value.bagColor || "#ffffff"
      );
    }
  };
  const handleSubmit = async () => {
    const fieldsValue = await form.validateFields();
    addBackground(fieldsValue);
    const data = dataModel.serialize(0);
    confirm({
      id: values.parentId && values.key,
      name: fieldsValue.name,
      modelData: data,
      modelProperty: "{}",
      viewType: values.viewType,
    });
  };
  const bagOnChange = (e: any) => {
    setRadio(e.target.value);
  };
  const imgOnChange = (e: any) => {
    setImgRadio(e.target.value);
  };
  const renderContent = () => (
    <Row gutter={24}>
      <Col span={24}>
        <FormItem
          name="name"
          label="画面名称"
          rules={[
            {
              required: true,
              message: "请输入画面名称",
            },
            {
              validator: (_, value) => CheckLength(value, "画面名称", 3),
            },
          ]}
        >
          <Input />
        </FormItem>
      </Col>
      <Col span={24}>
        <FormItem
          name="presetSize"
          label="预设尺寸"
          initialValue={values.viewType === "mobile" ? "720*1280" : "1280*720"}
        >
          <Select
            onChange={(val: string) => {
              setPresetSize(val);
            }}
          >
            {(values.viewType === "mobile"
              ? mobilePresetSizes
              : webPresetSizes
            ).map((rs) => {
              return (
                <Select.Option key={rs.value} value={rs.value}>
                  {rs.name}
                </Select.Option>
              );
            })}
          </Select>
        </FormItem>
      </Col>
      {presetSize === "custom" && (
        <>
          <Col span={12}>
            <FormItem
              labelCol={{ span: 5, offset: 3 }}
              wrapperCol={{ span: 15 }}
              name="presetWidth"
              label="宽"
              rules={[
                {
                  required: true,
                  message: "请输入宽",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              labelCol={{ span: 3, offset: 0 }}
              wrapperCol={{ span: 15 }}
              name="presetHeight"
              label="高"
              rules={[
                {
                  required: true,
                  message: "请输入高",
                },
              ]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </FormItem>
          </Col>
        </>
      )}
    </Row>
  );
  const renderBagItem = () => (
    <Row gutter={24}>
      <Col span={24}>
        <Radio.Group
          value={radio}
          onChange={bagOnChange}
          style={{ marginBottom: "20px" }}
        >
          <Radio value={1}>纯色</Radio>
          <Radio value={2}>图片</Radio>
        </Radio.Group>
      </Col>
      {radio === 1 && (
        <Col span={24} className={styles.inputColor}>
          <FormItem
            labelCol={{ span: 4, offset: 0 }}
            name="bagColor"
            label="背景色"
            valuePropName="color"
            normalize={(v) => {
              return `rgba(${v.rgb.r},${v.rgb.g},${v.rgb.b},${v.rgb.a})`;
            }}
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
            style={{ marginBottom: "20px" }}
          >
            <Radio value={1}>本地上传</Radio>
            <Radio value={2}>URL地址</Radio>
          </Radio.Group>
          {imgRadio === 1 && (
            <Form.Item
              label="图片预览"
              name="bagImg"
              labelCol={{ span: 4, offset: 0 }}
            >
              <UploadFileServer type="jpg/jpeg/png/gif" num={1} />
            </Form.Item>
          )}
          {imgRadio === 2 && (
            <Form.Item
              label="URL"
              name="bagImg"
              labelCol={{ span: 2, offset: 0 }}
            >
              <Input />
            </Form.Item>
          )}
        </Col>
      )}
    </Row>
  );
  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      confirmLoading={loading}
      width={700}
      destroyOnClose
      title={
        values.parentId
          ? "修改画面属性"
          : values.viewType === "Web"
          ? "新建网页端画面"
          : "新建移动端画面"
      }
      visible={visible}
      onCancel={cancle}
      onOk={handleSubmit}
      className={styles.modal}
    >
      {initialValues && (
        <Form
          {...formLayout}
          form={form}
          initialValues={{
            name: values.parentId && values.title,
            ...initialValues,
          }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="一般设置" key="1">
              {renderContent()}
            </TabPane>
            <TabPane tab="背景属性" key="2">
              {renderBagItem()}
            </TabPane>
          </Tabs>
        </Form>
      )}
    </Modal>
  );
};

export default ViewForm;

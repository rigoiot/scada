import React from "react";
import { Modal, Descriptions } from "antd";
import _ from "lodash";
import { extendDataType, areaType } from "./Constant";

interface ModalFormProps {
  onCancle: () => void;
  visible: boolean;
  values: any;
}

const ExtendConfig: React.FC<ModalFormProps> = (props) => {
  const { visible, onCancle, values } = props;

  const list: any[] = [
    { writeFunctionCode: "操作类型" },
    { registerAddress: "寄存器地址" },
    { type: "原始数据类型" },
    { "originalDataType.specs.registerCount": "寄存器数据个数" },
    { "originalDataType.specs.swap16": "交换寄存器内高低字节" },
    { "originalDataType.specs.reverseRegister": "交换寄存器顺序" },
    { scaling: "缩放因子" },
    { pollingTime: "采集间隔(毫秒)" },
    { trigger: "数据上报方式" },
    { areaType: "数据区域类型" },
    { dbNumber: "数据块编号" },
    { startAddress: "数据起始地址" },
    { amount: "数据个数" },
    { wordLen: "数据类型" },
  ];
  const value = (key: string, val: React.ReactText) => {
    switch (key) {
      case "registerAddress":
        const isBit = values?.type === "bits";
        const bitVal = values?.bitMask;
        if (isBit && bitVal !== undefined) {
          const bitShow = Math.log2(bitVal);
          return val !== undefined
            ? `${Number(val) + 1}.${bitShow}/${val}.${bitShow}`
            : "";
        }
        return val !== undefined ? `${Number(val) + 1}/${val}` : "";
      case "startAddress":
        return val !== undefined ? `${Number(val) + 1}/${val}` : "";
      case "writeFunctionCode":
        return extendDataType.find((x) => x.value === val)?.name;
      case "originalDataType.specs.swap16":
        return val === 0 ? "false" : "true";
      case "originalDataType.specs.reverseRegister":
        return val === 0 ? "false" : "true";
      case "trigger":
        return val === 1 ? "按时上报" : "变更上报";
      case "areaType":
        return areaType.find((x) => x.value === val)?.name;
      default:
        return val;
    }
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      width={550}
      destroyOnClose
      title="扩展描述"
      visible={visible}
      onCancel={onCancle}
      footer={null}
    >
      <Descriptions bordered column={1}>
        {list.find((x) => Object.keys(x)[0] === Object.keys(values)[0]) ? (
          list.map((d) => {
            const key = Object.keys(d)[0];
            const val = _.get(values, key);
            return (
              val !== undefined && (
                <Descriptions.Item label={d[key]}>
                  {value(key, val)}
                </Descriptions.Item>
              )
            );
          })
        ) : (
          <Descriptions.Item label="自定义扩展">
            {JSON.stringify(values)}
          </Descriptions.Item>
        )}
      </Descriptions>
      {}
    </Modal>
  );
};

export default ExtendConfig;

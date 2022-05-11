import React, { useState } from "react";
import { Input, Button, message, Modal } from "antd";
import styles from "./index.less";
import ModelPassword from "./components/ModelPassword";

interface Props {
  scadaModelID: string;
  pwVisible: boolean;
  onCancel: () => void;
  updateScadaModelPassword: (val: any) => void;
  queryScadaModelPassword: (val: any) => void;
}

const Index: React.FC<Props> = (props) => {
  const {
    scadaModelID,
    pwVisible,
    onCancel,
    updateScadaModelPassword,
    queryScadaModelPassword,
  } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [modelPassword, setModelPassword] = useState<string>();

  const getDeviceModelPassword = (val: any) => {
    setButtonLoading("mpLoading");
    queryScadaModelPassword({ id: scadaModelID, ...val }).then((res) => {
      if (res.error) {
        res.error === "VerifyCodeNotMatch"
          ? message.error("用户登录密码不正确")
          : message.error("系统异常");
        setButtonLoading("");
        return;
      }
      setModelPassword(res.data?.payload);
      setButtonLoading("");
      setVisible(false);
    });
  };
  const updateModelPassword = (val: any) => {
    setButtonLoading("mpLoading");
    updateScadaModelPassword({ id: scadaModelID, ...val }).then((res) => {
      if (res.error) {
        res.error === "VerifyCodeNotMatch"
          ? message.error("用户登录密码不正确")
          : message.error("系统异常");
        setButtonLoading("");
        return;
      }
      message.success("修改成功");
      setModelPassword(undefined);
      setButtonLoading("");
      setVisible(false);
    });
  };
  return (
    <Modal
      maskClosable={false}
      style={{ top: "60px" }}
      width={600}
      destroyOnClose
      title="密码"
      visible={pwVisible}
      footer={null}
      onCancel={onCancel}
    >
      <div style={{ height: "100px", padding: "20px" }}>
        <p>使用密码控制的元件，默认使用以下密码。</p>
        <span>元件控制密码：</span>
        <Input
          value={modelPassword !== undefined ? modelPassword : "********"}
          style={{ width: "50%" }}
          disabled
          addonAfter={
            <div
              className={styles.getPassword}
              onClick={() => {
                setVisible(true);
                setType("show");
              }}
            >
              显示密码
            </div>
          }
        />
        <Button
          type="primary"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            setVisible(true);
            setType("update");
          }}
        >
          修改密码
        </Button>
        <ModelPassword
          visible={visible}
          confirm={(val) => {
            type === "update"
              ? updateModelPassword(val)
              : getDeviceModelPassword(val);
          }}
          cancle={() => setVisible(false)}
          loading={buttonLoading === "mpLoading"}
          type={type}
        />
      </div>
    </Modal>
  );
};

export default Index;

import React, { useState, useEffect, useImperativeHandle } from "react";
import { Tree, message, Dropdown, Menu, Modal } from "antd";
import arrayToTree from "array-to-tree";
import styles from "./Views.less";
import { View, ListItemType } from "./data";
import {
  PlusOutlined,
  HomeTwoTone,
  FundTwoTone,
  ProfileTwoTone,
  TabletTwoTone,
  DoubleLeftOutlined,
} from "@ant-design/icons";
import { AddProjectField } from "../../util";
import ViewForm from "./components/ViewForm";

const { DirectoryTree } = Tree;
const { confirm, warning } = Modal;
interface Props {
  scadaModelID: string;
  onSelectView: (values: any) => void;
  vRef: any;
  onShrink: () => void;
  queryAllViews: (val: any) => void;
  addView: (val: any) => void;
  deleteView: (val: any) => void;
  updateView: (val: any) => void;
  copyView: (val: any) => void;
  setMainView: (val: any) => void;
  getPresignedURL: (val: any) => void;
  queryCodes: (val: any) => void;
}
const Views: React.FC<Props> = (props) => {
  const {
    scadaModelID,
    onSelectView,
    vRef,
    onShrink,
    queryAllViews,
    addView,
    deleteView,
    updateView,
    copyView,
    setMainView,
    getPresignedURL,
    queryCodes,
  } = props;
  const [viewTypes, setViewTypes] = useState<[]>([]);
  const [treeData, setTreeData] = useState<ListItemType[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [visible, setVisible] = useState<boolean>(false);
  const [current, setCurrent] = useState<any>({});
  const [buttonLoading, setButtonLoading] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useImperativeHandle(vRef, () => ({
    // 暴露给父组件的方法
    getAllViews,
  }));

  useEffect(() => {
    queryCodes("ViewType").then((res: any) => {
      const { data = [] } = res;
      data.sort((a: { value: string }, b: { value: string }) => {
        var order = ["Web", "mobile", "thumbnail"];
        return order.indexOf(a.value) - order.indexOf(b.value);
      });
      setViewTypes(
        data.filter((item: { value: string }) => item.value !== "thumbnail")
      );
    });
  }, []);
  useEffect(() => {
    if (viewTypes.length !== 0) {
      getAllViews();
    }
  }, [viewTypes.length]);
  useEffect(() => {
    if (!loading) {
      const temArr: any[] = [];
      treeData.forEach((e) => {
        e.children ? temArr.push.apply(temArr, e.children) : temArr.push(e);
      });
      const webMainView = treeData[0].children?.find(
        (rs: { isMain: boolean }) => rs.isMain === true
      );
      const defaultView = selectedKey
        ? temArr?.find((rs: { key: string }) => rs.key === selectedKey) ||
          webMainView
        : webMainView;
      setSelectedKey(defaultView.key);
      onSelectView(defaultView);
    }
  }, [loading]);
  // 预设尺寸
  const addBackground = () => {
    const dataModel = new ht.DataModel();
    if (!dataModel.getDataByTag("background")) {
      var node = new ht.Node();
      node.setImage(require("../editor/background.json"));
      node.setTag("background");
      node.setPosition({ x: 0, y: 0 });
      node.s("2d.movable", false);
      node.s("2d.selectable", false);
      node.s("background", "#ffffff");
      dataModel.add(node);
      dataModel.moveToTop(node);
    }
    const data = dataModel.serialize(0);
    return data;
  };
  const getAllViews = () => {
    setLoading(true);
    queryAllViews({ scadaModelID }).then((rs) => {
      if (rs.error) {
        message.error("画面获取失败");
        return;
      }
      const { data: payload } = rs;
      let temArr = viewTypes.concat(payload.payload?.results || []);
      const data = arrayToTree(
        temArr.map((v: View) => {
          return {
            key: v.value || v.id,
            title: v.name,
            viewType: v.viewType || v.value,
            parentId: v.viewType,
            modelData: v.modelData || addBackground(),
            modelProperty: v.modelProperty,
            scadaModelID: v.scadaModelID,
            isMain: v.isMain,
            tag: v.tag,
          };
        }),
        {
          parentProperty: "parentId",
          customID: "key",
        }
      );
      setTreeData(data);
      setLoading(false);
    });
  };
  const handleRemove = (val: ListItemType) => {
    val.isMain
      ? warning({ content: "不能删除启动画面" })
      : confirm({
          title: "确认删除该画面?",
          okType: "danger",
          onOk: () => {
            const hide = message.loading("正在删除");
            deleteView({
              ids: [val.key],
            }).then((rs) => {
              if (rs.error || rs.errors) {
                message.error("系统异常");
                hide();
                return;
              }
              message.success("删除成功");
              hide();
              getAllViews();
            });
          },
        });
  };
  const handleFile = async (values: any) => {
    // 0.转文件
    const file = new File(
      [JSON.stringify(values.val)],
      `${values.name}_${values.id}.json`,
      {
        type: "application/json",
      }
    );
    // 1.根据文件名请求预签名
    const rs = await getPresignedURL({
      fileName: file.name,
      bucketName: "gocloud.scada",
    });
    const presignedURL = rs.data.payload;
    // 2.根据预签名上传文件
    return fetch(presignedURL, {
      method: "PUT",
      body: file,
    });
  };
  const handleAdd = (value: any) => {
    const val = AddProjectField(value);
    setButtonLoading("vfLoading");
    addView({
      view: { ...val, scadaModelID: scadaModelID, tag: new Date().getTime() },
    }).then((rs) => {
      if (rs.error || rs.errors) {
        message.error("添加失败");
        setButtonLoading("");
        return;
      }
      const {
        data: { payload },
      } = rs;
      const modelData = handleFile({
        id: payload?.id,
        val: payload?.modelData,
        name: "modelData",
      });
      const modelProperty = handleFile({
        id: payload?.id,
        val: payload?.modelProperty,
        name: "modelProperty",
      });
      Promise.all([modelData, modelProperty]).then((values) => {
        const temArr = values.map((rs) => {
          return (
            rs.url.substr(0, rs.url.indexOf("?")) + `?v=${new Date().getTime()}`
          );
        });
        updateView({
          ...payload,
          modelData: temArr.find((rs) => rs.indexOf("modelData") !== -1),
          modelProperty: temArr.find(
            (rs) => rs.indexOf("modelProperty") !== -1
          ),
        }).then((rs) => {
          if (rs.error || rs.errors) {
            setButtonLoading("");
            return;
          }
          message.success("添加成功");
          setButtonLoading("");
          getAllViews();
          setVisible(false);
          setCurrent({});
        });
      });
    });
  };
  const handleUpdate = (val: any) => {
    delete val.modelProperty;
    setButtonLoading("vfLoading");
    const modelData = handleFile({
      id: val?.id,
      val: val?.modelData,
      name: "modelData",
    });
    Promise.all([modelData]).then((values) => {
      const temArr = values.map((rs) => {
        return (
          rs.url.substr(0, rs.url.indexOf("?")) + `?v=${new Date().getTime()}`
        );
      });
      updateView({
        ...val,
        modelData: temArr.find((rs) => rs.indexOf("modelData") !== -1),
      }).then((rs) => {
        if (rs.error || rs.errors) {
          message.error("修改失败");
          setButtonLoading("");
          return;
        }
        message.success("修改成功");
        setButtonLoading("");
        getAllViews();
        setVisible(false);
        setCurrent({});
      });
    });
  };
  const handleCopy = (val: ListItemType) => {
    confirm({
      title: "确认复制该画面?",
      okType: "danger",
      onOk: () => {
        const hide = message.loading("正在复制");
        copyView({ id: val.key }).then((rs) => {
          if (rs.error || rs.errors) {
            message.error("复制失败");
            hide();
            return;
          }
          message.success("复制成功");
          hide();
          getAllViews();
        });
      },
    });
  };
  const handleMainView = (val: ListItemType) => {
    confirm({
      title: "确认该画面设置为启动页?",
      okType: "danger",
      onOk: () => {
        setMainView({ id: val.key }).then((rs) => {
          if (rs.error || rs.errors) {
            message.error("系统异常");
            return;
          }
          message.success("设置成功");
          getAllViews();
        });
      },
    });
  };
  return (
    <div className={styles.viewMenu}>
      <h4 className={styles.leftTitle}>
        画面
        <DoubleLeftOutlined
          className={styles.titleIcon}
          onClick={() => onShrink()}
        />
      </h4>
      {treeData.length !== 0 && (
        <DirectoryTree
          onSelect={(_, info: { selected: boolean; selectedNodes: any }) => {
            if (info.selectedNodes[0]?.parentId) {
              setSelectedKey(info.selectedNodes[0]?.key);
              onSelectView(info.selectedNodes[0]);
            }
          }}
          treeData={treeData}
          blockNode={true}
          height={180}
          icon={false}
          defaultExpandAll
          selectedKeys={[selectedKey]}
          titleRender={(nodeData: ListItemType) => {
            return nodeData.parentId ? (
              <div style={{ display: "flex", height: 24 }}>
                <span className={styles.title} style={{ width: "90%" }}>
                  {nodeData.viewType === "Web" &&
                    (nodeData.isMain ? (
                      <HomeTwoTone twoToneColor="#5ddf91" />
                    ) : (
                      <FundTwoTone />
                    ))}
                  {nodeData.viewType === "thumbnail" && <ProfileTwoTone />}
                  {nodeData.viewType === "mobile" &&
                    (nodeData.isMain ? (
                      <HomeTwoTone twoToneColor="#f0b45b" />
                    ) : (
                      <TabletTwoTone />
                    ))}
                  <span style={{ marginLeft: "5px" }}>{nodeData.title}</span>
                </span>
                <Dropdown
                  overlay={
                    nodeData.viewType === "thumbnail" ? (
                      <Menu>
                        <Menu.Item
                          key="1"
                          onClick={() => {
                            setVisible(true);
                            setCurrent(nodeData);
                          }}
                        >
                          画面设置
                        </Menu.Item>
                      </Menu>
                    ) : (
                      <Menu>
                        <Menu.Item
                          key="1"
                          onClick={() => {
                            setVisible(true);
                            setCurrent(nodeData);
                          }}
                        >
                          修改
                        </Menu.Item>
                        <Menu.Item
                          key="2"
                          onClick={() => {
                            handleCopy(nodeData);
                          }}
                        >
                          复制
                        </Menu.Item>
                        {!nodeData.isMain && (
                          <Menu.Item
                            key="3"
                            onClick={() => {
                              handleMainView(nodeData);
                            }}
                          >
                            {nodeData.viewType === "Web"
                              ? "设为网页端启动画面"
                              : "设为移动端启动画面"}
                          </Menu.Item>
                        )}
                        <Menu.Item
                          key="4"
                          onClick={() => {
                            handleRemove(nodeData);
                          }}
                        >
                          删除
                        </Menu.Item>
                      </Menu>
                    )
                  }
                  trigger={["click"]}
                >
                  <span className={styles.icon}>···</span>
                </Dropdown>
              </div>
            ) : (
              <div style={{ display: "flex" }}>
                <span className={styles.title} style={{ width: "90%" }}>
                  {nodeData.title}
                </span>
                <span>
                  <PlusOutlined
                    onClick={() => {
                      setVisible(true);
                      setCurrent(nodeData);
                    }}
                  />
                </span>
              </div>
            );
          }}
        />
      )}
      {visible && (
        <ViewForm
          visible={visible}
          values={current}
          confirm={(v) => (!current.parentId ? handleAdd(v) : handleUpdate(v))}
          cancle={() => setVisible(false)}
          loading={buttonLoading === "vfLoading"}
        />
      )}
    </div>
  );
};

export default Views;

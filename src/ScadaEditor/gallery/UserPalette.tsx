import React, { useEffect, useState, useRef } from "react";
import { message, Button, Modal, Spin } from "antd";
import request from "umi-request";
import styles from "./index.less";
import UploadFileServer from "@/components/UploadFileServer";
import { confirmConfig, AddProjectField } from "../../util";
import ImportComponent from "./ImportComponent";

interface Props {
  onSelect: (values: any) => void;
  type: string;
  queryAllScadaUserComponents: (val: any) => void;
  deleteScadaUserComponent: (val: any) => void;
  addScadaUserComponent: (val: any) => void;
  queryScadaGroups: (val: any) => void;
  queryScadaComponents: (val: any) => void;
  queryCurrent: () => void;
}

const UserPalette: React.FC<Props> = (props) => {
  const {
    onSelect,
    type,
    queryAllScadaUserComponents,
    deleteScadaUserComponent,
    addScadaUserComponent,
    queryScadaGroups,
    queryScadaComponents,
    queryCurrent,
  } = props;
  const [components, setComponents] = useState<any[]>([]);
  const [selectData, setSelectData] = useState<any>();
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  // 组件面板
  const palette = new ht.widget.Palette();
  const PaletteRef = useRef();

  const getScadaUserComponents = () => {
    setLoading(true);
    queryCurrent().then((rs) => {
      if (rs.error) {
        message.error("组件加载失败");
        return;
      }
      queryAllScadaUserComponents({}).then((rs) => {
        if (rs.error) {
          message.error("组件加载失败");
          return;
        }
        const {
          data: {
            payload: { results },
          },
        } = rs;
        setComponents(results);
        setLoading(false);
      });
    });
  };
  const handleRemove = () => {
    if (selectData) {
      Modal.confirm({
        ...confirmConfig,
        title: "确认移除",
        content: "",
        onOk: () => {
          deleteScadaUserComponent({ id: [selectData.item?.id] }).then((rs) => {
            if (rs.error) {
              message.error("移除失败");
              return;
            }
            message.success("移除成功");
            getScadaUserComponents();
          });
        },
      });
    }
  };

  const addUserComponent = (val: any) => {
    const value = AddProjectField({
      name: val?.name,
      groupID: val?.groupID,
      userComponentData: val?.componentData,
      userComponentType: val?.componentType,
    });
    addScadaUserComponent({ scadaUserComponent: value }).then((rs) => {
      if (rs.error) {
        message.error("导入失败");
        return;
      }
      handleModalVisible(false);
      getScadaUserComponents();
      message.success("导入成功");
    });
  };

  useEffect(() => {
    getScadaUserComponents();
    return () => {
      ht.Default.paletteItemSelectBackground = "";
    };
  }, []);

  useEffect(() => {
    PaletteRef.current.innerHTML = "";
    if (components && components.length !== 0) {
      initPalette(components);
    }
  }, [components]);

  // 初始化组件面板中的内容
  const initPalette = (listData: any) => {
    var group = new ht.Group();
    group.setName("组件");
    group.setExpanded(true);
    palette.setItemImageWidth(55);
    var dm = palette.dm();
    dm.add(group);
    listData.forEach((item: any) => {
      // 新建 ht.Node 类型节点
      var node = new ht.Node();
      node.setName(item.name);
      try {
        item.userComponentData.indexOf(".json") === -1
          ? node.setImage(item.userComponentData)
          : request.get(item.userComponentData).then((response) => {
              if (/^{/.test(response)) {
                try {
                  JSON.parse(response);
                  node.setImage(JSON.parse(response));
                } catch (error) {
                  node.setImage(response);
                }
              } else {
                node.setImage(response);
              }
            });
      } catch (error) {
        return;
      }
      node.setTag(item.tag);
      node.item = item;
      node.s({
        // 设置节点显示图片为填充的方式，这样不同比例的图片也不会因为拉伸而导致变形
        "image.stretch": item.stretch || "centerUniform",
        // 设置节点是否可被拖拽
        draggable: item.draggable === undefined ? true : item.draggable,
      });
      node.a("type", item.userComponentType);
      group.addChild(node);
      dm.add(node);
    });
    palette.addToDOM(PaletteRef.current);
    palette.sm().ms(() => {
      const selectedNode = palette.sm().ld();
      if (selectedNode) {
        setSelectData(selectedNode);
        onSelect(selectedNode);
      }
    });
    ht.Default.paletteItemSelectBackground = "rgb(221, 221, 221)";
  };

  return (
    <div>
      <Spin spinning={loading}>
        <div style={{ border: "1px solid #ccc", minHeight: "100px" }}>
          <div ref={PaletteRef} className={styles.palett}></div>
        </div>
      </Spin>
      {type === "use" && (
        <Button
          onClick={() => {
            handleModalVisible(true);
          }}
          style={{ marginTop: "10px" }}
        >
          导入
        </Button>
      )}
      {type === "editor" && (
        <>
          <div className={styles.button} style={{ left: "24px" }}>
            <UploadFileServer
              type="jpg/jpeg/png"
              num={1}
              showUpload={false}
              filterFn={(val) => {
                addUserComponent({
                  name: val[0]?.name.substring(
                    0,
                    val[0]?.name.lastIndexOf(".")
                  ),
                  componentData: decodeURIComponent(val[0]?.url),
                });
              }}
              uploadView={<Button>本地上传</Button>}
              content={<Button>本地上传</Button>}
            />
          </div>
          <Button onClick={() => handleRemove()} className={styles.button}>
            移除组件
          </Button>
        </>
      )}
      {modalVisible && (
        <ImportComponent
          visible={modalVisible}
          onCancel={() => handleModalVisible(false)}
          onSubmit={(val) => addUserComponent(val.item)}
          queryScadaGroups={queryScadaGroups}
          queryScadaComponents={queryScadaComponents}
        />
      )}
    </div>
  );
};

export default UserPalette;

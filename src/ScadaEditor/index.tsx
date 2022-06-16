/* globals ht */
import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import ReactDOM from "react-dom";
import { message, Spin, Modal } from "antd";
import resizeEvent from "element-resize-event";
import { Copy } from "../util";
import request from "umi-request";
import PropertyModal from "./PropertyModal";
import styles from "./index.less";
import GeneralModal from "./GeneralModal";
import ImgModal from "./ImgModal";
import ChartModal from "./ChartModal";
import moment from "moment";
import Views from "./views/Views";
import Gallery from "./gallery/Gallery";
import ShareModal from "./ShareModal";
import PassWord from "./password";
import { DoubleRightOutlined, DoubleLeftOutlined } from "@ant-design/icons";

const { confirm } = Modal;

export const ScadaContext = React.createContext({});

interface ScadaEditorProps {
  id: string;
  saveRef: any;
  system: string;
  queryCodes: (val: any) => void;
  queryCurrent: () => void;
  queryAllVideos: (val: any) => void;
  // 画面
  getPresignedURL: (val: any) => void;
  queryAllViews: (val: any) => void;
  addView: (val: any) => void;
  deleteView: (val: any) => void;
  updateView: (val: any) => void;
  copyView: (val: any) => void;
  setMainView: (val: any) => void;
  // 组件
  queryScadaGroups: (val: any) => void;
  queryScadaComponents: (val: any) => void;
  queryAllScadaUserComponents: (val: any) => void;
  deleteScadaUserComponent: (val: any) => void;
  addScadaUserComponent: (val: any) => void;
  // 密码
  queryScadaModelPassword?: (val: any) => void;
  updateScadaModelPassword?: (val: any) => void;
  // iot
  queryAllTslPropertiesByGatewayID?: (val: any) => void;
  queryAllDeviceDataSources?: (val: any) => void;
  // station
  stationID?: string;
  queryAllTslPropertiesInStation?: (val: any) => void;
  queryAllEquipments?: (val: any) => void;
  // ops
  equipmentID?: string;
  queryAllEquipmentVariable?: (val: any) => void;
  // ep
  enterpriseID?: string;
  getAllMonitors?: (val: any) => void;
  getAllTslProperties?: (val: any) => void;
}

const textStyle = {
  "text.color": "#ffffff",
  "text.align": "center",
  "text.vAlign": "middle",
  "text.font": "16px Times New Roman",
};
const Index: React.FC<ScadaEditorProps> = (props) => {
  const {
    id,
    saveRef,
    system,
    queryScadaGroups,
    queryScadaComponents,
    getPresignedURL,
    queryAllScadaUserComponents,
    queryAllViews,
    addView,
    deleteView,
    updateView,
    copyView,
    setMainView,
    queryCodes,
    queryCurrent,
    queryAllVideos,
    deleteScadaUserComponent,
    addScadaUserComponent,
    queryScadaModelPassword,
    updateScadaModelPassword,
    // iot
    queryAllTslPropertiesByGatewayID,
    queryAllDeviceDataSources,
    // station
    stationID,
    queryAllTslPropertiesInStation,
    queryAllEquipments,
    // ops
    equipmentID,
    queryAllEquipmentVariable,
    // ep
    enterpriseID,
    getAllMonitors,
    getAllTslProperties,
  } = props;
  const [scadaGroups, setScadaGroups] = useState<[]>([]);
  const [scadaComponents, setScadaComponents] = useState<
    Array<{
      groupID: string;
      items: any[];
    }>
  >([]);
  const [selectModelData, setSelectModelData] = useState<string>();
  const [shareVisible, setShareVisible] = useState<boolean>(false);
  const [shareType, setShareType] = useState<string>("export");
  const [userComponents, setUserComponents] = useState<any[]>();
  const [modalVisible, handleModalVisible] = useState<boolean>(false);
  const [galleryVisible, handleGalleryVisible] = useState<boolean>(false);
  const [pwVisible, handlePWVisible] = useState<boolean>(false);
  const [values, setValues] = useState({});
  const [data, setData] = useState({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const isGrid = useRef<boolean>(false);
  const DivRef = useRef();
  const viewDataRef = useRef<any>();
  const globalTextCol = useRef<string>("#000");
  const toolbar_config_right = [
    {
      icon: require("./editor/toolbarIcon/undo.json"),
      toolTip: "撤销",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              zoomIn: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        historyManager.undo();
      },
    },
    {
      icon: require("./editor/toolbarIcon/redo.json"),
      toolTip: "重做",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              zoomIn: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        historyManager.redo();
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/zoom-in.json"),
      toolTip: "放大",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              zoomIn: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        t.editor.g2d.zoomIn(!0);
      },
    },
    {
      icon: require("./editor/toolbarIcon/zoom-out.json"),
      toolTip: "缩小",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              zoomOut: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        t.editor.g2d.zoomOut(!0);
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/copy.json"),
      toolTip: "复制",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        dm.sm().each(
          (sm: {
            getPosition: () => any;
            getImage: () => any;
            getName: () => any;
            getTag: () => any;
            getStyleMap: () => any;
            getRotation: () => any;
            getHeight: () => any;
            getWidth: () => any;
            getParent: () => any;
          }) => {
            const position = sm.getPosition();
            const parent= sm.getParent();
            const node = new (sm instanceof ht.Text
              ? ht.Text
              : sm instanceof ht.Shape
              ? ht.Shape
              : ht.Node)();
            const attrs = Copy(sm.getAttrObject());
            node.setAttrObject({
              ...attrs,
              valName: "变量名称",
            });
            node.p({
              x: position.x + 50,
              y: position.y,
            });
            if (sm instanceof ht.Shape) {
              const temArr: any[] = [];
              sm.getPoints().forEach((item: { x: number }) => {
                temArr.push({
                  ...item,
                  x: item.x + 50,
                });
              });
              node.setPoints(temArr);
            } else {
              node.setImage(sm.getImage());
            }
            node.setParent(parent);
            node.setStyleMap(Copy(sm.getStyleMap()));
            node.setRotation(sm.getRotation());
            node.s("label", "");
            node.setSize(Copy(sm.getSize()));
            node.setLayer(1);
            t.editor.g2d.dm().add(node);
          }
        );
      },
    },
    {
      icon: require("./editor/toolbarIcon/delete.json"),
      toolTip: "删除",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        arr.forEach((rs) => {
          dm.remove(rs);
        });
      },
    },
    {
      icon: require("./editor/toolbarIcon/setUp.json"),
      toolTip: "编辑",
      action: () => {
        handleModalVisible(true);
        const bagNode = dataModel.getDataByTag("background");
        const values = {
          dataModel: true,
          presetSize: bagNode.a("presetSize"),
          bagImg: bagNode.a("img"),
          bagColor: bagNode.s("background"),
          presetWidth: bagNode.a("presetWidth"),
          presetHeight: bagNode.a("presetHeight"),
          textColor: bagNode.s("text.color"),
        };
        setValues(values);
      },
    },
    {
      icon: require("./editor/toolbarIcon/gallery.json"),
      toolTip: "图库",
      action: () => {
        handleGalleryVisible(true);
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/moveToTop.json"),
      toolTip: "置顶",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        arr.forEach((rs) => {
          dm.moveToBottom(rs);
        });
      },
    },
    {
      icon: require("./editor/toolbarIcon/moveToBottom.json"),
      toolTip: "置底",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        arr.forEach((rs) => {
          dm.moveToTop(rs);
        });
      },
    },
    {
      icon: require("./editor/toolbarIcon/moveDown.json"),
      toolTip: "上一层",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        arr.forEach((rs) => {
          dm.moveDown(rs);
        });
      },
    },
    {
      icon: require("./editor/toolbarIcon/moveUp.json"),
      toolTip: "下一层",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        arr.forEach((rs) => {
          dm.moveUp(rs);
        });
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/leftAlign.json"),
      toolTip: "左对齐",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const minX = Math.min.apply(
            Math,
            arr.map((item) => {
              return item.getRect()?.x;
            })
          );
          arr.forEach((element) => {
            element.setRect(
              minX,
              element.getRect()?.y,
              element.getWidth(),
              element.getHeight()
            );
          });
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/verticalCenter.json"),
      toolTip: "垂直居中",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const vCenterX = Math.max.apply(
            Math,
            arr.map((item) => {
              return item.getWidth();
            })
          );
          const node = arr.find((rs) => rs.getWidth() === vCenterX);
          arr.forEach((element) => {
            element.setPosition(
              node.getPosition()?.x,
              element.getPosition()?.y
            );
          });
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/rightAlign.json"),
      toolTip: "右对齐",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const maxX = Math.max.apply(
            Math,
            arr.map((item) => {
              return item.getRect()?.x + item.getRect()?.width;
            })
          );
          arr.forEach((element) => {
            element.setRect(
              maxX - element.getWidth(),
              element.getRect()?.y,
              element.getWidth(),
              element.getHeight()
            );
          });
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/topAlign.json"),
      toolTip: "顶对齐",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const minY = Math.min.apply(
            Math,
            arr.map((item) => {
              return item.getRect()?.y;
            })
          );
          arr.forEach((element) => {
            element.setRect(
              element.getRect()?.x,
              minY,
              element.getWidth(),
              element.getHeight()
            );
          });
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/horizontalCenter.json"),
      toolTip: "水平居中",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const hCenterY = Math.max.apply(
            Math,
            arr.map((item) => {
              return item.getHeight();
            })
          );
          const node = arr.find((rs) => rs.getHeight() === hCenterY);
          arr.forEach((element) => {
            element.setPosition(
              element.getPosition()?.x,
              node.getPosition()?.y
            );
          });
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/bottomAlign.json"),
      toolTip: "底部对齐",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const arr: any[] = [];
        dm.sm().each((sm: any) => {
          arr.push(sm);
        });
        if (arr.length > 1) {
          const MaxY = Math.max.apply(
            Math,
            arr.map((item) => {
              return item.getRect()?.y + item.getHeight();
            })
          );
          arr.forEach((element) => {
            element.setRect(
              element.getRect()?.x,
              MaxY - element.getHeight(),
              element.getWidth(),
              element.getHeight()
            );
          });
        }
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/grid.json"),
      toolTip: "网格",
      action: (e: any, t: any) => {
        const dm = t.editor.g2d.dm();
        const grid = dm.getDataByTag("bagGrid");
        if (grid) {
          dm.removeDataByTag("bagGrid");
          isGrid.current = false;
        } else {
          initGrid(dm.getDataByTag("background"));
          isGrid.current = true;
        }
      },
    },
    {
      icon: require("./editor/toolbarIcon/gridSnap.json"),
      toolTip: "吸附",
      action: (e: any, t: any) => {
        if (t.editor.g2d.getSnapSpacing() === 20) {
          t.editor.g2d.setSnapSpacing(0.001);
        } else {
          t.editor.g2d.setSnapSpacing(20);
        }
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/export.json"),
      toolTip: "分享",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              fitContent: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        setShareVisible(true);
        setShareType("export");
      },
    },
    {
      icon: require("./editor/toolbarIcon/import.json"),
      toolTip: "导入",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              fitContent: (arg0: boolean) => void;
            };
          };
        }
      ) => {
        setShareVisible(true);
        setShareType("import");
      },
    },
    "separator",
    {
      icon: require("./editor/toolbarIcon/password.json"),
      toolTip: "密码",
      action: (
        e: any,
        t: { editor: { g2d: { fitContent: (arg0: boolean) => void } } }
      ) => {
        handlePWVisible(true);
      },
    },
    {
      icon: require("./editor/toolbarIcon/fit.json"),
      toolTip: "Fit",
      action: (
        e: any,
        t: {
          editor: {
            g2d: {
              fitContent: (arg0: boolean, arg1: number) => void;
            };
          };
        }
      ) => {
        t.editor.g2d.fitContent(false, 0);
      },
    },
  ];

  const propertyDiv = document.createElement("div");
  propertyDiv.className = styles.propertyDiv;
  const propertyTitle = document.createElement("div");
  const propertySplit = new ht.widget.SplitView(
    propertyTitle,
    propertyDiv,
    "v",
    28
  );
  const frameDiv = document.createElement("div");
  frameDiv.className = styles.views;
  const formPane = new ht.widget.FormPane();
  // 组件面板
  const palette = new ht.widget.Palette();
  const paletteTitle = document.createElement("div");
  paletteTitle.innerHTML = "组件";
  paletteTitle.className = styles.leftTitle;
  const paletteSplit = new ht.widget.SplitView(paletteTitle, palette, "v", 28);
  paletteSplit.setDividerSize(0);
  const leftSplit = new ht.widget.SplitView(frameDiv, paletteSplit, "v", 215);
  // 编辑区域
  const borderPane = new ht.widget.BorderPane();
  const mainSplit = new ht.widget.SplitView(leftSplit, borderPane, "h", 220);
  mainSplit.setTogglable(false);
  mainSplit.setDraggable(false);
  mainSplit.setDividerBackground("#f4f4f4");
  // 数据容器 承载Data数据的模型
  const [dataModel] = useState(new ht.DataModel());

  // 拓扑组件
  const g2d = new ht.graph.GraphView(dataModel);
  g2d.enableDashFlow();
  // 刻度尺
  const rulerFrame = new ht.widget.RulerFrame(g2d);
  rulerFrame.getDefaultRulerConfig().guideVisible = true;
  // 编辑组件
  const editorSplit = new ht.widget.SplitView(
    rulerFrame,
    propertySplit,
    "h",
    -220
  );
  editorSplit.setDividerBackground("#f4f4f4");
  propertyDiv.onLayouted = () => {
    g2d.fitContent(false, 0);
  };
  editorSplit.setTogglable(false);
  editorSplit.setDraggable(false);
  ReactDOM.render(
    <div className={styles.leftTitle}>
      属性栏
      <DoubleRightOutlined
        className={styles.titleIcon}
        onClick={() => {
          editorSplit.setStatus("cr");
          editorSplit.setDividerSize(30);
          const dividerDiv = editorSplit.getDividerDiv();
          ReactDOM.render(
            <DoubleLeftOutlined
              className={styles.titleIcon}
              style={{
                margin: "10px 8px",
              }}
              onClick={() => {
                editorSplit.setStatus("normal");
                editorSplit.setDividerSize(0);
                ReactDOM.render(null, dividerDiv);
              }}
            />,
            dividerDiv
          );
        }}
      />
    </div>,
    propertyTitle
  );
  var historyManager = new ht.HistoryManager(dataModel);
  const viewPropertysRef = useRef<any>({});
  const viewRef = useRef();
  const oldModelData = useRef<any>("");
  // 用户图库
  const getScadaUserComponents = () => {
    queryCurrent().then((rs) => {
      if (rs.error) {
        message.error("组件加载失败");
        return;
      }
      queryAllScadaUserComponents({})
        .then(async (rs) => {
          const {
            data: {
              payload: { results },
            },
          } = rs;
          for (let i = 0; i < results?.length; i++) {
            try {
              results[i].userComponentData.indexOf(".json") === -1
                ? (results[i].image = results[i].userComponentData)
                : await request
                    .get(results[i].userComponentData)
                    .then((response) => {
                      if (response instanceof Object) {
                        results[i].image = results[i].userComponentData.split(
                          "?"
                        )[0];
                      } else {
                        results[i].image = response;
                      }
                    });
            } catch (error) {
              message.error("组件加载失败！");
            }
          }
          setUserComponents(results || []);
        })
        .catch(() => message.error("组件加载失败"));
    });
  };

  useEffect(() => {
    queryScadaGroups({
      isBase: true,
      code: system === "station" ? "station" : undefined,
    }).then((res: any) => {
      if (res.error) {
        message.error("组件加载失败");
        return;
      }
      const { data } = res;
      setScadaGroups(data.payload.results);
    });
    getScadaUserComponents();
  }, []);

  useEffect(() => {
    if (scadaGroups && scadaGroups.length !== 0) {
      queryScadaComponents({
        groupIDs: scadaGroups,
      }).then((res: any) => {
        if (res.error) {
          message.error("组件加载失败");
          return;
        }
        const {
          data: {
            payload: { results },
          },
        } = res;
        componentsData(results || []);
      });
    }
  }, [scadaGroups]);
  // 处理组件数据
  const componentsData = async (val: any[]) => {
    Promise.all(val.map((rs) => request.get(rs.componentData)))
      .then((rs) => {
        const data: any[] = [];
        let c: {
          groupID: string;
          items: any[];
        }[] = [];
        let d = {};
        for (let l in rs) {
          let img;
          if (/^{/.test(rs[l])) {
            try {
              JSON.parse(rs[l]);
              img = JSON.parse(rs[l]);
            } catch (error) {
              img = rs[l];
            }
          } else {
            img = rs[l];
          }
          data.push({ ...val[l], image: img });
        }
        data.forEach((element) => {
          if (!d[element.groupID]) {
            c.push({
              groupID: element.groupID,
              items: [element],
            });
            d[element.groupID] = element;
          } else {
            c.forEach((ele) => {
              if (ele.groupID == element.groupID) {
                ele.items.push(element);
              }
            });
          }
        });
        scadaGroups.forEach((element: any) => {
          c.forEach((item: any) => {
            if (element.id === item.groupID) {
              item.name = element.name;
              item.seq = element.seq;
            }
          });
        });
        setLoading(false);
        setScadaComponents(c.sort((a: any, b: any) => a.seq - b.seq));
      })
      .catch(() => message.error("组件加载异常！"));
  };

  useEffect(() => {
    if (scadaComponents.length !== 0 && userComponents) {
      DivRef.current.innerHTML = "";
      initEditor();
    }
  }, [scadaComponents, userComponents]);

  // 网格背景
  const initGrid = (node: any) => {
    dataModel.removeDataByTag("bagGrid");
    const width = node.getWidth();
    const height = node.getHeight();
    const grid = new ht.Grid();
    const rowCount = height / 20 + 2;
    const columnCount = width / 20 + 2;
    const x = (width % 20) / 2 - 20;
    const y = (height % 20) / 2 - 20;
    grid.setSize(width + 40, height + 40);
    grid.setStyle("grid.row.count", rowCount);
    grid.setStyle("grid.column.count", columnCount);
    grid.setStyle("grid.border", 1);
    grid.setStyle("grid.gap", 0);
    grid.setStyle("grid.cell.depth", 0);
    grid.setStyle("grid.depth", 0);
    grid.setStyle("grid.background", "rgba(255,255,255,0)");
    grid.setStyle("grid.cell.border.color", "rgb(239,240,244,0.6)");
    grid.setStyle("select.width", 0);
    grid.s("2d.movable", false);
    grid.s("2d.selectable", false);
    grid.setPosition(x, y);
    grid.setTag("bagGrid");
    dataModel.add(grid);
    dataModel.moveToTop(grid);
    dataModel.moveToTop(node);
  };

  const onSelectView = (val: { modelData: any; modelProperty: any }) => {
    const { modelData, modelProperty } = val;
    setSelectModelData(modelData);
    request.get(modelData).then((response) => {
      dataModel.clear();
      try {
        dataModel.deserialize(response);
      } catch (error) {
        dataModel.deserialize(modelData);
      }
      dataModel.setHierarchicalRendering(true);
      if (!dataModel.getDataByTag("background")) {
        var node = new ht.Node();
        node.setImage(require("./editor/background.json"));
        node.setTag("background");
        node.setPosition({ x: 0, y: 0 });
        node.s("2d.movable", false);
        node.s("2d.selectable", false);
        dataModel.add(node);
        dataModel.moveToTop(node);
        globalTextCol.current = "#000";
      } else {
        globalTextCol.current = dataModel
          .getDataByTag("background")
          .s("text.color");
      }
      initRightToolbar();
      dataModel.setBackground(null);
      g2d.fitContent(false, 0);
      oldModelData.current = dataModel.serialize(0);
      isGrid.current && initGrid(dataModel.getDataByTag("background"));
    });
    request.get(modelProperty).then((response) => {
      if (response instanceof Object) {
        viewPropertysRef.current = response;
      } else {
        try {
          viewPropertysRef.current = JSON.parse(response);
        } catch (error) {
          viewPropertysRef.current = {};
        }
      }
    });
  };
  const renderView = () => {
    ReactDOM.render(
      <Views
        vRef={viewRef}
        scadaModelID={id}
        onSelectView={(v) => handleSwitch(v)}
        onShrink={() => {
          mainSplit.setStatus("cl");
          mainSplit.setDividerSize(30);
          const dividerDiv = mainSplit.getDividerDiv();
          ReactDOM.render(
            <DoubleRightOutlined
              className={styles.titleIcon}
              style={{
                margin: "10px 8px",
              }}
              onClick={() => {
                mainSplit.setStatus("normal");
                mainSplit.setDividerSize(0);
                ReactDOM.render(null, dividerDiv);
              }}
            />,
            dividerDiv
          );
        }}
        queryAllViews={queryAllViews}
        addView={addView}
        deleteView={deleteView}
        updateView={updateView}
        copyView={copyView}
        setMainView={setMainView}
        getPresignedURL={getPresignedURL}
        queryCodes={queryCodes}
      />,
      frameDiv
    );
  };

  const handleSwitch = (v: { modelData: any; modelProperty: any }) => {
    dataModel.removeDataByTag("bagGrid");
    const data = dataModel.serialize(0);
    if (data === oldModelData.current || !viewDataRef.current) {
      viewDataRef.current = v;
      onSelectView(v);
    } else {
      if (viewDataRef.current?.key !== v.key) {
        request.get(viewDataRef.current?.modelData).then((rs) => {
          if (/^http.*/.test(viewDataRef.current.modelData) && rs !== data) {
            switchModal(v);
          } else {
            viewDataRef.current = v;
            onSelectView(v);
          }
        });
      } else {
        viewDataRef.current = v;
        onSelectView(v);
      }
    }
  };
  const switchModal = (v: { modelData: any; modelProperty: any }) => {
    confirm({
      title: "画面未保存，是否保存?",
      okType: "danger",
      onOk: () => {
        saveModel().then(() => {
          viewDataRef.current = v;
          onSelectView(v);
        });
      },
      onCancel: () => {
        viewDataRef.current = v;
        onSelectView(v);
      },
    });
  };

  // 右侧工具栏
  const renderRightToolbar = (view: any) => {
    ReactDOM.render(
      <ScadaContext.Provider
        value={{
          queryAllTslPropertiesByGatewayID,
          queryAllDeviceDataSources,
          queryAllTslPropertiesInStation,
          queryAllEquipments,
          queryAllEquipmentVariable,
          stationID,
          equipmentID,
          system,
          enterpriseID,
          getAllMonitors,
          getAllTslProperties,
        }}
      >
        {view}
      </ScadaContext.Provider>,
      propertyDiv
    );
  };
  // 初始化右侧属性栏
  const initRightToolbar = () => {
    renderRightToolbar(undefined);
    const bagNode = dataModel.getDataByTag("background");
    const bagValue = {
      dataModel: true,
      presetSize: bagNode?.a("presetSize") || "1280*720",
      bagImg: bagNode?.a("img"),
      bagColor: bagNode?.s("background"),
      presetWidth: bagNode?.a("presetWidth"),
      presetHeight: bagNode?.a("presetHeight"),
      textColor: bagNode?.s("text.color"),
    };
    renderRightToolbar(
      <GeneralModal
        onSubmit={(value: any) => generalModalSubmit(value)}
        values={bagValue}
        scadaModelID={id}
        isModal={false}
        queryAllViews={queryAllViews}
        queryAllVideos={queryAllVideos}
        system={system}
      />
    );
  };

  const initEditor = () => {
    initBaseView();
    initPalette();
    initGraphView();
    resetDefault();
    mainSplit.addToDOM(DivRef.current);
    renderView();
    g2d.fitContent(false, 0);
  };
  const initBaseView = () => {
    // 样式
    ht.Default.paletteTitleHeight = 28;
    ht.Default.paletteTitleLabelFont = 14;
    ht.Default.paletteTitleBackground = "#f4f4f4";
    ht.Default.widgetTitleHeight = 50;
    ht.Default.toolbarBackground = "#ffffff";
    const tooltipDiv = ht.Default.getToolTipDiv();
    tooltipDiv.style.borderRadius = "5px";
    tooltipDiv.style.border = "1px solid #eee";
    tooltipDiv.style.zIndex = 10000;

    dataModel.each((data: { setLayer: (arg0: number) => void }) => {
      if (!(data instanceof ht.Edge)) data.setLayer(1);
    });
    g2d.setLayers(["0", 1]);
    if (g2d.getEditInteractor()) {
      g2d.getEditInteractor().setStyle("anchorVisible", false);
    }

    let sm = dataModel.sm();
    sm.ms(() => {
      const currentNode = sm.ld();
      formPane.setDisabled(currentNode == null);
      if (currentNode) {
        formPane.v({
          tag: currentNode.getTag() || "",
          type: currentNode.a("type"),
        });
      }
    });
    // 工具条
    const toolbar_right = new ht.widget.Toolbar(
      system === "iot"
        ? toolbar_config_right.filter((rs) => rs.toolTip !== "密码")
        : toolbar_config_right
    );
    toolbar_right.getSelectBackground = () => {
      return "rgb(240,239,238)";
    };
    toolbar_right.editor = {
      g2d,
      dm: dataModel,
    };
    toolbar_right.enableToolTip();
    // 组合工具条
    const topSplit = new ht.widget.SplitView(toolbar_right, "", "h", 1);
    topSplit.setDividerSize(0);
    topSplit.setHeight(37);
    topSplit.setDividerBackground("#fff");
    // 编辑区域
    borderPane.setTopView(topSplit, 37);
    borderPane.setCenterView(editorSplit);
    // // 树组件
    // const treeView = new ht.widget.TreeView(dataModel);
  };
  // 默认网格吸附
  const resetDefault = () => {
    const editInteractor = new ht.graph.XEditInteractor(g2d);
    g2d.setInteractors(
      new ht.List([
        new ht.graph.ScrollBarInteractor(g2d),
        new ht.graph.SelectInteractor(g2d),
        editInteractor,
        new ht.graph.SnapMoveInteractor(g2d),
        new ht.graph.DefaultInteractor(g2d),
        new ht.graph.SnapTouchInteractor(g2d, { editable: false }),
      ])
    );
    g2d.setSnapSpacing(0.001);
  };
  // 初始化组件面板中的内容
  const initPalette = () => {
    const palette_config: any = [];
    scadaComponents.forEach((item) => {
      palette_config.push({
        name: item.name,
        items: item.items,
        seq: item.seq,
      });
      if (item.seq === 1) {
        palette_config.push({
          name: "用户图库",
          items: userComponents,
          seq: 2,
        });
      }
    });
    palette.setItemImageWidth(55);
    var dm = palette.dm();
    for (var key in palette_config) {
      var info = palette_config[key];
      // 组件面板用ht.Group展示分组，ht.Node展示按钮元素
      var group = new ht.Group();
      group.setName(info.name);
      dm.add(group); // 将节点添加到 palette 的数据容器中
      if (info.seq === 1 || info.seq === 2) group.setExpanded(true);
      info.items?.forEach((item) => {
        // 新建 ht.Node 类型节点
        var node = new ht.Node();
        node.setName(item.name);
        node.setImage(item.image);
        node.setTag(item.tag);
        node.item = item;
        node.s({
          // 设置节点显示图片为填充的方式，这样不同比例的图片也不会因为拉伸而导致变形
          "image.stretch": item.stretch || "centerUniform",
          // 设置节点是否可被拖拽
          draggable: item.draggable === undefined ? true : item.draggable,
        });
        node.a("type", item.componentType || item.userComponentType);
        switch (item.componentType) {
          case "Text":
            node.s({
              text: "T_",
              "text.color": "#0070cc",
              "text.align": "center",
              "text.vAlign": "middle",
              "text.font": "48px Times New Roman",
            });
            break;
          case "button":
            node.s({
              text: "OK",
              ...textStyle,
            });
            break;
          case "viewBtn":
            node.s({
              text: "Tab",
              ...textStyle,
            });
            break;
          case "viewHandle":
            node.s({
              text: "切换",
              ...textStyle,
            });
            break;
          case "line":
            node.setImage(require("./editor/symbols/line.json"));
            break;
          case "textIndicator":
            node.setImage(require("./editor/symbols/textIndicator.json"));
            break;
          case "dataBind":
            node.setImage(require("./editor/symbols/dataBind.json"));
            break;
          case "chart":
            node.setImage(require("../asset/smChart.png"));
            break;
          case "gauge":
            node.setImage(require("../asset/gauge.png"));
            break;
          case "barChart":
            node.setImage(require("../asset/smBar.png"));
            break;
          case "time":
            node.setImage(require("../asset/date-time.png"));
            break;
          case "container":
            node.setImage(require("../asset/smcontainer.png"));
            break;
          case "pie":
            node.setImage(require("../asset/pie.png"));
            break;
        }
        // 将节点设置为 group 组的孩子
        group.addChild(node);
        dm.add(node);
      });
    }
  };

  const renderProperty = (data: any) => {
    setData(data);
    const value = {
      // 公共
      propertys: viewPropertysRef.current,
      name: data.getName(),
      labelColor: data.s("label.color"),
      editable: data.s("2d.editable"),
      movable: data.s("2d.movable"),
      positionX: data.getPosition().x,
      positionY: data.getPosition().y,
      width: data.getWidth(),
      height: data.getHeight(),
      stretch: data.s("image.stretch"),
      background: data.s("background"),
      dash: data.s("dash"),
      borderColor: data.s("borderColor"),
      borderWidth: data.s("borderWidth"),
      tag: data.getTag(),
      type: data.a("type") || undefined,
      show: data.a("show"),
      showTag: data.a("showRule")?.showTag,
      ruleType: data.a("showRule")?.ruleType,
      rule: data.a("showRule")?.rule,
      ruleOne: data.a("showRule")?.ruleOne,
      logic: data.a("showRule")?.logic,
      ruleTwo: data.a("showRule")?.ruleTwo,
      scaleX: data.getScaleX() === -1,
      scaleY: data.getScaleY() === -1,
      // text
      text: data.s("text"),
      textAlign: data.s("text.align"),
      textVAlign: data.s("text.vAlign"),
      textColor: data.s("text.color"),
      textFont: data.s("text.font"),
      indicatorLight: data.a("indicatorLight"),
      textData: data.a("textData"),
      indicator: data.a("indicator"),
      iframe: data.a("iframeUrl"),
      img: data.a("img"),
      // rect
      gradient: data.a("gradient"),
    };
    const dataBindVal = {
      JSFunc: data.a("JSFunc"),
      JSFuncCheck: data.a("JSFuncCheck"),
      dataFormat: data.a("dataFormat"),
      RW: data.a("RW"),
      passwordChecked: data.a("passwordChecked"),
      nameCheck: data.a("nameCheck"),
      unitCheck: data.a("unitCheck"),
      unit: data.a("unit"),
      valName: data.a("valName"),
    };
    const buttonVal = {
      butVal: data.a("butVal"),
      wButVal: data.a("wButVal"),
      passwordChecked: data.a("passwordChecked"),
      pwSet: data.a("pwSet"),
      perform: data.a("perform"),
      downButVal: data.a("downButVal"),
      upButVal: data.a("upButVal"),
    };
    const chartVal = {
      // chart
      chartType: data.a("chartType"),
      chartColor: data.a("chartColor"),
      time: data.a("time"),
      gauMin: data.a("gauMin"),
      gauMax: data.a("gauMax"),
      gauLinColor: data.a("gauLinColor"),
      noticeVal: data.a("noticeVal"),
      warnVal: data.a("warnVal"),
      normalCol: data.a("normalCol"),
      noticeCol: data.a("noticeCol"),
      warnCol: data.a("warnCol"),
      linWidth: data.a("linWidth"),
      refreshTime: data.a("refreshTime"),
      axisLabelCol: data.a("axisLabelCol"),
      chartTitle: data.a("chartTitle"),
      legendShow: data.a("legendShow"),
    };
    const timeVal = {
      // time
      dateCheck: data.a("dateCheck"),
      dateFormat: data.a("dateFormat"),
      dateSeparator: data.a("dateSeparator"),
      weekCheck: data.a("weekCheck"),
      timeCheck: data.a("timeCheck"),
      timeFormat: data.a("timeFormat"),
    };
    const containerVal = {
      // container
      conMin: data.a("conMin"),
      conMax: data.a("conMax"),
      conCol: data.a("conCol"),
      conBackground: data.a("conBackground"),
      scaleCheck: data.a("scaleCheck"),
      axisLabelCol: data.a("axisLabelCol"),
    };
    const switchVal = {
      bagTrue: data.a("bagTrue"),
      bagFalse: data.a("bagFalse"),
      btnTrue: data.a("btnTrue"),
      btnFalse: data.a("btnFalse"),
      textTrue: data.a("textTrue"),
      textTrueCol: data.a("textTrueCol"),
      textFalse: data.a("textFalse"),
      textFalseCol: data.a("textFalseCol"),
      passwordChecked: data.a("passwordChecked"),
    };
    const viewBtn = {
      selBag: data.a("selBag"),
      noSelBag: data.a("noSelBag"),
      passwordChecked: data.a("passwordChecked"),
    };
    const flow = {
      flowRule: data.a("flowRule"),
      flowRuleNum: data.a("flowRuleNum"),
      dashCol: data.s("shape.dash.color"),
      dashWidth: data.s("shape.dash.width"),
      bagCol: data.s("shape.border.color"),
      bagWidth: data.s("shape.border.width"),
    };
    const videoVal = {
      video: data.a("video"),
      validity: data.a("validity"),
    };
    let temValue = value;
    switch (data.a("type")) {
      case "chart":
        setValues({
          ...value,
          ...chartVal,
        });
        temValue = {
          ...value,
          ...chartVal,
        };
        break;
      case "barChart":
        setValues({
          ...value,
          ...chartVal,
        });
        temValue = {
          ...value,
          ...chartVal,
        };
        break;
      case "gauge":
        setValues({
          ...value,
          ...chartVal,
        });
        temValue = {
          ...value,
          ...chartVal,
        };
        break;
      case "time":
        setValues({
          ...value,
          ...timeVal,
        });
        temValue = {
          ...value,
          ...timeVal,
        };
        break;
      case "container":
        setValues({
          ...value,
          ...containerVal,
        });
        temValue = {
          ...value,
          ...containerVal,
        };
        break;
      case "switch":
        setValues({
          ...value,
          ...switchVal,
        });
        temValue = {
          ...value,
          ...switchVal,
        };
        break;
      case "viewBtn":
        setValues({
          ...value,
          ...viewBtn,
        });
        temValue = {
          ...value,
          ...viewBtn,
        };
        break;
      case "viewHandle":
        setValues({
          ...value,
          viewId: data.a("viewTag") || data.a("viewId"),
        });
        temValue = {
          ...value,
          viewId: data.a("viewTag") || data.a("viewId"),
        };
        break;
      case "flow":
        setValues({ ...value, ...flow });
        temValue = { ...value, ...flow };
        break;
      case "pie":
        setValues({
          ...value,
          isRing: data.a("isRing"),
        });
        temValue = {
          ...value,
          isRing: data.a("isRing"),
        };
        break;
      case "button":
        setValues({
          ...value,
          ...buttonVal,
        });
        temValue = {
          ...value,
          ...buttonVal,
        };
        break;
      case "dataBind":
        setValues({
          ...value,
          ...dataBindVal,
        });
        temValue = {
          ...value,
          ...dataBindVal,
        };
        break;
      case "video":
        setValues({
          ...value,
          ...videoVal,
        });
        temValue = {
          ...value,
          ...videoVal,
        };
        break;
      default:
        setValues(value);
        temValue = { ...value };
        break;
    }
    renderRightToolbar(undefined);
    if (
      !data.a("type") ||
      ![
        "IndicatorLight",
        "textIndicator",
        "img",
        "chart",
        "gauge",
        "barChart",
        "container",
        "pie",
        "gallery",
        "eg",
      ].includes(data.a("type"))
    ) {
      renderRightToolbar(
        <GeneralModal
          onSubmit={(value: any) => generalModalSubmit(value, data)}
          values={temValue}
          scadaModelID={id}
          isModal={false}
          queryAllViews={queryAllViews}
          queryAllVideos={queryAllVideos}
          system={system}
          stationID={stationID}
        />
      );
    } else if (data.a("type") === "img") {
      renderRightToolbar(
        <ImgModal
          onSubmit={(value: any) => imgModalSubmit(value, data)}
          values={temValue}
          scadaModelID={id}
          isModal={false}
        />
      );
    } else if (
      ["IndicatorLight", "textIndicator", "eg"].includes(data.a("type"))
    ) {
      renderRightToolbar(
        <PropertyModal
          onSubmit={(value: any) => propertyModalSubmit(value, data)}
          values={temValue}
          scadaModelID={id}
          isModal={false}
          system={system}
        />
      );
    } else {
      initRightToolbar();
    }
  };

  const initGraphView = () => {
    var group;
    // 判断是否为触屏可 Touch 方式交互
    if (ht.Default.isTouchable) {
      // 重写此方法可以禁用 HTML5 原生的 Drag 和 Drop 事件并启用模拟的拖拽事件
      palette.handleDragAndDrop = (e: Event, state: string) => {
        // 判断交互事件所处位置是否在View组件之上
        if (ht.Default.containedInView(e, g2d)) {
          if (state === "between") {
            e.preventDefault();
          }
          // 当 state 为 end 时，判断e是否在 graphView 的范围内，如果是，则创建 Node
          else if (state === "end") {
            handleDrop(e);
          }
        }
      };
    } else {
      g2d.getView().addEventListener("dragover", (e) => {
        e.dataTransfer.dropEffect = "copy";
        e.preventDefault();
        // 从palette面板上拖拽到拓扑图上，还未放开鼠标时 经过group则加一个边框
        var data = g2d.getDataAt(e);
        if (
          data instanceof ht.Group ||
          (data && data.getParent() instanceof ht.Group)
        ) {
          group =
            data.getParent() instanceof ht.Group ? data.getParent() : data;
          group.s("border.color", "rgb(26,189,156)");
          group.s("border.width", 1);
        } else {
          if (group) group.s("border.width", 0);
        }
      });
      g2d.getView().addEventListener("drop", (e) => {
        handleDrop(e);
      });
      var eventType = ht.Default.isTouchable ? "touchend" : "mouseup";
      g2d.getView().addEventListener(eventType, (e) => {
        var data = g2d.getDataAt(e);
        e.preventDefault();
        if (data && data.getClassName() !== "ht.Edge") {
          ht.Default.isDoubleClick(e) &&
            data.a("type") !== "block" &&
            handleModalVisible(true);
          renderProperty(data);
        }
      });
      g2d.addInteractorListener((e: any) => {
        var data = g2d.getDataAt(e);
        if (e.kind.indexOf("Background") !== -1) {
          const bagNode = dataModel.getDataByTag("background");
          const values = {
            dataModel: true,
            presetSize: bagNode.a("presetSize"),
            bagImg: bagNode.a("img"),
            bagColor: bagNode.s("background"),
            presetWidth: bagNode.a("presetWidth"),
            presetHeight: bagNode.a("presetHeight"),
            textColor: bagNode.s("text.color"),
          };
          if (e.kind === "doubleClickBackground") {
            // 双击背景
            handleModalVisible(true);
            setValues(values);
          } else {
            renderRightToolbar(undefined);
            renderRightToolbar(
              <GeneralModal
                onSubmit={(value: any) => generalModalSubmit(value)}
                values={values}
                scadaModelID={id}
                isModal={false}
                queryAllViews={queryAllViews}
                queryAllVideos={queryAllVideos}
                system={system}
                stationID={stationID}
              />
            );
          }
        }
        if (e.kind === "clickData") {
          // 画布置底
          data.getTag() === "bagkground" && dataModel.moveToTop(data);
        }
        //禁止图元拖出画布
        if (e.kind === "endMove") {
          const bagNode = dataModel.getDataByTag("background");
          const minX = bagNode.getRect().x;
          const minY = bagNode.getRect().y;
          const maxX = -bagNode.getRect().x;
          const maxY = -bagNode.getRect().y;
          const dataWidth = data.getRect().width;
          const dataHeight = data.getRect().height;
          const dataMinX = data.getRect().x;
          const dataMinY = data.getRect().y;
          const dataMaxX = data.getRect().x + dataWidth;
          const dataMaxY = data.getRect().y + dataHeight;
          if (
            (minX > dataMinX && minY > dataMinY) ||
            (maxX < dataMaxX && maxY < dataMaxY) ||
            (minX > dataMinX && maxY < dataMaxY) ||
            (maxX < dataMaxX && minY > dataMinY)
          ) {
            minX > dataMinX &&
              minY > dataMinY &&
              data.setPosition(minX + dataWidth / 2, minY + dataHeight / 2);
            maxX < dataMaxX &&
              maxY < dataMaxY &&
              data.setPosition(maxX - dataWidth / 2, maxY - dataHeight / 2);
            minX > dataMinX &&
              maxY < dataMaxY &&
              data.setPosition(minX + dataWidth / 2, maxY - dataHeight / 2);
            maxX < dataMaxX &&
              minY > dataMinY &&
              data.setPosition(maxX - dataWidth / 2, minY + dataHeight / 2);
          } else {
            if (minX > dataMinX) {
              data.setPosition(minX + dataWidth / 2, data.getRect().y);
            } else if (maxX < dataMaxX) {
              data.setPosition(maxX - dataWidth / 2, data.getRect().y);
            }
            if (minY > dataMinY) {
              data.setPosition(data.getRect().x, minY + dataHeight / 2);
            } else if (maxY < dataMaxY) {
              data.setPosition(data.getRect().x, maxY - dataHeight / 2);
            }
          }
        }
      });
      resizeEvent(DivRef.current, () => {
        g2d.fitContent(false, 0);
      });
      dataModel.mm((e) => {
        if (e.kind === "remove") {
          const temObj = viewPropertysRef.current;
          delete temObj[e.data.getTag()];
          delete temObj[e.data.a("showRule")?.showTag];
          viewPropertysRef.current = temObj;
          initRightToolbar();
        }
      });
    }
  };
  // 被拖拽的元素在目标元素上同时鼠标放开触发的事件
  const handleDrop = (e: any) => {
    e.preventDefault();
    // 获取 palette 面板上最后选中的节点
    var paletteNode = palette.dm().sm().ld();
    if (paletteNode) {
      // 获取画布
      const bagNode = dataModel.getDataByTag("background");
      var item = paletteNode.item,
        image = item.image;
      // 获取事件下的节点
      const node =
        item.componentType === "Text"
          ? new ht.Text()
          : item.componentType === "flow"
          ? new ht.Shape()
          : (g2d.getDataAt(e, null, 5), new ht.Node());
      node.p(g2d.lp(e));
      node.a("type", paletteNode.a("type"));
      node.setLayer(1);
      node.s("image.stretch", "uniform");
      switch (item.componentType) {
        case "video":
          node.setImage(require("../asset/video.png"));
          node.setWidth(400);
          node.setHeight(220);
          break;
        case "chart":
          node.setImage(require("../asset/chart.png"));
          node.a("img", item.image);
          node.s("image.stretch", "fill");
          break;
        case "barChart":
          node.setImage(require("../asset/barChart.png"));
          node.s("image.stretch", "fill");
          node.a("img", item.image);
          break;
        case "gauge":
          item.image.renderHTML = new Function(
            "return " + item.image.renderHTML
          )();
          node.setImage(item.image);
          break;
        case "container":
          node.setImage(require("../asset/container.png"));
          node.a("img", item.image);
          node.s("image.stretch", "fill");
          break;
        case "pie":
          node.setImage(require("../asset/pie.png"));
          node.a("img", item.image);
          break;
        case "time":
          node.setImage(image);
          node.a("dateCheck", true);
          node.a("dateFormat", "YYYY-MM-DD");
          node.a("dateSeparator", "-");
          node.a("weekCheck", true);
          node.a("timeCheck", true);
          node.a("timeFormat", "HH:mm:ss");
          const date = moment(new Date()).format("YYYY-MM-DD");
          const week = "周" + "日一二三四五六".charAt(new Date().getDay());
          const time = moment(new Date()).format("HH:mm:ss");
          node.a("date", `${date} ${week} ${time}`);
          break;
        case "button":
          node.setImage(image);
          node.s({
            text: "OK",
            ...textStyle,
          });
          break;
        case "viewHandle":
          node.setImage(image);
          node.s({
            text: "切换",
            ...textStyle,
          });
          break;
        case "viewBtn":
          node.setImage(image);
          node.s({
            text: "Tab",
            ...textStyle,
          });
          node.setTag(node.getId() + "");
          node.s("onDown", function (event: any, data: any, view: any) {
            data.s("background", data.a("selBag") || "#0070cc");
            view.dm().toDatas((item: any) => {
              if (
                item.a("type") === "viewBtn" &&
                item.getTag() !== data.getTag()
              ) {
                item.s("background", item.a("noSelBag") || "#b1b2b1");
              }
            });
            view.dm().toDatas((item: any) => {
              if (item.getTag() && item.getTag().indexOf("block") !== -1) {
                item.getTag() && item.getTag().indexOf(data.getTag()) !== -1
                  ? item.s("2d.visible", true)
                  : item.s("2d.visible", false);
              }
            });
          });
          const block = new ht.Block();
          block.setTag(node.getTag() + "block");
          block.a("type", "block");
          block.setSyncSize(false);
          block.setPosition({
            x: 0,
            y: 0,
          });
          block.setSize(bagNode.getWidth(), bagNode.getHeight());
          block.setParent(node);
          block.setClickThroughEnabled(true);
          dataModel.add(block);
          break;
        case "flow":
          node.setPoints(
            new ht.List([
              {
                x: node.getPosition().x - 50,
                y: node.getPosition().y,
              },
              {
                x: node.getPosition().x + 50,
                y: node.getPosition().y,
              },
            ])
          );
          node.setSize(300, 20);
          node.s({
            type: "shape",
            "shape.background": null,
            "shape.dash": true,
            "shape.dash.flow": false,
            "shape.dash.color": "#0070cc",
            "shape.border.width": 8,
            "shape.dash.width": 1,
            "shape.border.color": "#d6ebff",
          });
          break;
        case "dataBind":
          node.a("nameCheck", true);
          node.a("unitCheck", true);
          node.a("valName", "变量名称");
          node.a("dataFormat", "##.#");
          node.setImage(image);
          node.setTag(item.tag);
          break;
        default:
          node.setImage(image);
          node.setTag(item.tag);
          break;
      }
      node.s("text.color", globalTextCol.current || "#000");
      if (ht.Default.containsRect(bagNode.getRect(), node.getRect())) {
        node.a("type") !== "viewBtn" &&
          dataModel
            .toDatas((item: any) => {
              return item.getTag() && item.getTag().indexOf("block") !== -1;
            })
            .toList()
            .forEach((element) => {
              if (element.s("2d.visible")) {
                node.setParent(element);
              }
            });
        g2d.dm().add(node);
        g2d.sm().ss(node);
        renderProperty(node);
      } else {
        dataModel.remove(dataModel.getDataByTag(node.getTag() + "block"));
        message.warning("请拖动到画布内");
      }
    }
  };

  const handleFile = async (values: any) => {
    // 0.转文件
    const file = new File(
      [JSON.stringify(values.val)],
      `${values.name}_${
        viewDataRef.current.id || viewDataRef.current.key
      }.json`,
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

  const saveModel = async () => {
    setSaveLoading(true);
    const temModel = new ht.DataModel();
    const temData = dataModel.serialize(0);
    temModel.deserialize(temData);
    temModel.removeDataByTag("bagGrid");
    const data = temModel.serialize(0);
    // const dataModel = JSON.stringify(t);
    message.loading("保存中...", 0);
    const modelData = handleFile({
      val: data,
      name: "modelData",
    });
    const modelProperty = handleFile({
      val: viewPropertysRef.current,
      name: "modelProperty",
    });
    return Promise.all([modelData, modelProperty]).then((values) => {
      const temArr = values.map(
        (rs) =>
          rs.url.substr(0, rs.url.indexOf("?")) + `?v=${new Date().getTime()}`
      );
      return updateView({
        id: viewDataRef.current.id || viewDataRef.current.key,
        modelData: temArr.find((rs) => rs.indexOf("modelData") !== -1),
        modelProperty: temArr.find((rs) => rs.indexOf("modelProperty") !== -1),
        tag: viewDataRef.current.tag || new Date().getTime(),
      }).then((rs) => {
        setSaveLoading(false);
        if (rs.error || rs.errors) {
          message.destroy();
          message.error("保存失败");
          return false;
        }
        message.destroy();
        message.success("保存成功");
        viewRef.current?.getAllViews();
        return true;
      });
    });
  };

  useImperativeHandle(saveRef, () => ({
    // chileSaveModel 就是暴露给父组件的方法
    chileSaveModel: saveModel,
    loading: saveLoading,
  }));

  const importData = (val: string) => {
    request.get(val).then((response) => {
      handleFile({
        val: response,
        name: "modelData",
      }).then((rs) => {
        const url =
          rs?.url?.substr(0, rs?.url?.indexOf("?")) +
          `?v=${new Date().getTime()}`;
        updateView({
          id: viewDataRef.current.id || viewDataRef.current.key,
          modelData: url,
          tag: viewDataRef.current.tag || new Date().getTime(),
        }).then((res) => {
          if (res.error || res.errors) {
            message.destroy();
            message.error("导入异常");
            return false;
          }
          setShareVisible(false);
          message.destroy();
          message.success("导入成功");
          viewRef.current?.getAllViews();
        });
      });
    });
  };

  const publicDataValue = (value: any, node?: any) => {
    node.setTag(value.tag);
    viewPropertysRef.current = value.propertys;
    node.setName(value.name);
    node.setWidth(parseInt(value.width));
    node.setHeight(parseInt(value.height));
    node.p({
      x: parseInt(value.positionX),
      y: parseInt(value.positionY),
    });
    node.s("2d.editable", value.editable);
    node.s("2d.movable", value.movable);
    node.s("image.stretch", value.stretch);
    node.setScaleX(value.scaleX ? -1 : 1);
    node.setScaleY(value.scaleY ? -1 : 1);
  };

  const generalModalSubmit = (value: any, node?: any) => {
    if (value.presetSize) {
      const bagNode = dataModel.getDataByTag("background");
      const presetWidth = bagNode.getWidth();
      const presetHeight = bagNode.getHeight();
      bagNode.a("presetSize", value.presetSize);
      bagNode.a("presetWidth", value.presetWidth);
      bagNode.a("presetHeight", value.presetHeight);
      bagNode.s("text.color", value.textColor || "#000000");
      globalTextCol.current = value.textColor || "#000000";
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
      if (
        isGrid.current &&
        (presetWidth !== width || presetHeight !== height)
      ) {
        initGrid(bagNode);
      }
      if (value.bagImg) {
        bagNode.a("img", value.bagImg);
        bagNode.setImage(decodeURIComponent(value.bagImg));
      } else if (value.bagColor) {
        bagNode.a("img", undefined);
        bagNode.setImage(require("./editor/background.json"));
        bagNode.s("background", value.bagColor || "#ffffff");
      }
    } else {
      node.a("show", value.show || "show");
      node.a("showRule", {
        showTag: value.showTag,
        ruleType: value.ruleType,
        rule: value.rule,
        ruleOne: value.ruleOne,
        logic: value.logic,
        ruleTwo: value.ruleTwo,
      });
      publicDataValue(value, node);
      node.s("background", value.background || undefined);
      node.s("borderColor", value.borderColor || undefined);
      node.s("borderWidth", value.borderWidth);
      node.s("text", value.text);
      node.s("text.align", value.textAlign);
      node.s("text.vAlign", value.textVAlign);
      node.s("text.color", value.textColor || undefined);
      node.s("text.font", value.textFont);
      node.s("dash", value.dash);
      node.a("type") === "iframe" && node.a("iframeUrl", value.iframe);
      node.a("type") === "viewHandle" && node.a("viewTag", value.viewId);
      node.a("type") === "rect" && node.a("gradient", value.gradient);
      switch (node.a("type")) {
        case "video":
          node.a("video", value.video);
          node.a("validity", value.validity);
          break;
        case "dataBind":
          node.a("dataFormat", value.dataFormat);
          node.a("JSFunc", value.JSFunc);
          node.a("JSFuncCheck", value.JSFuncCheck);
          node.a("RW", value.RW);
          node.a("passwordChecked", value.passwordChecked);
          node.a("nameCheck", value.nameCheck);
          node.a("valName", value.valName);
          node.a("unit", value.unit);
          node.a("unitCheck", value.unitCheck);
          break;
        case "time":
          node.a("dateCheck", value.dateCheck);
          node.a("dateFormat", value.dateFormat);
          node.a("dateSeparator", value.dateSeparator);
          node.a("weekCheck", value.weekCheck);
          node.a("timeCheck", value.timeCheck);
          node.a("timeFormat", value.timeFormat);
          let temDateFormat = value.dateFormat.replace(
            /-/g,
            value.dateSeparator
          );
          if (value.dateSeparator === "年月日") {
            switch (value.dateFormat.substr(0, 2)) {
              case "YY":
                temDateFormat = "YYYY年MM月DD日";
                break;
              case "MM":
                temDateFormat = "MM月DD日YYYY年";
                break;
              case "DD":
                temDateFormat = "DD日MM月YYYY年";
                break;
            }
          }
          const date = value.dateCheck
            ? moment(new Date()).format(temDateFormat)
            : "";
          const week = value.weekCheck
            ? "周" + "日一二三四五六".charAt(new Date().getDay())
            : "";
          const time = value.timeCheck
            ? moment(new Date()).format(value.timeFormat)
            : "";
          node.a("date", `${date} ${week} ${time}`);
          break;
        case "switch":
          node.a("bagTrue", value.bagTrue || undefined);
          node.a("bagFalse", value.bagFalse || undefined);
          node.a("btnTrue", value.btnTrue || undefined);
          node.a("btnFalse", value.btnFalse || undefined);
          node.a("textTrue", value.textTrue);
          node.a("textTrueCol", value.textTrueCol || undefined);
          node.a("textFalse", value.textFalse);
          node.a("textFalseCol", value.textFalseCol || undefined);
          node.a("passwordChecked", value.passwordChecked);
          break;
        case "button":
          node.a("butVal", value.butVal);
          node.a("wButVal", value.wButVal);
          node.a("passwordChecked", value.passwordChecked);
          node.a("pwSet", value.pwSet);
          node.a("perform", value.perform);
          node.a("downButVal", value.downButVal);
          node.a("upButVal", value.upButVal);
          break;
        case "viewBtn":
          node.s("background", value.selBag);
          node.a("selBag", value.selBag);
          node.a("noSelBag", value.noSelBag);
          node.a("passwordChecked", value.passwordChecked);
          break;
        case "flow":
          node.a("flowRule", value.flowRule);
          node.a("flowRuleNum", value.flowRuleNum);
          node.s({
            "shape.dash.color": value.dashCol || "#0070cc",
            "shape.border.width": value.bagWidth || 8,
            "shape.dash.width": value.dashWidth || 1,
            "shape.border.color": value.bagCol || "#d6ebff",
          });
          break;
      }
    }
  };
  const propertyModalSubmit = (value: any, node: any) => {
    node.a("show", value.show || "show");
    node.a("showRule", {
      showTag: value.showTag,
      ruleType: value.ruleType,
      rule: value.rule,
      ruleOne: value.ruleOne,
      logic: value.logic,
      ruleTwo: value.ruleTwo,
    });
    value.type === "IndicatorLight" &&
      node.a("indicatorLight", value.indicatorLight);
    ["textIndicator", "eg"].includes(value.type) &&
      node.a("textData", value.textData);
    publicDataValue(value, node);
    if (value.type === "textIndicator") {
      switch (value.indicator) {
        case "text":
          node.a("indicator") !== "text" &&
            node.setImage(require("./editor/textIndicator.json"));
          node.s("text.align", value.textAlign);
          node.s("text.vAlign", value.textVAlign);
          node.s("text.color", value.textColor || undefined);
          node.s("text.font", value.textFont);
          break;
        case "lamp":
          node.setImage(require("./editor/indicator.json"));
          break;
        case "img":
          /^http/.test(value.textData[0]?.label) &&
            node.setImage(decodeURIComponent(value.textData[0]?.label));
          break;
      }
    }
    node.a("indicator", value.indicator);
    node.a("value", value.textData[0]?.condition?.num);
    if (value.type === "IndicatorLight") {
      node.a("value", 0);
    }
  };
  const imgModalSubmit = (value: any, node: any) => {
    if (value.img) {
      node.setImage(decodeURIComponent(value.img));
      node.a("img", decodeURIComponent(value.img));
    }
    node.a("show", value.show || "show");
    node.a("showRule", {
      showTag: value.showTag,
      ruleType: value.ruleType,
      rule: value.rule,
      ruleOne: value.ruleOne,
      logic: value.logic,
      ruleTwo: value.ruleTwo,
    });
    publicDataValue(value, node);
  };
  return (
    <ScadaContext.Provider
      value={{
        queryAllTslPropertiesByGatewayID,
        queryAllDeviceDataSources,
        queryAllTslPropertiesInStation,
        queryAllEquipments,
        queryAllEquipmentVariable,
        stationID,
        equipmentID,
        system,
        enterpriseID,
        getAllMonitors,
        getAllTslProperties,
      }}
    >
      <Spin
        spinning={loading}
        style={{
          width: "100%",
          lineHeight: "calc(100vh - 160px)",
        }}
      >
        {!loading && (
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <div ref={DivRef} className={styles.canvas}></div>
          </div>
        )}
      </Spin>
      {modalVisible &&
        ["IndicatorLight", "textIndicator", "eg"].includes(values.type) && (
          <PropertyModal
            onSubmit={(value: any) => {
              propertyModalSubmit(value, data);
              value.isModal && handleModalVisible(false);
            }}
            onCancel={() => handleModalVisible(false)}
            visible={modalVisible}
            values={values}
            scadaModelID={id}
            isModal={true}
            system={system}
          />
        )}
      {modalVisible &&
        ![
          "IndicatorLight",
          "textIndicator",
          "img",
          "chart",
          "gauge",
          "barChart",
          "container",
          "pie",
          "gallery",
          "eg",
        ].includes(values.type) && (
          <GeneralModal
            onSubmit={(value: any) => {
              generalModalSubmit(value, data);
              value.isModal && handleModalVisible(false);
            }}
            onCancel={() => handleModalVisible(false)}
            visible={modalVisible}
            values={values}
            scadaModelID={id}
            isModal={true}
            queryAllViews={queryAllViews}
            queryAllVideos={queryAllVideos}
            system={system}
            stationID={stationID}
          />
        )}
      {modalVisible && values.type === "img" && (
        <ImgModal
          onSubmit={(value: any) => {
            imgModalSubmit(value, data);
            value.isModal && handleModalVisible(false);
          }}
          onCancel={() => {
            handleModalVisible(false);
          }}
          visible={modalVisible}
          values={values}
          scadaModelID={id}
          isModal={true}
        />
      )}
      {modalVisible &&
        ["chart", "gauge", "barChart", "container", "pie"].includes(
          values.type
        ) && (
          <ChartModal
            onSubmit={async (value: any) => {
              data.a("show", value.show || "show");
              data.a("showRule", {
                showTag: value.showTag,
                ruleType: value.ruleType,
                rule: value.rule,
                ruleOne: value.ruleOne,
                logic: value.logic,
                ruleTwo: value.ruleTwo,
              });
              publicDataValue(value, data);
              if (data.a("type") === "chart" || data.a("type") === "barChart") {
                data.a("chartType", value.chartType);
                data.a("chartColor", value.chartColor || "#0070cc");
                data.a("time", value.time);
                data.a("refreshTime", value.refreshTime);
                data.a("axisLabelCol", value.axisLabelCol || "#7c919b");
                data.a("chartTitle", value.chartTitle);
                data.a("legendShow", value.legendShow);
              }
              if (data.a("type") === "pie") {
                data.a("isRing", value.isRing);
              }
              if (data.a("type") === "gauge") {
                data.a("gauMin", value.gauMin);
                data.a("gauMax", value.gauMax);
                data.a("gauLinColor", value.gauLinColor || "#eee");
                data.a("noticeVal", value.noticeVal);
                data.a("warnVal", value.warnVal);
                data.a("normalCol", value.normalCol || "#ccc");
                data.a("noticeCol", value.noticeCol || "#ccc");
                data.a("warnCol", value.warnCol || "#ccc");
                data.a("linWidth", value.linWidth);
              }
              if (data.a("type") === "container") {
                data.a("conMax", Number(value.conMax));
                data.a("scaleCheck", value.scaleCheck);
                data.a("conCol", value.conCol || "#0070cc");
                data.a("conBackground", value.conBackground || "#cccccc");
                data.a("axisLabelCol", value.axisLabelCol || "#7c919b");
              }
              handleModalVisible(false);
            }}
            onCancel={() => {
              handleModalVisible(false);
              setValues({});
            }}
            visible={modalVisible}
            values={values}
            scadaModelID={id}
            system={system}
          />
        )}
      {(galleryVisible || values.type === "gallery") && (
        <Gallery
          visible={galleryVisible || modalVisible}
          onCancel={() => {
            handleGalleryVisible(false);
            handleModalVisible(false);
          }}
          onSubmit={(val) => {
            data.setWidth(data.getWidth());
            data.setHeight(data.getHeight());
            const Image = val.selectData?.getImage();
            if (typeof Image === "object" && val.selectData) {
              val.selectData?.item?.userComponentData
                ? data.setImage(
                    val.selectData?.item?.userComponentData?.split("?")[0]
                  )
                : data.setImage(
                    val.selectData?.item?.componentData?.split("?")[0]
                  );
            } else if (val.selectData) {
              data.setImage(Image);
            }
            data.a("type", val.selectData?.a("type") || val.type);
            data.a("show", val.show || "show");
            data.a("showRule", {
              showTag: val.showTag,
              ruleType: val.ruleType,
              rule: val.rule,
              ruleOne: val.ruleOne,
              logic: val.logic,
              ruleTwo: val.ruleTwo,
            });
            handleModalVisible(false);
            setValues({});
          }}
          type={modalVisible ? "use" : "editor"}
          values={values}
          scadaModelID={id}
          system={system}
          addScadaUserComponent={addScadaUserComponent}
          deleteScadaUserComponent={deleteScadaUserComponent}
          queryScadaGroups={queryScadaGroups}
          queryAllScadaUserComponents={queryAllScadaUserComponents}
          queryScadaComponents={queryScadaComponents}
          queryCurrent={queryCurrent}
        />
      )}
      {shareVisible && (
        <ShareModal
          visible={shareVisible}
          onSubmit={(v) => importData(v.url)}
          onCancel={() => setShareVisible(false)}
          values={selectModelData}
          shareType={shareType}
        />
      )}
      {pwVisible && (
        <PassWord
          scadaModelID={id}
          pwVisible={pwVisible}
          onCancel={() => handlePWVisible(false)}
          queryScadaModelPassword={queryScadaModelPassword}
          updateScadaModelPassword={updateScadaModelPassword}
        />
      )}
    </ScadaContext.Provider>
  );
};

export default Index;

import React, { useEffect, useState, useRef } from "react";
import { message, Spin } from "antd";
import request from "umi-request";
import styles from "./index.less";

interface Props {
  groupID: string;
  onSelect: (values: any) => void;
  queryScadaComponents: (values: any) => void;
}

const Palette: React.FC<Props> = (props) => {
  const { groupID, onSelect, queryScadaComponents } = props;
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // 组件面板
  const palette = new ht.widget.Palette();
  const PaletteRef = useRef();
  useEffect(() => {
    return () => (ht.Default.paletteItemSelectBackground = "");
  }, []);
  useEffect(() => {
    if (groupID) {
      setLoading(true);
      queryScadaComponents({
        groupIDs: [{ id: groupID }],
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
        setComponents(results);
        setLoading(false);
      });
    }
  }, [groupID]);
  useEffect(() => {
    if (components.length !== 0) {
      PaletteRef.current.innerHTML = "";
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
        request.get(item.componentData).then((response) => {
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
      } catch (error) {}
      node.setTag(item.tag);
      node.item = item;
      node.s({
        // 设置节点显示图片为填充的方式，这样不同比例的图片也不会因为拉伸而导致变形
        "image.stretch": item.stretch || "centerUniform",
        // 设置节点是否可被拖拽
        draggable: item.draggable === undefined ? true : item.draggable,
      });
      node.a("type", item.componentType);
      group.addChild(node);
      dm.add(node);
    });
    palette.addToDOM(PaletteRef.current);
    palette.sm().ms(() => {
      const selectedNode = palette.sm().ld();
      if (selectedNode) {
        onSelect(selectedNode);
      }
    });
    ht.Default.paletteItemSelectBackground = "rgb(221, 221, 221)";
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.right}>
        <div ref={PaletteRef} className={styles.palett}></div>
      </div>
    </Spin>
  );
};

export default Palette;

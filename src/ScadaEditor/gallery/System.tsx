import React, { useEffect, useState } from "react";
import { message, Tree } from "antd";
import arrayToTree from "array-to-tree";
import _ from "lodash";
import styles from "./index.less";
import Palette from "./Palette";

interface Props {
  onSelect: (values: any) => void;
  queryScadaGroups: (val: any) => void;
  queryScadaComponents: (val: any) => void;
}
const System: React.FC<Props> = (props) => {
  const { onSelect, queryScadaGroups, queryScadaComponents } = props;
  const [scadaGroups, setScadaGroups] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>({ key: "", title: "" });

  useEffect(() => {
    queryScadaGroups({ isBase: false }).then((rs: any) => {
      if (rs.error) {
        message.error("组件加载失败");
        return;
      }
      const { data } = rs;
      const treeData = arrayToTree(
        _.map(data.payload?.results || [], (item) => ({
          key: item.id,
          title: item.name,
          parentId: "",
        })),
        {
          parentProperty: "parentId",
          customID: "key",
        }
      );
      setScadaGroups(treeData || []);
    });
  }, []);
  useEffect(() => {
    if (!current?.key && scadaGroups.length) {
      setCurrent(scadaGroups[0]);
    }
  }, [scadaGroups]);

  const renderTree = () => {
    return (
      <Tree
        className={styles.dataTree}
        onSelect={(_, info: { selected: boolean; selectedNodes: any }) => {
          if (info.selected) {
            setCurrent(info.selectedNodes[0]);
          }
        }}
        selectedKeys={[current?.key]}
        treeData={scadaGroups}
        titleRender={(nodeData) => {
          return (
            <div style={{ display: "flex" }}>
              <span className={styles.title}>{nodeData.title}</span>
            </div>
          );
        }}
      />
    );
  };

  return (
    <div className={styles.system}>
      <div className={styles.left}>{renderTree()}</div>
      <Palette
        groupID={current.key}
        onSelect={(val: any) => onSelect(val)}
        queryScadaComponents={queryScadaComponents}
      />
    </div>
  );
};

export default System;

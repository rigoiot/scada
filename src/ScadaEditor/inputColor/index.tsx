import React, { useState } from "react";
import { SketchPicker } from "react-color";
import styles from "./inputColor.less";

interface Props {
  onChange: (values: any) => void;
  color: string;
}

const InputColor = (prop: Props) => {
  const [colorPickerVisible, setColorPickerVisible] = useState<boolean>(false);
  const { color, onChange } = prop;
  return (
    <div className={styles.colorPicker}>
      <div
        className="swatchColor"
        onClick={() => {
          setColorPickerVisible(!colorPickerVisible);
        }}
      >
        <div
          className={styles.color}
          style={{ background: color, width: "100%" }}
        />
      </div>
      {colorPickerVisible ? (
        <div className={styles.popover} id="popover">
          <div
            className={styles.cover}
            onClick={() => {
              setColorPickerVisible(false);
            }}
          />
          <SketchPicker
            color={color}
            onChange={onChange}
            width={255}
            presetColors={[]}
          />
        </div>
      ) : null}
    </div>
  );
};
export default InputColor;

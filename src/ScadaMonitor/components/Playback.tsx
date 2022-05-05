import React, { useState, useEffect } from "react";
import { Button, Modal, message, DatePicker } from "antd";
import EZUIKit from "ezuikit-js";
import request from "umi-request";
import moment from "moment";
import IconFont from "../../IconFont";
import { PlayCircleOutlined } from "@ant-design/icons";
import styles from "./Playback.less";

interface Props {
  video: any;
  visible: boolean;
  onCancel: () => void;
  accessToken: string;
}

const Playback = (props: Props) => {
  const { video, visible, onCancel, accessToken } = props;
  const [playing, setPlaying] = useState<boolean>(false);
  const [url, setUrl] = useState<string>();
  const [playTime, setPlayTime] = useState<any>(moment());
  const playVideo = () => {
    new EZUIKit.EZUIKitPlayer({
      id: "myVideo",
      accessToken,
      url,
      template: "security",
      autoplay: true,
      audio: 1,
      width: document.getElementById("myVideo")?.clientWidth,
      height: 500,
    });
  };

  // 获取播放地址
  const getVideoUrl = () => {
    if (accessToken) {
      request("https://open.ys7.com/api/lapp/v2/live/address/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          accessToken,
          deviceSerial: video.serialNumber || video.deviceSerial,
          channelNo: video.channelNo,
          startTime: playTime
            .set({ minute: 0, second: 0 })
            ?.format("YYYY-MM-DD HH:mm:ss"),
          stopTime: playTime
            .set({ minute: 59, second: 59 })
            ?.format("YYYY-MM-DD HH:mm:ss"),
          quality: 1,
          type: 2,
        },
      }).then((response) => {
        if (response.code !== "200") {
          message.error(`萤石云服务异常(${response.msg})`);
        } else {
          setUrl(response.data?.url);
          setPlaying(false);
          document.getElementById("myVideo").innerHTML = "";
        }
      });
    }
  };

  useEffect(() => {
    console.log(video);
    if (playTime && accessToken && video) {
      getVideoUrl();
    }
  }, [playTime, accessToken, video]);

  const disabledDate = (current: any) => {
    return current && current > moment();
  };

  return (
    <Modal
      title={video?.name}
      width={800}
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      maskClosable={false}
      style={{ top: "30px" }}
    >
      <div className={styles.video} id="myVideo" />
      <div className={styles.backFooter}>
        <DatePicker
          showTime
          disabledDate={disabledDate}
          defaultValue={moment(playTime, "YYYY-MM-DD HH")}
          format="YYYY-MM-DD HH:00"
          allowClear={false}
          onChange={(val) => setPlayTime(val)}
        />
        <Button
          type="primary"
          disabled={!playTime}
          style={{ margin: "0 10px" }}
          icon={
            playing ? <IconFont type="icon-tingzhi" /> : <PlayCircleOutlined />
          }
          onClick={() => {
            if (playing) {
              document.getElementById("myVideo").innerHTML = "";
            } else {
              playVideo();
            }
            setPlaying(!playing);
          }}
        >
          {playing ? "停止" : "播放"}
        </Button>
      </div>
    </Modal>
  );
};
export default Playback;

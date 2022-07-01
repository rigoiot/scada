import React, { useRef, useEffect, useState } from "react";
import { message, Spin } from "antd";
import request from "umi-request";
import styles from "./index.less";
import Hls from "hls.js";
import EZUIKit from "ezuikit-js";
import moment from "moment";
import resizeEvent from "element-resize-event";
import PasswordModal from "./components/PasswordModal";
import ShareModal from "./components/ShareModal";
import WriteForm from "./components/WriteForm";
import Playback from "./components/Playback";
import {
  SyncOutlined,
  ExpandAltOutlined,
  ShrinkOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import playIcon from "../asset/play.png";
import pauseIcon from "../asset/pause.png";
import playBack from "../asset/playBack.png";
import { ScadaMonitorProps } from "./data";

const ScadaMonitor = (props: ScadaMonitorProps) => {
  const {
    videoToken,
    scadaModelID,
    subscribeID,
    cacheKey,
    status,
    isShare = true,
    isRefresh = true,
    isFull = true,
    isPannable = true,
    isScroll = true,
    isExit = true,
    isFullRefresh = false,
    view,
    viewLoading,
    views,
    queryDevicePropertiesDataReq,
    setDeviceThingProperty,
    subscribeProperty,
    verifyScadaModelPassword,
    queryAllNowProperties,
    queryVideo,
    queryView,
    queryAccountWeChatConf,
    queryAllDeviceAkiras,
  } = props;
  const DivRef = useRef();
  const [dataModel] = useState(new ht.DataModel());
  const g2d = new ht.graph.GraphView(dataModel);
  const [data, setData] = useState<string>();
  const [tslPropertyNodes, setTslPropertyNodes] = useState<any>();
  const [propertys, setPropertys] = useState<any>({});
  const [chartNodes, setChartNodes] = useState<any>([]);
  const [timeNodes, setTimeNodes] = useState<any>();
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [shareVisible, setShareVisible] = useState<boolean>(false);
  const [writeVisible, setWriteVisible] = useState<boolean>(false);
  const [buttonLoading, setButtonLoading] = useState<string>("");
  const [value, setValue] = useState<any>({});
  const [tabSwitch, setTabSwitch] = useState<string>("");
  const [playbackVisible, setPlaybackVisible] = useState<boolean>(false);
  const [video, setVideo] = useState<any>();
  const [onDownLoading, setOnDownLoading] = useState<boolean>(true);
  const [onUpData, setOnUpData] = useState<any>();
  const subProps = useRef<any>();
  const g2dRef = useRef<any>();
  const hlsRef = useRef<any>([]);
  const pageTimerRef = useRef({});

  // iframe
  ht.Default.setImage("iframe", {
    pixelPerfect: false,
    scrollable: true,
    interactive: true,
    renderHTML: (data, gv, cache)=> {
      const dataType=data.a("type");
      if (!cache.htmlView) {
        const div = cache.htmlView = document.createElement("div"),
          iframe = cache.iframe = document.createElement(["textIndicator","img"].includes(dataType)?"img":"iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        div.appendChild(iframe);
        div.style.position = "absolute";
        div.layoutHTML =()=>gv.layoutHTML(data, div, true);
      }
      const url =dataType=== "textIndicator"?data.a("img")|| data.a("textData")[0]?.label:dataType=== "img"?data.a("img"):data.a("iframeUrl");
      if (url && url !== cache.url) {
        cache.iframe.src = cache.url = url;
      }
      return cache.htmlView;
    },
    comps: [],
  });

  useEffect(() => {
    message.config({
      getContainer: () => document.getElementById("canvas"),
    });
    return () => {
      for (const each in pageTimerRef.current) {
        clearInterval(pageTimerRef.current[each]);
      }
      subProps.current?.unsubscribe();
      hlsRef.current?.forEach((rs: any) => {
        rs.destroy();
        rs = null;
      });
      message.destroy();
      message.config({
        getContainer: () => document.body,
      });
      localStorage.removeItem(cacheKey);
      document.getElementById("canvas")&& resizeEvent?.unbind(document.getElementById("canvas"), () => { });
    };
  }, []);

  // 按钮按下事件结束后执行抬起事件
  useEffect(() => {
    if (onUpData && onDownLoading) {
      buttonEvent(onUpData);
      setOnUpData(undefined);
    }
  }, [onUpData, onDownLoading]);

  useEffect(() => setModelLoading(viewLoading), [viewLoading]);

  useEffect(() => {
    if (subProps.current) {
      subProps.current?.unsubscribe();
    }
    hlsRef.current.forEach((rs: any) => rs.loadSource(""));
    for (const each in pageTimerRef.current) {
      clearInterval(pageTimerRef.current[each]);
    }
    view && getDataAndProperty(view.modelData, view.modelProperty);
  }, [view.id]);

  // 获取数据及property
  const getDataAndProperty = (modelDataUrl: string, propertysUrl: string) => {
    if (modelDataUrl) {
      request.get(modelDataUrl).then((response) => {
        setData(response);
        propertysUrl &&
          request.get(propertysUrl).then((response) => {
            try {
              setPropertys(JSON.parse(response));
            } catch (error) {
              setPropertys(response);
            }
          });
      });
    } else {
      setData("");
      setPropertys("");
    }
  };

  // data变化
  useEffect(() => {
    dataModel.clear();
    dataModel.setBackground(undefined);
    initEditor();
  }, [data, videoToken]);

  // 数据
  useEffect(() => {
    if (subProps.current) {
      subProps.current?.unsubscribe();
    }
    if (propertys && tslPropertyNodes) {
      let temNodes: any[] = [];
      tslPropertyNodes.forEach((element: any) => temNodes.push(element));
      dataModel
        .toDatas((data: any) => {
          return data.getTag() && data.getTag().indexOf("block") !== -1;
        })
        ?.forEach((rs) => {
          if (rs.s("2d.visible")) {
            rs.getParent().a("show") === "ruleShow" &&
              temNodes.push(rs.getParent());
            rs.getChildren().forEach((res: any) => {
              if (
                (res.a("type") !== "chart" && res.a("type") !== "barChart") ||
                res.a("show") === "ruleShow"
              ) {
                temNodes.push(res);
              }
            });
          }
        });
      const temArr: any[] = [];
      const temVoltageShock: any[] = [];
      for (const val in propertys) {
        temNodes?.forEach((element: any) => {
          if (
            element.getTag() === val ||
            element.a("showRule")?.showTag === val
          ) {
            element.a("showRule")?.showTag === val
              ? element.a("showRuleTslProperty", propertys[val])
              : element.a("tslProperty", propertys[val]);
            if (
              (element.a("type")==="voltageShock"?temVoltageShock:temArr).findIndex(
                (ie) => ie.deviceID === propertys[val].deviceId
              ) !== -1
            ) {
              if (
                (element.a("type")==="voltageShock"?temVoltageShock:temArr)
                  .find((ie) => ie.deviceID === propertys[val].deviceId)
                  ?.identifiers?.indexOf(propertys[val]?.identifier) === -1
              ) {
                (element.a("type")==="voltageShock"?temVoltageShock:temArr)
                  .find((ie) => ie.deviceID === propertys[val].deviceId)
                  ?.identifiers?.push(propertys[val].identifier);
                  (element.a("type")==="voltageShock"?temVoltageShock:temArr)
                  .find((ie) => ie.deviceID === propertys[val].deviceId)
                  ?.tslPropertyIDs?.push(propertys[val].tslPropertyId);
              }
            } else if (propertys[val].deviceId) {
              (element.a("type")==="voltageShock"?temVoltageShock:temArr).push({
                deviceID: propertys[val].deviceId,
                identifiers: [propertys[val].identifier],
                tslPropertyIDs:[propertys[val].tslPropertyId],
              });
            }
          }
        });
      }
      if(temVoltageShock.length !== 0){
          getAllDeviceAkiras({current:1,did:temVoltageShock[0]?.deviceID},temNodes);
      }
      if(temArr.length !== 0) {
        const nvTemNodes=temNodes.filter(i=>i.a("type")!=="voltageShock");
        status &&
        queryAllNowProperties(temArr.map(i=>({...i,tslPropertyIDs:undefined}))).then((rs) => {
          const { data } = rs;
          updateEditor(data.payload?.results, nvTemNodes);
        }).catch(()=>{
          queryAllNowProperties(temArr.map(i=>({...i,identifiers:undefined}))).then((rs) => {
            const { data } = rs;
            updateEditor(data.payload?.results, nvTemNodes);
          });
        });
        subProps.current = subscribeProperty({
          id: subscribeID,
          req: temArr.map(i=>({...i,tslPropertyIDs:undefined})),
        }).subscribe((response) => {
          const { data } = response;
          updateEditor(data.payload?.results, nvTemNodes);
        },(e)=>{
          if(e.message?.includes("identifiers")){
            subProps.current = subscribeProperty({
              id: subscribeID,
              req: temArr.map(i=>({...i,identifiers:undefined})),
            }).subscribe((response) => {
              const { data } = response;
              updateEditor(data.payload?.results, nvTemNodes);
            });
          }
        });
      }
    }
  }, [propertys, tslPropertyNodes, tabSwitch]);

  // 晃电记录
  const getAllDeviceAkiras=(val:{current:number,did:string},nodes:any[])=>{
    const vTemNodes=nodes.filter(i=>i.a("type")==="voltageShock");
    queryAllDeviceAkiras({pageSize:1,...val}).then(rs=>{
      const {data,total}=rs;
      const temData=data[0]?.data?.map((item: any)=>({...item,deviceID:data[0]?.deviceID}));
      updateEditor(temData, vTemNodes);
      nodes.forEach(res=>{
        switch (res.getTag()){
          case "total":
            res.s("text", total);
            break;
          case "currentPage":
              res.s("text", total?val.current:0);
            break;
          case "nextPage":
            res.s("interactive", true);
            res.s(
              "onDown",
              function () {
                val.current<total&&getAllDeviceAkiras({current:val.current+1,did:val.did},nodes);
              }
            );
            break;
            case "previousPage":
            res.s("interactive", true);
            res.s(
              "onDown",
              function () {
                val.current>1&&getAllDeviceAkiras({current:val.current-1,did:val.did},nodes);
              }
            );
            break;
        }
      })
    });
  }

  // 曲线
  useEffect(() => {
    for (const each in pageTimerRef.current) {
      clearInterval(pageTimerRef.current[each]);
    }
    // 曲线
    if (Object.keys(propertys).length !== 0) {
      const pageTimer = {};
      let temNodes: any[] = [];
      chartNodes.forEach((element: any) => temNodes.push(element));
      dataModel
        .toDatas((data: any) => {
          return data.getTag() && data.getTag().indexOf("block") !== -1;
        })
        ?.forEach((rs) => {
          if (rs.s("2d.visible")) {
            rs.getChildren().forEach((res: any) => {
              if (res.a("type") === "chart" || res.a("type") === "barChart") {
                temNodes.push(res);
              }
            });
          }
        });
      for (const val in propertys) {
        temNodes?.forEach((element: any) => {
          if (element.getTag() === val) {
            element.a("tslProperty", propertys[val]);
            if (Array.isArray(propertys[val])) {
              const map = {},
                dest: any[] = [];
              const propertysArr: any[] = [];
              const obj: any[] = [];
              propertys[val].forEach((rs: any) => {
                obj.indexOf(rs.tslPropertyName) === -1 &&
                  propertysArr.push.apply(
                    propertysArr,
                    propertys[val]
                      .filter((i: any) => {
                        if (rs.tslPropertyName === i.tslPropertyName) {
                          obj.push(i.tslPropertyName);
                          return i;
                        }
                      })
                      .map((r: any, index: any) => {
                        return {
                          ...r,
                          tslPropertyName: index
                            ? r.tslPropertyName + `(${index})`
                            : r.tslPropertyName,
                        };
                      })
                  );
              });
              for (let i = 0; i < propertysArr.length; i++) {
                const tem = propertysArr[i];
                if (!map[tem.deviceId]) {
                  dest.push({
                    deviceId: tem.deviceId,
                    identifier: [tem.identifier],
                    tslPropertyIDs: [tem.tslPropertyId],
                    data: [tem],
                  });
                  map[tem.deviceId] = tem;
                } else {
                  for (let j = 0; j < dest.length; j++) {
                    const dj = dest[j];
                    if (dj.deviceId == tem.deviceId) {
                      dj.identifier.push(tem.identifier);
                      dj.tslPropertyIDs.push(tem.tslPropertyId);
                      dj.data.push(tem);
                      break;
                    }
                  }
                }
              }
              if (element.a("type") === "chart") {
                const pollInterval = element.a("refreshTime") * 60 * 1000;
                queryPropertiesDataReq(dest, element);
                pageTimer[element.getTag()] = setInterval(() => {
                  queryPropertiesDataReq(dest, element);
                }, pollInterval);
                pageTimerRef.current = pageTimer;
              } else if (element.a("type") === "pie") {
                const temArr = dest.map((rs) => {
                  return {
                    deviceID: rs?.deviceId,
                    identifiers: rs?.identifier,
                  };
                });
                queryAllNowProperties(temArr).then((rs) => {
                  if (rs.error) {
                    return;
                  }
                  const { data } = rs;
                  const resultArr: any[] = [];
                  propertysArr.forEach((item) => {
                    const temObj = data?.payload?.results?.filter(
                      (rs: any) =>
                        rs.deviceID === item.deviceId &&
                        rs.identifier === item.identifier
                    )[0];
                    resultArr.push({
                      name: item?.tslPropertyName,
                      value: temObj?.value,
                    });
                  });
                  element.a("pieData", resultArr);
                });
              }
            } else {
              const { startTime, stopTime, pattern } = queryPropertiesDataTime(
                element
              );
              queryDevicePropertiesDataReq({
                deviceId: propertys[val]?.deviceId,
                identifiers: [propertys[val]?.identifier],
                startTime: startTime,
                stopTime: stopTime,
                pattern,
              }).then((res) => {
                const {
                  data: {
                    queryDevicePropertiesData: { propertyDataInfos },
                  },
                } = res;
                const times: any[] = [];
                const values: number[] = [];
                if (element.a("time") === "1h") {
                  propertyDataInfos[0].points?.reverse();
                }
                propertyDataInfos[0].points?.forEach(
                  (rs: { time: string; value: number }) => {
                    times.push(moment(rs.time).format("MM-DD HH:mm:ss"));
                    values.push(rs.value);
                  }
                );
                element.a("xAxisData", times);
                element.a("dataset", {
                  data: values,
                  color: element.a("chartColor"),
                  type: "bar",
                });
              });
            }
          }
        });
      }
    }
  }, [propertys, chartNodes, tabSwitch]);

  // 多曲线时间
  const queryPropertiesDataTime = (element: any) => {
    let pattern = "raw",
      startTime = moment().subtract(1, "h").toDate(),
      stopTime = moment().toDate();
    switch (element.a("time")) {
      case "1h":
        pattern = "raw";
        startTime = moment().subtract(1, "h").toDate();
        break;
      case "12h":
        pattern = "minute";
        startTime = moment().subtract(12, "h").toDate();
        break;
      case "1d":
        pattern = "minute";
        startTime = moment().subtract(1, "d").toDate();
        break;
      case "7d":
        pattern = "hour";
        startTime = moment().subtract(7, "d").toDate();
        break;
      case "1M":
        pattern = "hour";
        startTime = moment().subtract(1, "M").toDate();
        break;
    }
    return { startTime, stopTime, pattern };
  };
  // 多曲线
  const queryPropertiesDataReq = (dest: any[], element: any) => {
    const { startTime, stopTime, pattern } = queryPropertiesDataTime(element);
    const temVal: any[] = [];
    dest.forEach((item) => {
      queryDevicePropertiesDataReq({
        deviceId: item?.deviceId,
        identifiers: item?.identifier,
        startTime: startTime,
        stopTime: stopTime,
        pattern,
      }).then((res) => {
        const {
          data: {
            queryDevicePropertiesData: { propertyDataInfos },
          },
        } = res;
        const nullDataList = item.data?.filter(
          (item: { identifier: string }) => {
            let arrList = propertyDataInfos.map(
              (it: { identifier: string }) => it.identifier
            );
            return !arrList.includes(item.identifier);
          }
        );
        let temArr = propertyDataInfos.concat(nullDataList);
        const times: any[] = [];
        temArr.forEach((i: any) => {
          item.data.forEach((j: any) => {
            if (i.identifier === j.identifier) {
              i.chartColor = j.chartColor;
              const values: any[] = [];
              if (element.a("time") === "1h") {
                i.points?.reverse();
              }
              i.points?.forEach((rs: { time: string; value: number }) => {
                times.length !== i.points.length &&
                  times.push(moment(rs.time).format("MM-DD HH:mm:ss"));
                values.push({
                  value: Number(
                    ((rs.value && rs.value * j.chartNum) || 0).toFixed(3)
                  ),
                  chartNum: j.chartNum,
                });
              });
              element.a("xAxisData", times);
              temVal.push({
                name: j.deviceNickname
                  ? `${j.deviceNickname}-${j.tslPropertyName}`
                  : j.tslPropertyName,
                data: values,
                color: j.chartColor,
                type: element.a("chartType") === "bar" ? "bar" : "line",
                smooth: element.a("chartType") === "smooth" ? true : false,
                areaStyle: element.a("chartType") === "area" ? {} : null,
                step: element.a("chartType") === "hv" ? true : false,
                markLine: j.markLine?.markNum
                  ? {
                    label: {
                      formatter: j.markLine?.markData || j.markLine?.markNum,
                      position: j.markLine?.markPosition || "insideEndTop",
                    },
                    lineStyle: {
                      color: j.markLine?.markColor || "#FF0000",
                    },
                    data: [
                      {
                        yAxis: j.markLine?.markNum,
                      },
                    ],
                  }
                  : false,
              });
              element.a("dataset", temVal);
            }
          });
        });
      });
    });
  };

  // 时间组件
  useEffect(() => {
    const timeTimer: any[] = [];
    if (timeNodes && timeNodes.length !== 0) {
      timeNodes.forEach((res: any) => {
        const temnterval = setInterval(() => {
          let temDateFormat = res
            .a("dateFormat")
            .replace(/-/g, res.a("dateSeparator"));
          if (res.a("dateSeparator") === "年月日") {
            switch (res.a("dateFormat").substr(0, 2)) {
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
          const date = res.a("dateCheck")
            ? moment(new Date()).format(temDateFormat)
            : "";
          const week = res.a("weekCheck")
            ? "周" + "日一二三四五六".charAt(new Date().getDay())
            : "";
          const time = res.a("timeCheck")
            ? moment(new Date()).format(res.a("timeFormat"))
            : "";
          res.a("date", `${date} ${week} ${time}`);
        }, 1000);
        timeTimer.push(temnterval);
      });
    }
    return () => timeTimer.forEach((item) => clearInterval(item));
  }, [timeNodes]);

  // 按钮、开关事件
  const buttonEvent = (req: any) => {
    const passwordChecked = req.passwordChecked;
    const temPassword = localStorage.getItem(cacheKey);
    if (!passwordChecked || temPassword) {
      setDTProperty(req);
    } else {
      setVisible(true);
      setValue(req);
    }
  };
  const setDTProperty = async (req: any) => {
    if (req.data) {
      req.data.a("value", req.params[Object.keys(req.params)[0]]);
    }
    return await setDeviceThingProperty({
      id: req.id,
      params: req.params,
    }).then((rs) => {
      if (rs.error || rs.errors) {
        message.error("系统异常");
        return false;
      }
      const {
        data: {
          payload: { results },
        },
      } = rs;
      if (req.data) {
        req.data.a("value", results && results[0]?.value);
      }
      setOnDownLoading(true);
      message.success("执行成功");
      return true;
    });
  };
  // 密码验证
  const ScadaModelPassword = (val: any) => {
    setButtonLoading("pmLoading");
    verifyScadaModelPassword({
      id: scadaModelID,
      ...val,
    }).then((rs) => {
      if (rs.error) {
        rs.error === "NotMatch"
          ? message.error("密码不正确")
          : message.error("系统异常");
        setButtonLoading("");
        return;
      } else {
        localStorage.setItem(cacheKey, val.password);
        setTimeout(() => localStorage.removeItem(cacheKey), 60000);
        if (value.identifier) {
          setWriteVisible(true);
        } else if (value.data.a("type") === "viewBtn") {
          viewBtnEvent(value);
        } else {
          setDTProperty(value);
          setValue({});
        }
        setButtonLoading("");
        setVisible(false);
      }
    });
  };

  // 画面切换
  const viewBtnEvent = (val: any) => {
    const { data, view } = val;
    data.s("background", data.a("selBag") || "#0070cc");
    view.dm().toDatas((item: any) => {
      if (item.a("type") === "viewBtn" && item.getTag() !== data.getTag()) {
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
    setTabSwitch(data.getTag());
    setValue({});
  };

  // 写值
  const writeEvent = async (val: { write: number }) => {
    setButtonLoading("wfLoading");
    const result = await setDTProperty({
      ...value,
      params: { [value.identifier]: val.write },
    });
    setButtonLoading("");
    if (result) {
      setWriteVisible(false);
      setValue({});
    }
  };

  // 视频播放
  const videoPlay = (
    div: any,
    videoSrc: string,
    validity: number,
    type: string,
    screenshot?: string
  ) => {
    const img = document.createElement("img");
    img.src = pauseIcon;
    img.className = styles.videoImg;
    div.appendChild(img);
    if (type === "url") {
      const video = document.createElement("video");
      video.style.cssText = "height:100%;width:100%";
      video.muted = true;
      video.poster = screenshot || "";
      div.appendChild(video);
      if (Hls.isSupported() && videoSrc) {
        const hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        hlsRef.current.push(hls);
        let timeOut = setTimeout(() => {
          hls.loadSource("");
          img.src = playIcon;
        }, validity * 1000);
        img.onclick = () => {
          if (video.paused) {
            hls.loadSource(videoSrc);
            img.src = pauseIcon;
            timeOut = setTimeout(() => {
              hls.loadSource("");
              img.src = playIcon;
            }, validity * 1000);
          } else {
            hls.loadSource("");
            img.src = playIcon;
            timeOut && clearTimeout(timeOut);
          }
        };
      } else if (
        video.canPlayType("application/vnd.apple.mpegurl") &&
        videoSrc
      ) {
        video.src = videoSrc;
        video.addEventListener("loadedmetadata", function () {
          video.play();
        });
      }
    } else {
      playVideo(videoSrc, div, img, validity);
    }
  };
  // 萤石云视频播放
  const playVideo = (val: string, div: any, img: any, validity: number) => {
    let playing = true;
    const temPlayer = new EZUIKit.EZUIKitPlayer({
      id: div.id,
      accessToken: videoToken,
      url: val,
      template: "simple",
      autoplay: true,
      audio: 1,
      width: div.clientWidth,
      height: div.clientHeight,
      handleError: () => {
        playing = false;
        img.src = playIcon;
      },
      handleSuccess: () => {
        playing = true;
        img.src = pauseIcon;
      },
    });
    let timeOut = setTimeout(() => {
      temPlayer?.stop();
      playing = false;
      img.src = playIcon;
    }, validity * 1000);
    img.onclick = () => {
      if (playing) {
        temPlayer?.stop();
        playing = false;
        img.src = playIcon;
        timeOut && clearTimeout(timeOut);
      } else {
        temPlayer.play({
          url: val,
        });
        playing = true;
        img.src = pauseIcon;
        timeOut = setTimeout(() => {
          temPlayer?.stop();
          playing = false;
          img.src = playIcon;
        }, validity * 1000);
      }
    };
  };

  // 获取萤石云视频地址
  const getVideoUrl = async (video: any) => {
    const temData = await request(
      "https://open.ys7.com/api/lapp/v2/live/address/get",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        params: {
          accessToken: videoToken,
          deviceSerial: video.serialNumber || video.deviceSerial,
          channelNo: video.channelNo,
          protocol: 1,
          quality: 1,
        },
      }
    );
    if (temData.code !== "200") {
      message.error(`萤石云服务异常(${temData.msg})`);
    } else {
      return temData.data?.url;
    }
  };

  // 画面渲染
  const initEditor = () => {
    hlsRef.current?.forEach((rs: any) => {
      rs.destroy();
      rs = null;
    });
    hlsRef.current = [];
    DivRef.current.innerHTML = "";
    if (data) {
      dataModel.deserialize(data);
    } else {
      dataModel.setBackground(undefined);
      dataModel.clear();
    }

    setChartNodes(
      dataModel.toDatas((data: any) => {
        if (["chart", "barChart", "pie"].indexOf(data.a("type")) !== -1) {
          data.a("img").renderHTML = new Function(
            "return " + data.a("img").renderHTML
          )();
          data.setImage(data.a("img"));
          return !data.getParent() && data;
        }
      })
    );
    dataModel.toDatas((data: any) => {
      if (data.a("type") === "container") {
        data.a("img").renderHTML = new Function(
          "return " + data.a("img").renderHTML
        )();
        data.setImage(data.a("img"));
      }
    });
    dataModel.toDatas((data: any) => {
      if (data.a("type") === "pie") {
        data.a("img").renderHTML = new Function(
          "return " + data.a("img").renderHTML
        )();
        data.setImage(data.a("img"));
      }
    });
    setTimeNodes(
      dataModel
        .toDatas((data: any) => {
          return data.a("type") === "time";
        })
        .toList()
    );

    dataModel
      .toDatas((data: any) => {
        return data.a("type") === "iframe";
      })
      ._as.filter((res: string) => {
        return res !== undefined;
      })
      .forEach((item: any) => {
        if (item.a("iframeUrl")) {
          item.setImage("iframe");
        }
      });
    dataModel
      .toDatas((data: any) => {
        return data.a("type") === "viewHandle";
      })
      .forEach((rs) => {
        rs.s("onDown", function (event, data, view, point, width, height) {
          handleView(data);
        });
      });
    dataModel
      .toDatas((data: any) => {
        return data.a("type") === "video";
      })
      ._as.filter((res: string) => {
        return res !== undefined;
      })
      .forEach(async (item: any, index: number) => {
        if (item.a("video")) {
          const node = new ht.HtmlNode();
          node.setWidth(item.getWidth());
          node.setHeight(item.getHeight());
          node.setPosition(item.getPosition());
          node.a("show", item.a("show"));
          node.a("showRule", item.a("showRule"));
          node.setParent(item.getParent());
          const div = document.createElement("div");
          div.id = index + "video";
          div.className = styles.divImg;
          div.style.cssText = `position:relative;height:${
            item.getHeight() + "px"
            };width:${item.getWidth() + "px"};background:#000`;
          node.setHtml(div);
          dataModel.remove(item);
          dataModel.add(node);
          const validity = item.a("validity");
          if (item.a("video").videoID || item.a("video").id) {
            const backImg = document.createElement("img");
            backImg.src = playBack;
            backImg.className = styles.backImg;
            div.appendChild(backImg);
            queryVideo(item.a("video").videoID || item.a("video").id).then(
              (rs) => {
                const {
                  data: { payload },
                } = rs;
                backImg.onclick = () => {
                  setPlaybackVisible(true);
                  setVideo(payload);
                };
                if (payload?.videoURL) {
                  videoPlay(
                    div,
                    payload?.videoURL,
                    validity,
                    "url",
                    payload?.screenshot
                  );
                } else {
                  getVideoUrl(payload).then((url) =>
                    videoPlay(div, url, validity, "EZUIKit", videoToken)
                  );
                }
              }
            );
          } else {
            videoPlay(div, item.a("video").videoURL, validity, "url");
          }
        }
      });
    dataModel
      .toDatas((data: any) => data.a("type") === "viewBtn")
      .forEach((rs) => {
        rs.s("onDown", function (event: any, data: any, view: any) {
          const temPassword = localStorage.getItem(cacheKey);
          if (data.a("passwordChecked") && !temPassword) {
            setVisible(true);
            setValue({ data, view });
          } else {
            viewBtnEvent({ data, view });
          }
        });
      });
    dataModel
      .toDatas((data: any) => data.a("show") === "ruleShow")
      .forEach((rs) => rs.s("2d.visible", false));
    setTslPropertyNodes(
      dataModel
        .toDatas((data: any) => {
          return (
            (!data.getParent() &&
              data.getTag() !== undefined &&
              ["chart", "barChart", "pie"].indexOf(data.a("type")) === -1) ||
            data.a("show") === "ruleShow"
          );
        })
        .toList()
    );
    ht.Style["select.color"] = "rgba(26,188,156,0)";
    if (dataModel.getDataByTag("background")) {
      const bagNode = dataModel.getDataByTag("background");
      if (!bagNode.a("img")) {
        dataModel.setBackground(bagNode.s("background") || "#fff");
        bagNode.s("opacity", 0);
      }
    } else {
      dataModel.setBackground("#fff");
    }
    g2d.addToDOM(DivRef.current);
    resizeEvent(document.getElementById("canvas"), () => {
      g2d.fitContent(false, 0);
    });
    handleChangeG2d();
  };
  // 画面自适应
  const handleChangeG2d = () => {
    g2d.enableDashFlow();
    g2d.isMovable = () => false;
    g2d.fitContent(false, 0);
    g2d.setPannable(isPannable);
    !isScroll && (g2d.handleScroll = function () { });
    // 监听退出全屏
    document.addEventListener("fullscreenchange", function (event) {
      const canvasFull = document.getElementById("canvasFull");
      const canvasExit = document.getElementById("canvasExit");
      g2d.fitContent(false, 0);
      if (document.fullscreen) {
        canvasFull ? (canvasFull.style.display = "none") : null;
        canvasExit ? (canvasExit.style.display = "block") : null;
      } else {
        canvasFull ? (canvasFull.style.display = "block") : null;
        canvasExit ? (canvasExit.style.display = "none") : null;
      }
    });
    g2dRef.current = g2d;
  };

  // 画面切换
  const handleView = (node: any) => {
    const viewId = node.a("viewId");
    const viewTag = node.a("viewTag");
    const temView = views.find((rs) => rs.tag === viewTag || rs.id === viewId);
    temView && getDataAndProperty(temView?.modelData, temView?.modelProperty);
  };

  // 实时更改数据
  const updateEditor = (
    data: {
        identifier?: string;
        deviceID: string;
        value: any;
        tslPropertyID?:string;
      }[],
    arrNodes: any[]
  ) => {
    data?.forEach(
      (rs: { identifier?: any; deviceID: any; value: any ,tslPropertyID?:string}) => {
        arrNodes?.forEach((model: any) => {
          if (
           (model.a("tslProperty")?.identifier === rs.identifier||model.a("tslProperty")?.tslPropertyId === rs.tslPropertyID) &&
            model.a("tslProperty")?.deviceId === rs.deviceID
          ) {
            if (model.a("JSFunc") && model.a("JSFuncCheck")) {
              const func = new Function("return " + model.a("JSFunc"));
              model.a("value", func()(Number(rs.value)));
            } else {
              model.a("value", Number(rs.value));
            }
            switch (model.a("type")) {
              case "button":
                model.s("interactive", true);
                if (model.a("pwSet") === "reset") {
                  model.s(
                    "onDown",
                    function (event, data, view, point, width, height) {
                      setOnDownLoading(false);
                      buttonEvent({
                        data: data,
                        id: model.a("tslProperty")?.deviceId,
                        params: {
                          [model.a("tslProperty")?.identifier]: model.a(
                            "downButVal"
                          ),
                        },
                      });
                    }
                  );
                  model.s(
                    "onUp",
                    function (event, data, view, point, width, height) {
                      setOnUpData({
                        data: data,
                        id: model.a("tslProperty")?.deviceId,
                        params: {
                          [model.a("tslProperty")?.identifier]: model.a(
                            "upButVal"
                          ),
                        },
                      });
                    }
                  );
                } else {
                  model.s(
                    "onDown",
                    function (event, data, view, point, width, height) {
                      if (model.a("pwSet") === "wSet") {
                        let val = rs.value;
                        switch (model.a("perform")) {
                          case "add":
                            val = Number(rs.value) + model.a("wButVal");
                            break;
                          case "sub":
                            val = Number(rs.value) - model.a("wButVal");
                            break;
                          default:
                            val = model.a("wButVal");
                            break;
                        }
                        buttonEvent({
                          data: data,
                          passwordChecked: model.a("passwordChecked"),
                          id: model.a("tslProperty")?.deviceId,
                          params: {
                            [model.a("tslProperty")?.identifier]: val,
                          },
                        });
                      } else {
                        buttonEvent({
                          data: data,
                          passwordChecked: model.a("passwordChecked"),
                          id: model.a("tslProperty")?.deviceId,
                          params: {
                            [model.a("tslProperty")?.identifier]:
                              model.a("butVal") === "!"
                                ? Number(!Number(rs.value))
                                : model.a("butVal"),
                          },
                        });
                      }
                    }
                  );
                }
                break;
              case "switch":
                model.s(
                  "onDown",
                  function (event, data, view, point, width, height) {
                    buttonEvent({
                      data: data,
                      passwordChecked: data.a("passwordChecked"),
                      id: model.a("tslProperty")?.deviceId,
                      params: {
                        [model.a("tslProperty")?.identifier]: Number(
                          !Number(rs.value)
                        ),
                      },
                    });
                  }
                );
                break;
              case "dataBind":
                if (model.a("RW") === "W") {
                  model.s("interactive", true);
                  model.s(
                    "onDown",
                    function (event, data, view, point, width, height) {
                      setValue({
                        data: data,
                        passwordChecked: data.a("passwordChecked"),
                        id: model.a("tslProperty")?.deviceId,
                        identifier: model.a("tslProperty")?.identifier,
                        title: model.a("tslProperty")?.name,
                      });
                      const temPassword = localStorage.getItem(cacheKey);
                      if (data.a("passwordChecked") && !temPassword) {
                        setVisible(true);
                      } else {
                        setWriteVisible(true);
                      }
                    }
                  );
                }
                break;
              case "flow":
                if (
                  model.a("flowRule") &&
                  model.a("flowRuleNum") !== undefined
                ) {
                  model.s(
                    "shape.dash.flow",
                    eval(
                      rs.value + model.a("flowRule") + model.a("flowRuleNum")
                    )
                  );
                }
                break;
              case "textIndicator":
                if (model.a("indicator") === "img") {
                  const img = model
                    .a("textData")
                    ?.map((res) => {
                      if (
                        res.condition.rule === "~"
                          ? eval(res.condition.rule + rs.value)
                          : eval(
                            rs.value + res.condition.rule + res.condition.num
                          )
                      ) {
                        return res && res.label;
                      }
                    })
                    .filter((res) => {
                      return res !== undefined;
                    })[0];
                    model.a("img",decodeURIComponent(img));
                    const suffix =img.substring(decodeURIComponent(img).lastIndexOf(".")+1);
                    model.setImage(suffix==="gif"?"iframe":decodeURIComponent(img));
                }
                break;
            }
          }
          if (
             (model.a("showRuleTslProperty")?.identifier ===
             rs.identifier||model.a("showRuleTslProperty")?.tslPropertyId ===
             rs.tslPropertyID) &&
            model.a("showRuleTslProperty")?.deviceId === rs.deviceID &&
            model.a("show") === "ruleShow"
          ) {
            const showRule = model.a("showRule");
            if (showRule.ruleType === "pRule") {
              showRule.rule === Number(rs.value)
                ? model.s("2d.visible", true)
                : model.s("2d.visible", false);
            } else {
              if (
                showRule.logic === "none"
                  ? eval(
                    Number(rs.value) +
                    showRule.ruleOne?.rule +
                    showRule.ruleOne?.num
                  )
                  : eval(
                    Number(rs.value) +
                    showRule.ruleOne?.rule +
                    showRule.ruleOne?.num +
                    showRule.logic +
                    Number(rs.value) +
                    showRule.ruleTwo?.rule +
                    showRule.ruleTwo?.num
                  )
              ) {
                model.s("2d.visible", true);
              } else {
                model.s("2d.visible", false);
              }
            }
          }
        });
      }
    );
  };

  // 刷新
  const handlerRefresh = () => {
    setModelLoading(true);
    if (view) {
      queryView({ id: view.id }).then((rs) => {
        setModelLoading(false);
        if (rs.error) {
          message.error("画面获取失败");
          return;
        }
        const {
          data: { payload },
        } = rs;
        getDataAndProperty(payload.modelData, payload.modelProperty);
      });
    }
  };
  // 全屏
  const handlerFull = () => {
    document.fullscreen
      ? document.exitFullscreen()
      : document.getElementById("canvas")?.requestFullscreen();
  };
  return (
    <div className={styles.scadaMain}>
      <Spin spinning={modelLoading}>
        <div id="canvas" className={styles.canvasMain}>
          <div id="canvasTop" className={styles.canvasTop}>
            <div id="canvasFull">
              {isShare && (
                <span
                  className={styles.scadaIcon}
                  onClick={() => setShareVisible(true)}
                >
                  <ShareAltOutlined />
                </span>
              )}
              {isRefresh && (
                <span
                  className={styles.scadaIcon}
                  onClick={() => handlerRefresh()}
                >
                  <SyncOutlined />
                </span>
              )}
              {isFull && (
                <span
                  className={styles.scadaIcon}
                  onClick={() => handlerFull()}
                >
                  <ExpandAltOutlined />
                </span>
              )}
            </div>
            <div id="canvasExit" style={{ display: "none" }}>
              {isFullRefresh && (
                <span
                  className={styles.scadaIcon}
                  onClick={() => handlerRefresh()}
                >
                  <SyncOutlined />
                </span>
              )}
              {isExit && (
                <ShrinkOutlined
                  className={styles.iconExit}
                  onClick={() => handlerFull()}
                />
              )}
            </div>
          </div>
          <div ref={DivRef} className={styles.monitorCanvas}></div>
        </div>
      </Spin>
      {visible && (
        <PasswordModal
          visible={visible}
          confirm={(v) => ScadaModelPassword(v)}
          container={DivRef.current}
          cancle={() => {
            setValue({});
            setVisible(false);
          }}
          loading={buttonLoading === "pmLoading"}
        />
      )}
      {shareVisible && (
        <ShareModal
          visible={shareVisible}
          onSubmit={(v) => {
            window.open(v?.url);
            setShareVisible(false);
          }}
          onCancel={() => setShareVisible(false)}
          deviceId={subscribeID}
          queryAccountWeChatConf={queryAccountWeChatConf}
        />
      )}
      {writeVisible && (
        <WriteForm
          visible={writeVisible}
          confirm={(v) => writeEvent(v)}
          container={DivRef.current}
          cancle={() => {
            setValue({});
            setWriteVisible(false);
          }}
          title={value.title}
          loading={buttonLoading === "wfLoading"}
        />
      )}
      {playbackVisible && (
        <Playback
          visible={playbackVisible}
          video={video}
          onCancel={() => {
            setVideo(undefined);
            setPlaybackVisible(false);
          }}
          accessToken={videoToken}
        />
      )}
    </div>
  );
};
export default ScadaMonitor;

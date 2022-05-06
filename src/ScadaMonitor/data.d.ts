export interface View {
  id: string;
  name: string;
  modelData: string;
  modelProperty: string;
  isMain: boolean;
  tag?: string;
}

export interface ScadaMonitorProps {
  view: View;
  views: View[];
  videoToken: string;
  scadaModelID: string;
  subscribeID: string; // 订阅数据ID
  cacheKey: string; // 本地密码Key
  status: boolean; // 状态
  isShare?: boolean; // 分享
  isRefresh?: boolean; // 刷新
  isFull?: boolean; // 全屏
  isPannable?: boolean; // 是否移动
  isScroll?: boolean; // 是否滚动
  isExit?: boolean; //全屏是否退出
  isFullRefresh?: boolean; //全屏是否刷新
  viewLoading: boolean;
  queryDevicePropertiesDataReq?: (val: any) => void;
  setDeviceThingProperty?: (val: any) => void;
  subscribeProperty?: (val: any) => void;
  verifyScadaModelPassword?: (val: any) => void;
  queryAllNowProperties?: (val: any) => void;
  queryVideo?: (val: any) => void;
  queryView?: (val: any) => void;
  queryAccountWeChatConf?: () => void;
}

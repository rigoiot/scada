export interface View {
  id: string;
  name: string;
  modelData: string;
  modelProperty: string;
  isMain: boolean;
  tag?: string;
}

export interface ScadaMonitorProps {
  collapsed: boolean;
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

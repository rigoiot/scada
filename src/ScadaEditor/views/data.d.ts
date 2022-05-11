export interface ListItemType {
  children: any;
  key: string;
  title: string;
  viewType: string;
  parentId: string;
  modelData: string;
  modelProperty: string;
  isMain: boolean;
}
export interface View {
  value: string;
  scadaModelID: string;
  id: string;
  name: string;
  viewType: string;
  viewTypeInfo: {
    id: string;
    name: string;
  };
  modelData: string;
  modelProperty: string;
  isMain: boolean;
}

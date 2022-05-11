export const Copy = (obj: { [x: string]: any } | any[] | undefined) => {
  if (!obj) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return JSON.parse(JSON.stringify({ v: obj })).v;
  }
  return JSON.parse(JSON.stringify(obj || {}));
};

export const AddProjectField = (params: any) => {
  const project = JSON.parse(localStorage.getItem("gocloud.project") || "{}");
  const val = params;
  if (project?.id) {
    val.projectID = project.id;
  }
  return val;
};

export const CheckLength = (
  value: string,
  label = "",
  min?: number,
  max = 45
) => {
  if (!value) {
    return Promise.resolve();
  }
  /* eslint-disable-next-line */
  const newvalue = value.replace(/[^\x00-\xff]/g, "***");
  if (min && newvalue.length < min) {
    return Promise.reject(
      new Error(`${label}长度限制${min}-${max}位，中文算3位`)
    );
  }
  if (newvalue.length > max) {
    return Promise.reject(new Error(`${label}长度限制${max}位，中文算3位`));
  }
  return Promise.resolve();
};

export const confirmConfig: any = {
  title: "确认删除?",
  content: "",
  okText: "是",
  okType: "danger",
  cancelText: "否",
};

export const HandleRequest = async (request: any, params?: any) => {
  try {
    return await request(params);
  } catch (e) {
    return { error: e.message };
  }
};

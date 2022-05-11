export const dataTypes = [
  { value: 'int16', name: 'int16', desc: '（整数型）', ele: true },
  { value: 'uint16', name: 'uint16', desc: '（整数型）', ele: true },
  { value: 'int32', name: 'int32', desc: '（整数型）', ele: true },
  { value: 'uint32', name: 'uint32', desc: '（整数型）', ele: true },
  { value: 'int64', name: 'int64', desc: '（整数型）', ele: true },
  { value: 'uint64', name: 'uint64', desc: '（整数型）', ele: true },
  { value: 'float', name: 'float', desc: '（单精度浮点型）', ele: true },
  { value: 'double', name: 'double', desc: '（双精度浮点型）', ele: true },
  { value: 'enum', name: 'enum', desc: '（枚举型）' },
  { value: 'bool', name: 'bool', desc: '（布尔型）' },
  { value: 'bits', name: 'bits', desc: '（比特型）' },
  // { value: 7, name: 'struct', desc: '（结构体）', ele: true },
  // { value: 8, name: 'array', desc: '（数组）' },
];

export const extendDataType = [
  { name: '离散量输入(只读，0x02)', value: '02' },
  { name: '线圈状态(只读， 0x01)', value: '01' },
  { name: '线圈状态(读写， 读取使用0x01,写入使用0x05)', value: '05' },
  { name: '线圈状态(读写， 读取使用0x01,写入使用0x0F)', value: '15' },
  { name: '保持寄存器(只读，0x03)', value: '03' },
  { name: '保持寄存器(读写，读取使用0x03,写入使用0x06)', value: '06' },
  { name: '保持寄存器(读写， 读取使用0x03，写入使用0x10)', value: '16' },
  { name: '输入寄存器(只读，0x04)', value: '04' },
];

export const areaType = [
  { name: '数据块', value: 'DB' },
  { name: '数字输入', value: 'DigitalInputs' },
  { name: '数字输出', value: 'DigitalOnputs' },
  { name: 'Merkers', value: 'Merkers' },
  { name: '时间', value: 'Timers' },
  { name: '计数器', value: 'Counters' },
];

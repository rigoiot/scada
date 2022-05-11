import React from 'react';
import IOTTslPropertyModal from './systemModal/IOTTslPropertyModal';
import StationTslPropertyModal from './systemModal/StationTslPropertyModal';
import OpsTslPropertyModal from './systemModal/OpsTslPropertyModal';
import EpTslPropertyModal from './systemModal/EpTslPropertyModal';
import { ScadaContext } from './index';

interface ModalFormProps {
  onCancel: () => void;
  onSubmit: (values: any) => void;
  visible: boolean;
  scadaModelID: string;
  type: string;
}

const PropertyModal: React.FC<ModalFormProps> = props => {
  const { onSubmit, onCancel, visible, scadaModelID, type } = props;

  const render = (val: any) => {
    switch (val.system) {
      case 'iot':
        return (
          <IOTTslPropertyModal
            onSubmit={onSubmit}
            onCancel={onCancel}
            visible={visible}
            scadaModelID={scadaModelID}
            type={type}
            queryAllTslPropertiesByGatewayID={val.queryAllTslPropertiesByGatewayID}
            queryAllDeviceDataSources={val.queryAllDeviceDataSources}
          />
        );
      case 'station':
        return (
          <StationTslPropertyModal
            onSubmit={onSubmit}
            onCancel={onCancel}
            visible={visible}
            type={type}
            stationID={val.stationID}
            queryAllTslPropertiesInStation={val.queryAllTslPropertiesInStation}
            queryAllEquipments={val.queryAllEquipments}
          />
        );
      case 'ops':
        return (
          <OpsTslPropertyModal
            onSubmit={onSubmit}
            onCancel={onCancel}
            visible={visible}
            type={type}
            equipmentID={val.equipmentID}
            queryAllEquipmentVariable={val.queryAllEquipmentVariable}
          />
        );
      case 'ep':
        return (
          <EpTslPropertyModal
            onSubmit={onSubmit}
            onCancel={onCancel}
            visible={visible}
            type={type}
            enterpriseID={val.enterpriseID}
            getAllMonitors={val.getAllMonitors}
            getAllTslProperties={val.getAllTslProperties}
          />
        );
      default:
        return null;
    }
  };

  return <ScadaContext.Consumer>{val => render(val)}</ScadaContext.Consumer>;
};

export default PropertyModal;

import React from 'react';
import { BloodPressureData } from '../types';
import { MeasurementModal } from './heartCare/MeasurementModal';

interface Props {
  onCancel: () => void;
  onComplete: (data: BloodPressureData) => void;
}

export const Scr08BloodPressure: React.FC<Props> = ({ onCancel, onComplete }) => {
  return (
    <MeasurementModal
      type="bp"
      onClose={onCancel}
      onSubmit={(data) => {
        onComplete({
          systolic: String(data.values.sysBP || '120'),
          diastolic: String(data.values.diaBP || '80'),
          pulse: String(data.values.pulse || '72'),
          date: data.timestamp,
          note: data.note || '',
        });
      }}
    />
  );
};

import { Specialty } from '../constants/speciality.enum';

export interface IFilterOptionsForPatients {
  speciality?: Specialty;
  year?: number;
  month?: number;
  day?: number;
}

export type IFilterOptionsForDoctors = Omit<
  IFilterOptionsForPatients,
  'speciality'
>;

import { Roles } from '../../roles/roles.schema';

export type AdminJwtPayload = {
  id: string;
  email: string;
  userName: string;
  practiceManagement: string;
  role: Roles['roleName'];
};

export type UserJwtPayload = {
  user: {
    id: string;
    email: string;
  };
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  screenTracking: string;
  role: Roles['roleName'];
};

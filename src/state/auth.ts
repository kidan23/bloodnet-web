import { useMutation } from '@tanstack/react-query';
import api from './api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: any;
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post(
        import.meta.env.VITE_AUTH_LOGIN_PATH,
        payload
      );
      return data;
    },
  });
}

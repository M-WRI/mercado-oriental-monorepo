export interface Customer {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  createdAt?: string;
}

export interface CustomerAuthResponse {
  customer: Customer;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name?: string;
  phone?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
}

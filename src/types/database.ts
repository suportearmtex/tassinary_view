// Tipos para as tabelas do banco de dados
export interface ViewUser {
  id: number;
  user_name: string;
  email?: string;
  user_identificator: string;
  user_data?: any;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  user_name: string;
  email?: string;
  user_identificator: string;
  user_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id?: number;
  agent_id: number;
  user_id: number;
  yearly_start?: string;
  yearly_end?: string;
  activation: boolean;
  status?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo para exibir usuário com inscrição
export interface UserWithSubscription {
  user_id: number;
  user_name: string;
  user_identificator: string;
  email?: string;
  subscription_id?: number;
  agent_id: number;
  activation: boolean;
  status?: string;
  yearly_start?: string;
  yearly_end?: string;
  created_at?: string;
  updated_at?: string;
}
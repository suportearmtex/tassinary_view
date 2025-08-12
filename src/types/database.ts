export interface User {
  id: number;
  user_name: string;
  email?: string;
  user_identificator: string;
  user_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: number;
  agent_name: string;
  agent_type: string;
  workflow_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentUser {
  agent_id: number;
  user_id: number;
  last_interaction?: string;
  origin?: string;
  tags?: any;
  custom_data?: any;
  step_id?: number;
}

export interface Subscription {
  agent_id: number;
  user_id: number;
  yearly_start?: string;
  yearly_end?: string;
  activation: boolean;
  status?: string;
  email?: string;
  created_at: string;
}

export interface UserWithSubscription {
  user_id: number;
  agent_id: number;
  user_name: string;
  user_identificator: string;
  email?: string;
  activation: boolean;
  status?: string;
  yearly_start?: string;
  yearly_end?: string;
  last_interaction?: string;
}
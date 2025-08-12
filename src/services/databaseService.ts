// src/services/databaseService.ts

import { SupabaseClient } from '../config/supabase';
import type { AgentUserWithDetails, UpdateAgentUserData } from '../types/database';

export class DatabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const {  error } = await SupabaseClient
        .from('user')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  static async getAgentUsersWithDetails(): Promise<AgentUserWithDetails[]> {
    try {
      const { data, error } = await SupabaseClient
        .from('agent_user')
        .select(`
          *,
          user:user_id (
            id,
            user_name,
            email,
            user_identificator,
            user_data,
            created_at,
            updated_at
          ),
          agent:agent_id (
            id,
            agent_name,
            agent_type,
            workflow_id,
            created_at,
            updated_at
          ),
          agent_step:step_id (
            id,
            name,
            prompt
          )
        `);

      if (error) {
        console.error('Erro detalhado:', error);
        throw new Error(`Erro ao buscar dados: ${error.message}. Verifique as políticas RLS.`);
      }

      return data || [];
    } catch (err: any) {
      console.error('Erro na consulta:', err);
      throw err;
    }
  }

  static async updateAgentUser(
    agentId: number, 
    userId: number, 
    updateData: UpdateAgentUserData
  ): Promise<void> {
    try {
      const { error } = await SupabaseClient
        .from('agent_user')
        .update(updateData)
        .eq('agent_id', agentId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar:', error);
        throw new Error(`Erro ao atualizar dados: ${error.message}`);
      }
    } catch (err: any) {
      console.error('Erro na atualização:', err);
      throw err;
    }
  }

  static async getAgentSteps() {
    try {
      const { data, error } = await SupabaseClient
        .from('agent_step')
        .select('*')
        .order('id');

      if (error) {
        console.error('Erro ao buscar steps:', error);
        
        // Se der erro de permissão, retorna array vazio em vez de falhar
        if (error.message.includes('permission denied')) {
          console.warn('Permissão negada para agent_step, retornando lista vazia');
          return [];
        }
        
        throw new Error(`Erro ao buscar steps: ${error.message}`);
      }

      return data || [];
    } catch (err: any) {
      console.error('Erro na consulta de steps:', err);
      
      // Se for erro de permissão, retorna array vazio
      if (err.message?.includes('permission denied')) {
        console.warn('Retornando lista vazia de steps devido a permissões');
        return [];
      }
      
      throw err;
    }
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await SupabaseClient.auth.getUser();
    
    if (error) {
      throw new Error(`Erro ao obter usuário: ${error.message}`);
    }
    
    return user;
  }
}
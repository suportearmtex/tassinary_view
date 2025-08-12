import React, { useState, useEffect } from 'react';
import type { UserWithSubscription } from '../types/database';
import { supabase } from '../config/supabase';

export default function UserList() {
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserWithSubscription | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('agent_user')
      .select(`
        agent_id,
        user_id,
        last_interaction,
        user:user_id (
          user_name,
          user_identificator,
          email
        ),
        subscription (
          activation,
          status,
          yearly_start,
          yearly_end,
          email
        )
      `);

    if (error) {
      console.error('Error:', error);
    } else {
      const formattedData = data?.map((item: any) => ({
        user_id: item.user_id,
        agent_id: item.agent_id,
        user_name: item.user?.user_name || '',
        user_identificator: item.user?.user_identificator || '',
        email: item.user?.email || item.subscription?.email || '',
        activation: item.subscription?.activation || false,
        status: item.subscription?.status || '',
        yearly_start: item.subscription?.yearly_start || '',
        yearly_end: item.subscription?.yearly_end || '',
        last_interaction: item.last_interaction || ''
      })) || [];
      
      setUsers(formattedData);
    }
    
    setLoading(false);
  };

  const updateUser = async (user: UserWithSubscription) => {
    // Update user table
    const { error: userError } = await supabase
      .from('user')
      .update({ user_identificator: user.user_identificator })
      .eq('id', user.user_id);

    // Update subscription table
    const { error: subError } = await supabase
      .from('subscription')
      .update({
        activation: user.activation,
        status: user.status,
        yearly_start: user.yearly_start || null,
        yearly_end: user.yearly_end || null,
        email: user.email || null
      })
      .eq('user_id', user.user_id)
      .eq('agent_id', user.agent_id);

    if (userError || subError) {
      alert('Erro ao atualizar');
      console.error(userError, subError);
    } else {
      alert('Atualizado com sucesso!');
      setEditingUser(null);
      fetchUsers();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Gerenciar Usuários e Inscrições</h1>
        <button onClick={logout} style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Sair
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Identificador</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Comprou Ativação</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Início Incrição</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Fim Incrição</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={`${user.user_id}-${user.agent_id}`}>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{user.user_name}</td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <input
                      value={editingUser.user_identificator}
                      onChange={(e) => setEditingUser({...editingUser, user_identificator: e.target.value})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    />
                  ) : (
                    user.user_identificator
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <input
                      value={editingUser.email || ''}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    />
                  ) : (
                    user.email || '-'
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <select
                      value={editingUser.activation ? 'true' : 'false'}
                      onChange={(e) => setEditingUser({...editingUser, activation: e.target.value === 'true'})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  ) : (
                    user.activation ? 'Ativo' : 'Inativo'
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <input
                      value={editingUser.status || ''}
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    />
                  ) : (
                    user.status || '-'
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <input
                      type="date"
                      value={editingUser.yearly_start?.split('T')[0] || ''}
                      onChange={(e) => setEditingUser({...editingUser, yearly_start: e.target.value ? `${e.target.value}T00:00:00Z` : ''})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    />
                  ) : (
                    user.yearly_start ? new Date(user.yearly_start).toLocaleDateString('pt-BR') : '-'
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <input
                      type="date"
                      value={editingUser.yearly_end?.split('T')[0] || ''}
                      onChange={(e) => setEditingUser({...editingUser, yearly_end: e.target.value ? `${e.target.value}T00:00:00Z` : ''})}
                      style={{ width: '100%', padding: '0.25rem' }}
                    />
                  ) : (
                    user.yearly_end ? new Date(user.yearly_end).toLocaleDateString('pt-BR') : '-'
                  )}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {editingUser?.user_id === user.user_id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateUser(editingUser)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingUser(user)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Nenhum usuário encontrado
        </div>
      )}
    </div>
  );
}
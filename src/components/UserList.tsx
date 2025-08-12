import React, { useState, useEffect } from 'react';
import type { UserWithSubscription, User, Subscription } from '../types/database';
import { supabase } from '../config/supabase';
import UserModal from './UserModal';
import AddSubscriptionModal from './AddSubscriptionModal';

export default function UserList() {
  // Estados principais
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState('');
  
  // Estados para modais
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Carrega os dados quando o componente monta
  useEffect(() => {
    fetchUsersWithSubscriptions();
  }, []);

  // Busca usuários que têm inscrição (inner join)
  const fetchUsersWithSubscriptions = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('subscription')
        .select(`
          id,
          agent_id,
          user_id,
          activation,
          status,
          yearly_start,
          yearly_end,
          email,
          created_at,
          updated_at,
          user:user_id (
            user_name,
            user_identificator,
            email
          )
        `);

      if (error) {
        console.error('Erro ao buscar dados:', error);
        alert('Erro ao carregar dados');
        return;
      }

      // Formata os dados para exibição
      const formattedData = data?.map((item: any) => ({
        user_id: item.user_id,
        user_name: item.user?.user_name || '',
        user_identificator: item.user?.user_identificator || '',
        email: item.user?.email || item.email || '',
        subscription_id: item.id,
        agent_id: item.agent_id,
        activation: item.activation || false,
        status: item.status || '',
        yearly_start: item.yearly_start || '',
        yearly_end: item.yearly_end || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      })) || [];
      
      setUsers(formattedData);
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao carregar dados');
    }
    
    setLoading(false);
  };

  // Filtra usuários por nome
  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(nameFilter.toLowerCase())
  );

  // Função para logout
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.location.reload();
  };

  // Função chamada quando uma inscrição é atualizada
  const handleSubscriptionUpdated = () => {
    fetchUsersWithSubscriptions();
    setSelectedUser(null);
  };

  // Função chamada quando uma nova inscrição é adicionada
  const handleSubscriptionAdded = () => {
    fetchUsersWithSubscriptions();
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        fontSize: '18px'
      }}>
        Carregando usuários...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Cabeçalho */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>
          Gerenciar Inscrições de Usuários
        </h1>
        <button 
          onClick={logout} 
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Sair
        </button>
      </div>

      {/* Filtros e ações */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Filtro por nome */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Filtrar por nome..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        
        {/* Botão para adicionar inscrição */}
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          + Nova Inscrição
        </button>
      </div>

      {/* Tabela de usuários */}
      <div style={{ 
        overflowX: 'auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '800px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057'
              }}>
                Nome
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057'
              }}>
                Identificador
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057'
              }}>
                Email
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057'
              }}>
                Ativação
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'left',
                fontWeight: '600',
                color: '#495057'
              }}>
                Status
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057'
              }}>
                Início
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057'
              }}>
                Fim
              </th>
              <th style={{ 
                padding: '1rem', 
                border: '1px solid #ddd', 
                textAlign: 'center',
                fontWeight: '600',
                color: '#495057'
              }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr 
                key={`${user.user_id}-${user.subscription_id}`}
                style={{ 
                  borderBottom: '1px solid #eee',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {user.user_name}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {user.user_identificator}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {user.email || '-'}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: user.activation ? '#d4edda' : '#f8d7da',
                    color: user.activation ? '#155724' : '#721c24'
                  }}>
                    {user.activation ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd' }}>
                  {user.status || '-'}
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  {user.yearly_start ? 
                    new Date(user.yearly_start).toLocaleDateString('pt-BR') : 
                    '-'
                  }
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  {user.yearly_end ? 
                    new Date(user.yearly_end).toLocaleDateString('pt-BR') : 
                    '-'
                  }
                </td>
                <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => setSelectedUser(user)}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mensagem quando não há dados */}
      {filteredUsers.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#666',
          backgroundColor: 'white',
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          {nameFilter ? 
            `Nenhum usuário encontrado com o nome "${nameFilter}"` : 
            'Nenhum usuário com inscrição encontrado'
          }
        </div>
      )}

      {/* Modal para editar inscrição */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSubscriptionUpdated}
        />
      )}

      {/* Modal para adicionar nova inscrição */}
      {showAddModal && (
        <AddSubscriptionModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSubscriptionAdded}
        />
      )}
    </div>
  );
}
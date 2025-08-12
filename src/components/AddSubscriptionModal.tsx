import React, { useState, useEffect } from 'react';
import type { User } from '../types/database';
import { supabase } from '../config/supabase';

interface AddSubscriptionModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddSubscriptionModal({ onClose, onSave }: AddSubscriptionModalProps) {
  // Estados
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [userFilter, setUserFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Dados da nova inscrição
  const [formData, setFormData] = useState({
    activation: true,
    status: '',
    yearly_start: '',
    yearly_end: '',
    email: ''
  });

  // Carrega todos os usuários quando o modal abre
  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Busca todos os usuários da tabela user
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    
    try {
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .order('user_name');

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        alert('Erro ao carregar usuários');
        return;
      }

      setUsers(data || []);
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao carregar usuários');
    }
    
    setLoadingUsers(false);
  };

  // Filtra usuários por nome
  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(userFilter.toLowerCase())
  );

  // Função para criar nova inscrição
  const handleSave = async () => {
    if (!selectedUserId) {
      alert('Por favor, selecione um usuário');
      return;
    }

    setLoading(true);
    
    try {
      // Verifica se já existe inscrição para este usuário com agent_id = 1
      const { data: existingSubscription, error: checkError } = await supabase
        .from('subscription')
        .select('id')
        .eq('user_id', selectedUserId)
        .eq('agent_id', 1)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao verificar inscrição existente:', checkError);
        alert('Erro ao verificar inscrição existente');
        setLoading(false);
        return;
      }

      if (existingSubscription) {
        alert('Este usuário já possui uma inscrição para o agent_id 1');
        setLoading(false);
        return;
      }

      // Cria nova inscrição com agent_id = 1
      const { error } = await supabase
        .from('subscription')
        .insert({
          user_id: selectedUserId,
          agent_id: 1, // Sempre 1 conforme solicitado
          activation: formData.activation,
          status: formData.status || null,
          yearly_start: formData.yearly_start ? `${formData.yearly_start}T00:00:00Z` : null,
          yearly_end: formData.yearly_end ? `${formData.yearly_end}T00:00:00Z` : null,
          email: formData.email || null,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao criar inscrição:', error);
        alert('Erro ao criar inscrição');
        return;
      }

      alert('Inscrição criada com sucesso!');
      onSave(); // Recarrega a lista
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao criar inscrição');
    }
    
    setLoading(false);
  };

  // Função para fechar o modal ao clicar no fundo
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Encontra o usuário selecionado
  const selectedUser = users.find(user => user.id === selectedUserId);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Cabeçalho do modal */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #eee'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            Adicionar Nova Inscrição
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Seleção de usuário */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
            Selecionar Usuário
          </h3>
          
          {/* Filtro de usuários */}
          <input
            type="text"
            placeholder="Filtrar usuários por nome..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '1rem'
            }}
          />

          {/* Lista de usuários */}
          <div style={{
            border: '1px solid #ddd',
            borderRadius: '4px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {loadingUsers ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                Carregando usuários...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                Nenhum usuário encontrado
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user.id ? '#e3f2fd' : 'white',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedUserId !== user.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedUserId !== user.id) {
                      e.currentTarget.style.backgroundColor = 'white';
                    }
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#333' }}>
                    {user.user_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    ID: {user.id} | Identificador: {user.user_identificator}
                  </div>
                  {user.email && (
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      Email: {user.email}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Usuário selecionado */}
          {selectedUser && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#d4edda',
              borderRadius: '4px',
              border: '1px solid #c3e6cb'
            }}>
              <strong>Usuário selecionado:</strong> {selectedUser.user_name}
            </div>
          )}
        </div>

        {/* Formulário de dados da inscrição */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
            Dados da Inscrição (Agent ID: 1)
          </h3>

          {/* Email */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Email:
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Digite o email"
            />
          </div>

          {/* Ativação */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Status de Ativação:
            </label>
            <select
              value={formData.activation ? 'true' : 'false'}
              onChange={(e) => setFormData({...formData, activation: e.target.value === 'true'})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Status:
            </label>
            <input
              type="text"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Digite o status"
            />
          </div>

          {/* Data de início */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Data de Início:
            </label>
            <input
              type="date"
              value={formData.yearly_start}
              onChange={(e) => setFormData({...formData, yearly_start: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Data de fim */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#495057'
            }}>
              Data de Fim:
            </label>
            <input
              type="date"
              value={formData.yearly_end}
              onChange={(e) => setFormData({...formData, yearly_end: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Botões de ação */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee'
        }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedUserId}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: selectedUserId ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: (loading || !selectedUserId) ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Criando...' : 'Criar Inscrição'}
          </button>
        </div>
      </div>
    </div>
  );
}
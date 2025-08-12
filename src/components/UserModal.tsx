import React, { useState } from 'react';
import type { UserWithSubscription } from '../types/database';
import { supabase } from '../config/supabase';

interface UserModalProps {
  user: UserWithSubscription;
  onClose: () => void;
  onSave: () => void;
}

export default function UserModal({ user, onClose, onSave }: UserModalProps) {
  // Estados para os campos editáveis
  const [formData, setFormData] = useState({
    activation: user.activation,
    status: user.status || '',
    yearly_start: user.yearly_start ? user.yearly_start.split('T')[0] : '',
    yearly_end: user.yearly_end ? user.yearly_end.split('T')[0] : '',
    email: user.email || ''
  });
  
  const [loading, setLoading] = useState(false);

  // Função para salvar as alterações
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Atualiza a inscrição
      const { error } = await supabase
        .from('subscription')
        .update({
          activation: formData.activation,
          status: formData.status || null,
          yearly_start: formData.yearly_start ? `${formData.yearly_start}T00:00:00Z` : null,
          yearly_end: formData.yearly_end ? `${formData.yearly_end}T00:00:00Z` : null,
          email: formData.email || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.subscription_id);

      if (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao salvar alterações');
        return;
      }

      alert('Inscrição atualizada com sucesso!');
      onSave(); // Recarrega a lista
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao salvar alterações');
    }
    
    setLoading(false);
  };

  // Função para fechar o modal ao clicar no fundo
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
        maxWidth: '500px',
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
            Editar Inscrição
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

        {/* Informações do usuário (somente leitura) */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '6px',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>
            Informações do Usuário
          </h3>
          <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
            <strong>Nome:</strong> {user.user_name}
          </p>
          <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
            <strong>Identificador:</strong> {user.user_identificator}
          </p>
          <p style={{ margin: '0.25rem 0', color: '#6c757d' }}>
            <strong>ID do Usuário:</strong> {user.user_id}
          </p>
        </div>

        {/* Formulário de edição */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            disabled={loading}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
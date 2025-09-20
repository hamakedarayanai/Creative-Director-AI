
import React from 'react';
import type { AgentStatus } from '../types';
import Spinner from './Spinner';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface AgentCardProps {
  title: string;
  icon: React.ReactNode;
  status: AgentStatus;
  statusMessage?: string;
  children: React.ReactNode;
}

const AgentCard: React.FC<AgentCardProps> = ({ title, icon, status, statusMessage, children }) => {
  const StatusIndicator = () => {
    switch (status) {
      case 'working':
        return <Spinner className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-400" />;
      case 'pending':
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-600"></div>;
    }
  };

  const statusTextClass = {
    working: 'text-blue-400',
    completed: 'text-green-400',
    error: 'text-red-400',
    pending: 'text-gray-500',
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg p-6 flex flex-col h-full transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="text-xl font-bold text-gray-200">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold capitalize ${statusTextClass[status]}`}>{statusMessage || status}</span>
            <StatusIndicator />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2" style={{ maxHeight: '400px' }}>
        {children}
      </div>
    </div>
  );
};

export default AgentCard;

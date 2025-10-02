
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
        return <div className="w-5 h-5 rounded-full bg-gray-600 border-2 border-gray-500"></div>;
    }
  };

  const statusTextClass = {
    working: 'text-blue-400',
    completed: 'text-green-400',
    error: 'text-red-400',
    pending: 'text-gray-400',
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 flex flex-col h-full transition-all duration-500 hover:bg-white/10">
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
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
};

export default AgentCard;

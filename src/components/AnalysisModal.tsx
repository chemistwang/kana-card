import React, { useState } from 'react';
import { Modal, Tabs, Typography, Button } from 'antd';
import { 
  BarChartOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  ThunderboltOutlined,
  TableOutlined
} from '@ant-design/icons';
import WeaknessAnalysis from './WeaknessAnalysis';
import ResponseTimeAnalysis from './ResponseTimeAnalysis';
import LearningProgress from './LearningProgress';
import CharacterDetailTable from './CharacterDetailTable';

const { Title } = Typography;

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState('weakness');

  const tabItems = [
    {
      key: 'weakness',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
          薄弱环节
        </div>
      ),
      children: <WeaknessAnalysis />
    },
    {
      key: 'response-time',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ThunderboltOutlined style={{ color: '#722ed1' }} />
          响应时间分析
        </div>
      ),
      children: <ResponseTimeAnalysis />
    },
    {
      key: 'progress',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleOutlined style={{ color: '#52c41a' }} />
          学习进度
        </div>
      ),
      children: <LearningProgress />
    },
    {
      key: 'details',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TableOutlined style={{ color: '#1890ff' }} />
          字符详情
        </div>
      ),
      children: <CharacterDetailTable />
    }
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChartOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0 }}>
            详细学习分析
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      bodyStyle={{ padding: '20px' }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        tabBarStyle={{ marginBottom: '24px' }}
      />
    </Modal>
  );
};

export default AnalysisModal;
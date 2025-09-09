import React from 'react';
import { Modal, Typography, Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import SimplifiedStats from './SimplifiedStats';
import KanaHeatmap from './KanaHeatmap';

const { Title } = Typography;

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChartOutlined style={{ color: '#722ed1', fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0 }}>
            学习分析
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>
      ]}
      bodyStyle={{ 
        padding: '20px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 上半部分：简化统计 */}
        <SimplifiedStats />
        
        {/* 下半部分：热力图 */}
        <KanaHeatmap />
      </div>
    </Modal>
  );
};

export default AnalysisModal;
import React, { useEffect, useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useKanaStore } from './store/useKanaStore';
import KanaCard from './components/KanaCard';
import ScoreBoard from './components/ScoreBoard';
import ModeSelector from './components/ModeSelector';
import AnalysisModal from './components/AnalysisModal';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const { initializeSession, statistics } = useKanaStore();
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ textAlign: 'center', background: '#1890ff' }}>
        <Title level={2} style={{ color: 'white', margin: '16px 0' }}>
          五十音図練習 - Kana Card
        </Title>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <Card>
                <ModeSelector />
              </Card>
              
              <Card style={{ marginTop: '16px' }}>
                <KanaCard />
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card>
                <ScoreBoard />
              </Card>
              
              <Card style={{ marginTop: '16px' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<BarChartOutlined />}
                    onClick={() => setAnalysisModalOpen(true)}
                    style={{ 
                      height: '50px',
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #722ed1, #9254de)',
                      border: 'none'
                    }}
                  >
                    查看详细分析
                  </Button>
                  {statistics.totalQuestions > 0 && (
                    <div style={{ 
                      marginTop: '12px', 
                      fontSize: '12px', 
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      📊 包含薄弱环节分析、响应时间热力图<br />
                      📈 学习进度追踪、完整字符统计等功能
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <AnalysisModal 
        open={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
      />
    </Layout>
  );
};

export default App;
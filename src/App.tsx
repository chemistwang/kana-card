import React, { useEffect } from 'react';
import { Layout, Typography, Card, Row, Col } from 'antd';
import { useKanaStore } from './store/useKanaStore';
import KanaCard from './components/KanaCard';
import ScoreBoard from './components/ScoreBoard';
import ModeSelector from './components/ModeSelector';
import StatisticsPanel from './components/StatisticsPanel';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const App: React.FC = () => {
  const { initializeSession } = useKanaStore();

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
                <StatisticsPanel />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default App;
import React, { useState } from 'react';
import { Typography, Collapse, Tag, Progress, List, Button, Empty } from 'antd';
import { 
  BarChartOutlined, 
  ExclamationCircleOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import { kanaData } from '../data/kanaData';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const StatisticsPanel: React.FC = () => {
  const { statistics, answerHistory } = useKanaStore();
  const [showDetails, setShowDetails] = useState(false);

  // 获取错误最多的字符
  const getWorstPerformingCharacters = () => {
    const characterStats = Object.entries(statistics.characterStats)
      .map(([char, stats]) => ({ char, ...stats }))
      .filter(item => item.attempts > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10);
    
    return characterStats;
  };

  // 获取最近的错误记录
  const getRecentErrors = () => {
    return answerHistory
      .filter(answer => !answer.isCorrect)
      .slice(-5)
      .reverse();
  };

  // 按行统计准确率
  const getRowStatistics = () => {
    const rowStats: { [key: string]: { attempts: number; correct: number; accuracy: number } } = {};
    
    kanaData.forEach(row => {
      const rowName = row.rowName;
      rowStats[rowName] = { attempts: 0, correct: 0, accuracy: 0 };
      
      row.characters.forEach(char => {
        const charStats = statistics.characterStats[char.hiragana];
        if (charStats) {
          rowStats[rowName].attempts += charStats.attempts;
          rowStats[rowName].correct += charStats.correct;
        }
      });
      
      if (rowStats[rowName].attempts > 0) {
        rowStats[rowName].accuracy = (rowStats[rowName].correct / rowStats[rowName].attempts) * 100;
      }
    });
    
    return rowStats;
  };

  const worstCharacters = getWorstPerformingCharacters();
  const recentErrors = getRecentErrors();
  const rowStats = getRowStatistics();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BarChartOutlined style={{ color: '#722ed1' }} />
        详细分析
      </Title>

      <Collapse ghost>
        {/* 薄弱环节 */}
        <Panel 
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
              <Text strong>薄弱环节</Text>
              {worstCharacters.length > 0 && (
                <Tag color="orange" size="small">{worstCharacters.length}</Tag>
              )}
            </div>
          }
          key="weak-points"
        >
          {worstCharacters.length > 0 ? (
            <List
              size="small"
              dataSource={worstCharacters}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', minWidth: '30px' }}>
                      {item.char}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Text style={{ fontSize: '12px' }}>
                          {item.correct}/{item.attempts} 次正确
                        </Text>
                        <Text style={{ fontSize: '12px', color: item.accuracy < 50 ? '#ff4d4f' : '#fa8c16' }}>
                          {Math.round(item.accuracy)}%
                        </Text>
                      </div>
                      <Progress
                        percent={item.accuracy}
                        size="small"
                        strokeColor={item.accuracy < 50 ? '#ff4d4f' : '#fa8c16'}
                        showInfo={false}
                      />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="暂无数据，开始练习后这里将显示需要加强的字符"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Panel>

        {/* 按行统计 */}
        <Panel 
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text strong>按行统计</Text>
            </div>
          }
          key="row-stats"
        >
          <List
            size="small"
            dataSource={Object.entries(rowStats).filter(([_, stats]) => stats.attempts > 0)}
            renderItem={([rowName, stats]) => (
              <List.Item>
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold', minWidth: '50px' }}>
                    {rowName}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Text style={{ fontSize: '12px' }}>
                        {stats.correct}/{stats.attempts} 次正确
                      </Text>
                      <Text style={{ fontSize: '12px', color: stats.accuracy >= 80 ? '#52c41a' : '#fa8c16' }}>
                        {Math.round(stats.accuracy)}%
                      </Text>
                    </div>
                    <Progress
                      percent={stats.accuracy}
                      size="small"
                      strokeColor={stats.accuracy >= 80 ? '#52c41a' : '#fa8c16'}
                      showInfo={false}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
          {Object.entries(rowStats).filter(([_, stats]) => stats.attempts > 0).length === 0 && (
            <Empty
              description="暂无数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Panel>

        {/* 最近错误 */}
        <Panel 
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>最近错误</Text>
              {recentErrors.length > 0 && (
                <Tag color="blue" size="small">{recentErrors.length}</Tag>
              )}
            </div>
          }
          key="recent-errors"
        >
          {recentErrors.length > 0 ? (
            <List
              size="small"
              dataSource={recentErrors}
              renderItem={(error, index) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {error.character.hiragana}
                        </span>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          正确: {error.correctAnswer}
                        </Text>
                      </div>
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {formatTime(error.timestamp)}
                      </Text>
                    </div>
                    <div style={{ fontSize: '12px', color: '#ff4d4f' }}>
                      您的答案: {error.userAnswer || '(未输入)'}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description="暂无错误记录，继续加油！"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Panel>
      </Collapse>

      {/* 查看更多选项 */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Button
          type="link"
          size="small"
          icon={showDetails ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '收起详情' : '查看更多'}
        </Button>
      </div>

      {showDetails && (
        <div style={{ marginTop: '16px', padding: '12px', background: '#fafafa', borderRadius: '6px' }}>
          <Text style={{ fontSize: '12px', color: '#666' }}>
            <div>📊 总体准确率: {Math.round(statistics.accuracy)}%</div>
            <div>📝 累计答题: {statistics.totalQuestions} 次</div>
            <div>✅ 正确次数: {statistics.correctAnswers} 次</div>
            <div>❌ 错误次数: {statistics.incorrectAnswers} 次</div>
          </Text>
        </div>
      )}
    </div>
  );
};

export default StatisticsPanel;
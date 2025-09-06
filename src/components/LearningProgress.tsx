import React from 'react';
import { Typography, Progress, List, Card, Tag, Row, Col } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import { kanaData } from '../data/kanaData';

const { Text } = Typography;

const LearningProgress: React.FC = () => {
  const { statistics, answerHistory } = useKanaStore();

  // 按行统计准确率
  const getRowStatistics = () => {
    const rowStats: { [key: string]: { attempts: number; correct: number; accuracy: number; avgResponseTime: number } } = {};
    
    kanaData.forEach(row => {
      const rowName = row.rowName;
      rowStats[rowName] = { 
        attempts: 0, 
        correct: 0, 
        accuracy: 0,
        avgResponseTime: 0
      };
      
      let totalResponseTime = 0;
      let responseTimeCount = 0;
      
      row.characters.forEach(char => {
        // 检查平假名和片假名的统计
        const hiraganaStats = statistics.characterStats[char.hiragana];
        const katakanaStats = statistics.characterStats[char.katakana];
        
        if (hiraganaStats) {
          rowStats[rowName].attempts += hiraganaStats.attempts;
          rowStats[rowName].correct += hiraganaStats.correct;
          if (hiraganaStats.averageResponseTime > 0) {
            totalResponseTime += hiraganaStats.averageResponseTime * hiraganaStats.attempts;
            responseTimeCount += hiraganaStats.attempts;
          }
        }
        
        if (katakanaStats) {
          rowStats[rowName].attempts += katakanaStats.attempts;
          rowStats[rowName].correct += katakanaStats.correct;
          if (katakanaStats.averageResponseTime > 0) {
            totalResponseTime += katakanaStats.averageResponseTime * katakanaStats.attempts;
            responseTimeCount += katakanaStats.attempts;
          }
        }
      });
      
      if (rowStats[rowName].attempts > 0) {
        rowStats[rowName].accuracy = (rowStats[rowName].correct / rowStats[rowName].attempts) * 100;
      }
      
      if (responseTimeCount > 0) {
        rowStats[rowName].avgResponseTime = totalResponseTime / responseTimeCount;
      }
    });
    
    return rowStats;
  };

  // 获取最近的错误记录
  const getRecentErrors = () => {
    return answerHistory
      .filter(answer => !answer.isCorrect)
      .slice(-10) // 显示更多错误记录
      .reverse();
  };

  const rowStats = getRowStatistics();
  const recentErrors = getRecentErrors();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  const getPerformanceColor = (accuracy: number) => {
    if (accuracy >= 90) return '#52c41a';
    if (accuracy >= 80) return '#faad14';
    if (accuracy >= 70) return '#fa8c16';
    return '#ff4d4f';
  };

  return (
    <Row gutter={16}>
      <Col span={12}>
        {/* 按行统计 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              按行学习进度
            </div>
          }
          size="small"
        >
          <List
            size="small"
            dataSource={Object.entries(rowStats).filter(([_, stats]) => stats.attempts > 0)}
            renderItem={([rowName, stats]) => (
              <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', minWidth: '50px', fontSize: '14px' }}>
                      {rowName}
                    </span>
                    <div style={{ flex: 1, textAlign: 'right', fontSize: '12px', color: '#666' }}>
                      {stats.correct}/{stats.attempts} 次正确
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <Text style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: getPerformanceColor(stats.accuracy)
                    }}>
                      {Math.round(stats.accuracy)}%
                    </Text>
                    {stats.avgResponseTime > 0 && (
                      <Text style={{ fontSize: '11px', color: '#999' }}>
                        平均 {formatResponseTime(stats.avgResponseTime)}
                      </Text>
                    )}
                  </div>
                  
                  <Progress
                    percent={stats.accuracy}
                    size="small"
                    strokeColor={getPerformanceColor(stats.accuracy)}
                    showInfo={false}
                  />
                </div>
              </List.Item>
            )}
          />
          {Object.entries(rowStats).filter(([_, stats]) => stats.attempts > 0).length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              暂无学习数据
            </div>
          )}
        </Card>
      </Col>

      <Col span={12}>
        {/* 最近错误 */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClockCircleOutlined style={{ color: '#1890ff' }} />
              最近错误记录
              {recentErrors.length > 0 && (
                <Tag color="blue">{recentErrors.length}</Tag>
              )}
            </div>
          }
          size="small"
        >
          {recentErrors.length > 0 ? (
            <div>
              <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666' }}>
                分析错误原因，避免重复犯错：
              </div>
              <List
                size="small"
                dataSource={recentErrors}
                renderItem={(error) => (
                  <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            backgroundColor: '#fff2f0',
                            borderRadius: '4px'
                          }}>
                            {error.character.hiragana}
                          </span>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            正确: {error.correctAnswer}
                          </Text>
                        </div>
                        <Text type="secondary" style={{ fontSize: '10px' }}>
                          {formatTime(error.timestamp)}
                        </Text>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#ff4d4f',
                        backgroundColor: '#fff2f0',
                        padding: '4px 6px',
                        borderRadius: '3px'
                      }}>
                        您的答案: {error.userAnswer || '(未输入)'}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎉</div>
              <Text type="secondary">暂无错误记录，继续加油！</Text>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default LearningProgress;
import React from 'react';
import { Typography, Tag, Progress, List, Empty, Card } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';

const { Text } = Typography;

const WeaknessAnalysis: React.FC = () => {
  const { statistics } = useKanaStore();

  const getWorstPerformingCharacters = () => {
    const characterStats = Object.entries(statistics.characterStats)
      .map(([char, stats]) => ({ char, ...stats }))
      .filter(item => item.attempts > 0)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 15); // 显示更多需要改进的字符
    
    return characterStats;
  };

  const worstCharacters = getWorstPerformingCharacters();

  return (
    <div>
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
            <Text strong>需要重点练习的字符</Text>
            {worstCharacters.length > 0 && (
              <Tag color="orange">{worstCharacters.length}</Tag>
            )}
          </div>
        }
        size="small"
      >
        {worstCharacters.length > 0 ? (
          <div>
            <div style={{ marginBottom: '16px', color: '#666', fontSize: '14px' }}>
              以下是准确率较低的字符，建议重点练习：
            </div>
            <List
              grid={{ gutter: 16, column: 2, xs: 1, sm: 1, md: 2 }}
              dataSource={worstCharacters}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ 
                    padding: '16px', 
                    border: '1px solid #f0f0f0', 
                    borderRadius: '8px',
                    backgroundColor: item.accuracy < 50 ? '#fff2f0' : '#fff7e6'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        minWidth: '40px',
                        textAlign: 'center'
                      }}>
                        {item.char}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <Text style={{ fontSize: '12px' }}>
                            {item.correct}/{item.attempts} 次正确
                          </Text>
                          <Text style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            color: item.accuracy < 50 ? '#ff4d4f' : '#fa8c16' 
                          }}>
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
                    {item.averageResponseTime > 0 && (
                      <div style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
                        平均响应时间: {item.averageResponseTime < 1000 
                          ? `${Math.round(item.averageResponseTime)}ms` 
                          : `${(item.averageResponseTime / 1000).toFixed(1)}s`
                        }
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Empty
            description="暂无数据，开始练习后这里将显示需要加强的字符"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {worstCharacters.length > 0 && (
        <Card 
          title="改进建议" 
          size="small" 
          style={{ marginTop: '16px' }}
          bodyStyle={{ backgroundColor: '#f6ffed' }}
        >
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>💡 学习建议：</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>重复练习准确率低于70%的字符</li>
              <li>可以暂时专注于这些字符的练习模式</li>
              <li>注意区分相似的字符，如 し/つ、ソ/ン 等</li>
              <li>每天复习2-3个薄弱字符，循序渐进</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeaknessAnalysis;
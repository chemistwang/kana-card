import React, { useState } from 'react';
import { Typography, Card, Radio, Divider, List, Tag } from 'antd';
import { ThunderboltOutlined, FireOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import KanaHeatmap from './KanaHeatmap';

const { Text } = Typography;

const ResponseTimeAnalysis: React.FC = () => {
  const { statistics } = useKanaStore();
  const [viewMode, setViewMode] = useState<'heatmap' | 'chart'>('heatmap');

  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  const getResponseTimeColor = (timeMs: number) => {
    if (timeMs < 1500) return '#52c41a';
    if (timeMs < 3000) return '#faad14';
    return '#ff4d4f';
  };

  const getResponseTimeStats = () => {
    const characterStats = Object.entries(statistics.characterStats)
      .map(([char, stats]) => ({ char, ...stats }))
      .filter(item => item.attempts > 0 && item.averageResponseTime > 0)
      .sort((a, b) => a.averageResponseTime - b.averageResponseTime);
    
    const fastestChars = characterStats.slice(0, 5);
    const slowestChars = characterStats.slice(-5).reverse();
    
    return { fastestChars, slowestChars, allChars: characterStats };
  };

  const { fastestChars, slowestChars, allChars } = getResponseTimeStats();

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Text strong>查看模式:</Text>
        <Radio.Group 
          value={viewMode} 
          onChange={(e) => setViewMode(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="heatmap">热力图</Radio.Button>
          <Radio.Button value="chart">排行榜</Radio.Button>
        </Radio.Group>
      </div>

      {statistics.totalQuestions > 0 ? (
        <div>
          {/* 总体响应时间统计 */}
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ThunderboltOutlined style={{ color: '#722ed1' }} />
                总体响应时间
              </div>
            }
            size="small"
            style={{ marginBottom: '16px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <Text strong style={{ fontSize: '16px' }}>平均响应时间: </Text>
              <Text style={{ 
                color: getResponseTimeColor(statistics.averageResponseTime),
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {formatResponseTime(statistics.averageResponseTime)}
              </Text>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                基于 {statistics.totalQuestions} 次练习的统计结果
              </div>
            </div>
          </Card>

          {viewMode === 'heatmap' ? (
            <KanaHeatmap />
          ) : (
            <div>
              {/* 最快响应和最慢响应 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                {fastestChars.length > 0 && (
                  <Card 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FireOutlined style={{ color: '#52c41a' }} />
                        反应最快
                      </div>
                    }
                    size="small"
                    style={{ flex: 1 }}
                    bodyStyle={{ backgroundColor: '#f6ffed' }}
                  >
                    <List
                      size="small"
                      dataSource={fastestChars}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '4px 0', border: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '24px' }}>
                              {item.char}
                            </span>
                            <Tag color="green" style={{ margin: 0 }}>
                              {formatResponseTime(item.averageResponseTime)}
                            </Tag>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}

                {slowestChars.length > 0 && (
                  <Card 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FireOutlined style={{ color: '#ff4d4f' }} />
                        反应最慢
                      </div>
                    }
                    size="small"
                    style={{ flex: 1 }}
                    bodyStyle={{ backgroundColor: '#fff2f0' }}
                  >
                    <List
                      size="small"
                      dataSource={slowestChars}
                      renderItem={(item) => (
                        <List.Item style={{ padding: '4px 0', border: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', minWidth: '24px' }}>
                              {item.char}
                            </span>
                            <Tag color="red" style={{ margin: 0 }}>
                              {formatResponseTime(item.averageResponseTime)}
                            </Tag>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </div>

              <Divider />

              {/* 完整的响应时间排行榜 */}
              <Card 
                title="完整响应时间排行榜" 
                size="small"
                bodyStyle={{ maxHeight: '400px', overflowY: 'auto' }}
              >
                <List
                  size="small"
                  dataSource={allChars}
                  renderItem={(item, index) => (
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                        <span style={{ 
                          minWidth: '20px', 
                          textAlign: 'right', 
                          fontSize: '12px', 
                          color: '#999' 
                        }}>
                          #{index + 1}
                        </span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '30px' }}>
                          {item.char}
                        </span>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Text style={{ 
                            fontSize: '14px', 
                            color: getResponseTimeColor(item.averageResponseTime),
                            fontWeight: 'bold',
                            minWidth: '60px'
                          }}>
                            {formatResponseTime(item.averageResponseTime)}
                          </Text>
                          <Text style={{ fontSize: '11px', color: '#999' }}>
                            {item.attempts} 次练习
                          </Text>
                          {item.fastestResponseTime > 0 && item.slowestResponseTime > 0 && (
                            <Text style={{ fontSize: '11px', color: '#999' }}>
                              {formatResponseTime(item.fastestResponseTime)} ~ {formatResponseTime(item.slowestResponseTime)}
                            </Text>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">还没有响应时间数据，开始练习吧！</Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ResponseTimeAnalysis;
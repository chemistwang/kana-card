import React, { useState } from 'react';
import { Typography, Card, Progress, Select } from 'antd';
import { CheckCircleOutlined, TrophyOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import { kanaData } from '../data/kanaData';

const { Text, Title } = Typography;
const { Option } = Select;

const SimplifiedStats: React.FC = () => {
  const { statistics } = useKanaStore();
  const [sortBy, setSortBy] = useState<'kana-order' | 'response-time' | 'accuracy'>('response-time');

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

  // 获取所有字符的统计信息
  const getAllCharacterStats = () => {
    const allChars: Array<{
      char: string;
      attempts: number;
      correct: number;
      accuracy: number;
      averageResponseTime: number;
    }> = [];

    // 遍历所有假名数据
    kanaData.forEach(row => {
      row.characters.forEach(charData => {
        // 处理平假名统计
        const hiraganaStats = statistics.characterStats[charData.hiragana];
        if (hiraganaStats) {
          allChars.push({
            char: charData.hiragana,
            ...hiraganaStats
          });
        } else {
          allChars.push({
            char: charData.hiragana,
            attempts: 0,
            correct: 0,
            accuracy: 0,
            averageResponseTime: 0
          });
        }

        // 处理片假名统计
        const katakanaStats = statistics.characterStats[charData.katakana];
        if (katakanaStats) {
          allChars.push({
            char: charData.katakana,
            ...katakanaStats
          });
        } else {
          allChars.push({
            char: charData.katakana,
            attempts: 0,
            correct: 0,
            accuracy: 0,
            averageResponseTime: 0
          });
        }
      });
    });

    return allChars;
  };

  // 获取按响应时间排序的字符（从慢到快）
  const getSortedChars = () => {
    const allChars = getAllCharacterStats();
    
    switch (sortBy) {
      case 'response-time':
        return allChars
          .filter(item => item.attempts > 0 && item.averageResponseTime > 0)
          .sort((a, b) => b.averageResponseTime - a.averageResponseTime) // 从慢到快
          .slice(0, 15);
      
      case 'accuracy':
        return allChars
          .filter(item => item.attempts > 0)
          .sort((a, b) => a.accuracy - b.accuracy) // 从低到高
          .slice(0, 15);
      
      case 'kana-order':
      default:
        return allChars.filter(item => item.attempts > 0).slice(0, 20);
    }
  };

  const sortedChars = getSortedChars();
  
  // 计算最大回答次数，用于计算进度条比例
  const maxAttempts = Math.max(...sortedChars.map(char => char.attempts), 1);
  const accuracyPercentage = statistics.totalQuestions > 0 ? 
    Math.round((statistics.correctAnswers / statistics.totalQuestions) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 核心统计 - 双层进度条 */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrophyOutlined style={{ color: '#1890ff' }} />
            学习统计概览
          </div>
        }
        size="small"
        style={{ backgroundColor: '#fafafa' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
          {/* 总答题数 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1890ff' }}>
              {statistics.totalQuestions}
            </div>
            <Text type="secondary">答题总数</Text>
          </div>
          
          {/* 正确答题数 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#52c41a' }}>
              {statistics.correctAnswers}
            </div>
            <Text type="secondary">回答正确</Text>
          </div>
          
          {/* 平均响应时间 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: 'bold', 
              color: getResponseTimeColor(statistics.averageResponseTime) 
            }}>
              {formatResponseTime(statistics.averageResponseTime)}
            </div>
            <Text type="secondary">平均响应</Text>
          </div>
        </div>

        {/* 双层进度条 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '8px' 
          }}>
            <Text strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              正确率
            </Text>
            <Text style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: accuracyPercentage >= 80 ? '#52c41a' : 
                     accuracyPercentage >= 60 ? '#faad14' : '#ff4d4f' 
            }}>
              {accuracyPercentage}%
            </Text>
          </div>
          
          {/* 外层进度条 - 总答题数的视觉表示 */}
          <div style={{ position: 'relative' }}>
            <Progress
              percent={100} // 总是100%，表示总答题数
              strokeColor="#e6f7ff"
              trailColor="#f0f0f0"
              strokeWidth={20}
              showInfo={false}
            />
            {/* 内层进度条 - 正确答题数 */}
            <Progress
              percent={accuracyPercentage}
              strokeColor={{
                '0%': '#52c41a',
                '100%': '#73d13d',
              }}
              strokeWidth={20}
              showInfo={false}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>0</span>
            <span>{statistics.totalQuestions} 题</span>
          </div>
        </div>
      </Card>

      {/* 字符级详细统计 */}
      {sortedChars.length > 0 && (
        <Card 
          title={
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SortAscendingOutlined style={{ color: '#722ed1' }} />
                字符详细统计
              </div>
              <Select
                value={sortBy}
                onChange={setSortBy}
                size="small"
                style={{ width: 150 }}
              >
                <Option value="response-time">响应时间（慢→快）</Option>
                <Option value="accuracy">准确率（低→高）</Option>
                <Option value="kana-order">五十音顺序</Option>
              </Select>
            </div>
          }
          size="small"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedChars.map((item, index) => {
              const accuracyPercent = item.attempts > 0 ? Math.round(item.accuracy * 100) : 0;
              // 计算进度条比例 - 相对于最大回答次数
              const totalAttemptsPercent = (item.attempts / maxAttempts) * 100;
              const correctAttemptsPercent = (item.correct / maxAttempts) * 100;
              
              return (
                <div 
                  key={`${item.char}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px',
                    backgroundColor: '#fafafa',
                    borderRadius: '6px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                  {/* 排名 */}
                  {sortBy === 'response-time' && (
                    <div style={{
                      minWidth: '40px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#999',
                      fontWeight: 'bold'
                    }}>
                      #{index + 1}
                    </div>
                  )}

                  {/* 字符 */}
                  <div style={{ 
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '28px', 
                      fontWeight: 'bold',
                      color: '#1890ff'
                    }}>
                      {item.char}
                    </span>
                  </div>

                  {/* 练习次数 */}
                  <div style={{ 
                    minWidth: '120px',
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      {item.correct}/{item.attempts} 次正确
                    </Text>
                  </div>

                  {/* 双层进度条 - 占据主要空间 */}
                  <div style={{ 
                    flex: 1, 
                    margin: '0 20px',
                    position: 'relative'
                  }}>
                    {/* 外层进度条 - 总回答次数 */}
                    <Progress
                      percent={totalAttemptsPercent}
                      strokeColor="#e6f7ff"
                      strokeWidth={16}
                      showInfo={false}
                    />
                    {/* 内层进度条 - 正确回答次数 */}
                    <Progress
                      percent={correctAttemptsPercent}
                      strokeColor={
                        accuracyPercent >= 80 ? '#52c41a' : 
                        accuracyPercent >= 60 ? '#faad14' : '#ff4d4f'
                      }
                      strokeWidth={16}
                      showInfo={false}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%'
                      }}
                    />
                  </div>

                  {/* 正确率 */}
                  <div style={{ 
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    <Text style={{ 
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: accuracyPercent >= 80 ? '#52c41a' : 
                             accuracyPercent >= 60 ? '#faad14' : '#ff4d4f'
                    }}>
                      {accuracyPercent}%
                    </Text>
                  </div>

                  {/* 响应时间 */}
                  <div style={{ 
                    minWidth: '80px',
                    textAlign: 'center'
                  }}>
                    {item.averageResponseTime > 0 ? (
                      <Text style={{ 
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: getResponseTimeColor(item.averageResponseTime)
                      }}>
                        {formatResponseTime(item.averageResponseTime)}
                      </Text>
                    ) : (
                      <Text type="secondary">-</Text>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {statistics.totalQuestions === 0 && (
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <Title level={4} type="secondary">开始练习来查看统计数据</Title>
          <Text type="secondary">完成几道题目后，这里将显示您的学习进度和响应时间分析</Text>
        </Card>
      )}
    </div>
  );
};

export default SimplifiedStats;
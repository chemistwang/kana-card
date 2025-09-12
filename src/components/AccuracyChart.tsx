import React, { useState, useMemo } from 'react';
import { Typography, Card, Select } from 'antd';
import { Column } from '@ant-design/charts';
import { useKanaStore } from '../store/useKanaStore';
import { kanaData } from '../data/kanaData';

const { Text } = Typography;
const { Option } = Select;

interface ChartDataItem {
  character: string;
  accuracy: number;
  attempts: number;
  correct: number;
  averageResponseTime: number;
  displayOrder: number;
  type: 'hiragana' | 'katakana';
}

const AccuracyChart: React.FC = () => {
  const { statistics } = useKanaStore();
  const [sortBy, setSortBy] = useState<'kana-order' | 'accuracy-desc' | 'accuracy-asc'>('kana-order');

  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  const chartData = useMemo(() => {
    const data: ChartDataItem[] = [];
    let displayOrder = 0;

    kanaData.forEach(row => {
      row.characters.forEach(char => {
        // 添加平假名
        const hiraganaStats = statistics.characterStats[char.hiragana];
        if (hiraganaStats && hiraganaStats.attempts > 0) {
          data.push({
            character: char.hiragana,
            accuracy: Math.round(hiraganaStats.accuracy * 100),
            attempts: hiraganaStats.attempts,
            correct: hiraganaStats.correct,
            averageResponseTime: hiraganaStats.averageResponseTime,
            displayOrder: displayOrder,
            type: 'hiragana'
          });
        } else {
          data.push({
            character: char.hiragana,
            accuracy: 0,
            attempts: 0,
            correct: 0,
            averageResponseTime: 0,
            displayOrder: displayOrder,
            type: 'hiragana'
          });
        }
        displayOrder++;
        
        // 添加片假名
        const katakanaStats = statistics.characterStats[char.katakana];
        if (katakanaStats && katakanaStats.attempts > 0) {
          data.push({
            character: char.katakana,
            accuracy: Math.round(katakanaStats.accuracy * 100),
            attempts: katakanaStats.attempts,
            correct: katakanaStats.correct,
            averageResponseTime: katakanaStats.averageResponseTime,
            displayOrder: displayOrder,
            type: 'katakana'
          });
        } else {
          data.push({
            character: char.katakana,
            accuracy: 0,
            attempts: 0,
            correct: 0,
            averageResponseTime: 0,
            displayOrder: displayOrder,
            type: 'katakana'
          });
        }
        displayOrder++;
      });
    });

    // 根据排序选项排序
    switch (sortBy) {
      case 'accuracy-desc':
        return data.sort((a, b) => {
          if (a.attempts === 0 && b.attempts === 0) return 0;
          if (a.attempts === 0) return 1;
          if (b.attempts === 0) return -1;
          return b.accuracy - a.accuracy;
        });
      case 'accuracy-asc':
        return data.sort((a, b) => {
          if (a.attempts === 0 && b.attempts === 0) return 0;
          if (a.attempts === 0) return 1;
          if (b.attempts === 0) return -1;
          return a.accuracy - b.accuracy;
        });
      case 'kana-order':
      default:
        return data.sort((a, b) => a.displayOrder - b.displayOrder);
    }
  }, [statistics, sortBy]);

  const config = {
    data: chartData,
    xField: 'character',
    yField: 'accuracy',
    height: 400,
    scrollbar: {
      type: 'horizontal',
    },
    autoFit: false,
    width: Math.max(1200, chartData.length * 25),
    columnWidthRatio: 0.8,
    color: (datum: ChartDataItem) => {
      if (datum.attempts === 0) return '#f5f5f5';
      if (datum.accuracy >= 80) return '#52c41a';
      if (datum.accuracy >= 60) return '#faad14';
      return '#ff4d4f';
    },
    label: {
      position: 'top' as const,
      formatter: (datum: ChartDataItem) => {
        return datum.attempts > 0 ? `${datum.accuracy}%` : '';
      },
      style: {
        fontSize: 10,
        fontWeight: 'bold',
      },
    },
    meta: {
      accuracy: {
        min: 0,
        max: 100,
        tickInterval: 20,
      },
    },
    yAxis: {
      title: {
        text: '正确率 (%)',
        style: {
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
    },
    axis: {
      x: {
        labelFontSize: 12,
        labelTransform: 'rotate(45deg)',
        title: {
          text: '假名字符',
          style: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        },
      },
    },
    tooltip: {
      formatter: (datum: ChartDataItem) => {
        const typeText = datum.type === 'hiragana' ? '平假名' : '片假名';
        if (datum.attempts === 0) {
          return {
            name: '字符',
            value: `${datum.character} (${typeText}) - 尚未练习`,
          };
        }
        return {
          name: '统计信息',
          value: `${datum.character} (${typeText})\n正确率: ${datum.accuracy}%\n练习次数: ${datum.attempts}\n正确次数: ${datum.correct}\n平均响应时间: ${formatResponseTime(datum.averageResponseTime)}`,
        };
      },
    },
    interactions: [{ type: 'element-highlight-by-color' }, { type: 'element-link' }],
  };

  // 统计总结信息
  const practicedCount = chartData.filter(item => item.attempts > 0).length;
  const unpracticedCount = chartData.filter(item => item.attempts === 0).length;
  const highAccuracyCount = chartData.filter(item => item.attempts > 0 && item.accuracy >= 80).length;
  const lowAccuracyCount = chartData.filter(item => item.attempts > 0 && item.accuracy < 60).length;

  return (
    <Card 
      title="假名正确率分析图表"
      size="small"
      style={{ marginTop: '16px' }}
    >
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong>排序方式:</Text>
          <Select
            value={sortBy}
            onChange={setSortBy}
            size="small"
            style={{ width: 140 }}
          >
            <Option value="kana-order">五十音顺序</Option>
            <Option value="accuracy-desc">正确率（高→低）</Option>
            <Option value="accuracy-asc">正确率（低→高）</Option>
          </Select>
        </div>
      </div>

      {/* 颜色图例 */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '12px', 
        backgroundColor: '#fafafa', 
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <Text strong>正确率图例:</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#f5f5f5', 
            border: '1px solid #d9d9d9',
            borderRadius: '2px' 
          }} />
          <span>未练习</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#52c41a', 
            borderRadius: '2px' 
          }} />
          <span>≥ 80%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#faad14', 
            borderRadius: '2px' 
          }} />
          <span>60% ~ 79%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#ff4d4f', 
            borderRadius: '2px' 
          }} />
          <span>&lt; 60%</span>
        </div>
      </div>

      {/* 图表 */}
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <Column {...config} />
      </div>

      {/* 统计摘要 */}
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#f6ffed', 
        borderRadius: '6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '16px',
        fontSize: '14px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
            {practicedCount}
          </div>
          <Text type="secondary">已练习</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#faad14' }}>
            {unpracticedCount}
          </div>
          <Text type="secondary">未练习</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#52c41a' }}>
            {highAccuracyCount}
          </div>
          <Text type="secondary">高正确率</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4f' }}>
            {lowAccuracyCount}
          </div>
          <Text type="secondary">需加强</Text>
        </div>
      </div>
    </Card>
  );
};

export default AccuracyChart;
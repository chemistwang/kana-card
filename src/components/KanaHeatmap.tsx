import React, { useState } from 'react';
import { Typography, Card, Tooltip, Radio } from 'antd';
import { useKanaStore } from '../store/useKanaStore';
import { kanaData } from '../data/kanaData';

const { Text } = Typography;

interface KanaCell {
  char: string;
  responseTime: number;
  attempts: number;
  accuracy: number;
}

const KanaHeatmap: React.FC = () => {
  const { statistics } = useKanaStore();
  const [charType, setCharType] = useState<'hiragana' | 'katakana'>('hiragana');

  const getResponseTimeColor = (timeMs: number, attempts: number) => {
    if (attempts === 0) return '#f5f5f5'; // 未练习
    if (timeMs < 1500) return '#52c41a'; // 快 - 绿色
    if (timeMs < 3000) return '#faad14'; // 中等 - 黄色
    return '#ff4d4f'; // 慢 - 红色
  };

  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  const prepareHeatmapData = () => {
    const heatmapData: { [key: string]: KanaCell[] } = {};

    kanaData.forEach(row => {
      const rowData: KanaCell[] = [];
      
      row.characters.forEach(char => {
        const displayChar = charType === 'hiragana' ? char.hiragana : char.katakana;
        const charStats = statistics.characterStats[displayChar];
        
        rowData.push({
          char: displayChar,
          responseTime: charStats?.averageResponseTime || 0,
          attempts: charStats?.attempts || 0,
          accuracy: charStats?.accuracy || 0
        });
      });
      
      heatmapData[row.rowName] = rowData;
    });

    return heatmapData;
  };

  const heatmapData = prepareHeatmapData();

  return (
    <Card 
      title="五十音图热力图"
      size="small"
    >
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Text strong>字符类型:</Text>
        <Radio.Group 
          value={charType} 
          onChange={(e) => setCharType(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="hiragana">平假名</Radio.Button>
          <Radio.Button value="katakana">片假名</Radio.Button>
        </Radio.Group>
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
        fontSize: '12px'
      }}>
        <Text strong>响应时间图例:</Text>
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
          <span>&lt; 1.5s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#faad14', 
            borderRadius: '2px' 
          }} />
          <span>1.5s ~ 3s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            backgroundColor: '#ff4d4f', 
            borderRadius: '2px' 
          }} />
          <span>&gt; 3s</span>
        </div>
      </div>

      {/* 五十音图网格 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {Object.entries(heatmapData).map(([rowName, rowData]) => (
          <div key={rowName} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            {/* 行标签 */}
            <div style={{ 
              width: '50px', 
              textAlign: 'center', 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: '#666'
            }}>
              {rowName}
            </div>
            
            {/* 字符格子 */}
            {rowData.map((cell, index) => (
              <Tooltip
                key={`${rowName}-${index}`}
                title={
                  cell.attempts > 0 ? (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {cell.char}
                      </div>
                      <div>平均响应时间: {formatResponseTime(cell.responseTime)}</div>
                      <div>练习次数: {cell.attempts}</div>
                      <div>准确率: {Math.round(cell.accuracy)}%</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        {cell.char}
                      </div>
                      <div>尚未练习</div>
                    </div>
                  )
                }
                placement="top"
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: getResponseTimeColor(cell.responseTime, cell.attempts),
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: cell.attempts === 0 ? '#bfbfbf' : '#fff',
                    textShadow: cell.attempts > 0 ? '1px 1px 2px rgba(0,0,0,0.3)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: 'scale(1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {cell.char}
                </div>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>

      {/* 统计摘要 */}
      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#f6ffed', 
        borderRadius: '6px',
        fontSize: '12px',
        display: 'flex',
        justifyContent: 'space-around'
      }}>
        <div>
          <Text strong>已练习字符: </Text>
          <Text>{Object.values(heatmapData).flat().filter(cell => cell.attempts > 0).length}</Text>
        </div>
        <div>
          <Text strong>未练习字符: </Text>
          <Text>{Object.values(heatmapData).flat().filter(cell => cell.attempts === 0).length}</Text>
        </div>
        <div>
          <Text strong>反应较慢字符: </Text>
          <Text style={{ color: '#ff4d4f' }}>
            {Object.values(heatmapData).flat().filter(cell => cell.attempts > 0 && cell.responseTime > 3000).length}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default KanaHeatmap;
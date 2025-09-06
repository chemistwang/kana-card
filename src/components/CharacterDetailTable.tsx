import React, { useState, useMemo } from 'react';
import { Typography, Table, Input, Card, Tag, Progress, Select, Space } from 'antd';
import { SearchOutlined, TableOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import { getAllCharacters } from '../data/kanaData';

const { Text } = Typography;
const { Option } = Select;

interface CharacterDetail {
  character: string;
  romaji: string;
  attempts: number;
  correct: number;
  accuracy: number;
  averageResponseTime: number;
  fastestResponseTime: number;
  slowestResponseTime: number;
  lastAttempt: number;
}

const CharacterDetailTable: React.FC = () => {
  const { statistics } = useKanaStore();
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'accuracy' | 'responseTime' | 'attempts'>('accuracy');
  const [filterBy, setFilterBy] = useState<'all' | 'practiced' | 'unpracticed'>('all');

  const formatResponseTime = (timeMs: number) => {
    if (timeMs === 0) return '--';
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  const getResponseTimeColor = (timeMs: number) => {
    if (timeMs === 0) return '#d9d9d9';
    if (timeMs < 1500) return '#52c41a';
    if (timeMs < 3000) return '#faad14';
    return '#ff4d4f';
  };

  const formatLastAttempt = (timestamp: number) => {
    if (timestamp === 0) return '从未练习';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 准备表格数据
  const tableData = useMemo(() => {
    const allChars = getAllCharacters();
    const details: CharacterDetail[] = [];

    // 处理平假名
    allChars.forEach(char => {
      const hiraganaStats = statistics.characterStats[char.hiragana];
      if (hiraganaStats || filterBy !== 'unpracticed') {
        details.push({
          character: char.hiragana,
          romaji: char.romaji,
          attempts: hiraganaStats?.attempts || 0,
          correct: hiraganaStats?.correct || 0,
          accuracy: hiraganaStats?.accuracy || 0,
          averageResponseTime: hiraganaStats?.averageResponseTime || 0,
          fastestResponseTime: hiraganaStats?.fastestResponseTime || 0,
          slowestResponseTime: hiraganaStats?.slowestResponseTime || 0,
          lastAttempt: hiraganaStats?.lastAttempt || 0,
        });
      }
      
      const katakanaStats = statistics.characterStats[char.katakana];
      if (katakanaStats || filterBy !== 'unpracticed') {
        details.push({
          character: char.katakana,
          romaji: char.romaji,
          attempts: katakanaStats?.attempts || 0,
          correct: katakanaStats?.correct || 0,
          accuracy: katakanaStats?.accuracy || 0,
          averageResponseTime: katakanaStats?.averageResponseTime || 0,
          fastestResponseTime: katakanaStats?.fastestResponseTime || 0,
          slowestResponseTime: katakanaStats?.slowestResponseTime || 0,
          lastAttempt: katakanaStats?.lastAttempt || 0,
        });
      }
    });

    // 过滤
    let filteredData = details;
    
    if (filterBy === 'practiced') {
      filteredData = details.filter(item => item.attempts > 0);
    } else if (filterBy === 'unpracticed') {
      filteredData = details.filter(item => item.attempts === 0);
    }

    if (searchText) {
      filteredData = filteredData.filter(item => 
        item.character.includes(searchText) || 
        item.romaji.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // 排序
    filteredData.sort((a, b) => {
      if (sortBy === 'accuracy') {
        if (a.attempts === 0 && b.attempts === 0) return 0;
        if (a.attempts === 0) return 1;
        if (b.attempts === 0) return -1;
        return a.accuracy - b.accuracy;
      } else if (sortBy === 'responseTime') {
        if (a.averageResponseTime === 0 && b.averageResponseTime === 0) return 0;
        if (a.averageResponseTime === 0) return 1;
        if (b.averageResponseTime === 0) return -1;
        return b.averageResponseTime - a.averageResponseTime; // 慢的在前
      } else {
        return b.attempts - a.attempts; // 练习次数多的在前
      }
    });

    return filteredData;
  }, [statistics, searchText, sortBy, filterBy]);

  const columns = [
    {
      title: '字符',
      dataIndex: 'character',
      key: 'character',
      width: 60,
      render: (char: string) => (
        <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
          {char}
        </span>
      ),
    },
    {
      title: '罗马音',
      dataIndex: 'romaji',
      key: 'romaji',
      width: 80,
      render: (romaji: string) => (
        <Text code>{romaji}</Text>
      ),
    },
    {
      title: '练习次数',
      dataIndex: 'attempts',
      key: 'attempts',
      width: 80,
      render: (attempts: number) => (
        <Text>{attempts === 0 ? '--' : attempts}</Text>
      ),
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 120,
      render: (accuracy: number, record: CharacterDetail) => {
        if (record.attempts === 0) {
          return <Text type="secondary">--</Text>;
        }
        
        const color = accuracy >= 80 ? '#52c41a' : accuracy >= 60 ? '#faad14' : '#ff4d4f';
        return (
          <div>
            <Text style={{ color, fontWeight: 'bold' }}>
              {Math.round(accuracy)}%
            </Text>
            <Progress
              percent={accuracy}
              size="small"
              strokeColor={color}
              showInfo={false}
              style={{ marginTop: '2px' }}
            />
          </div>
        );
      },
    },
    {
      title: '平均响应时间',
      dataIndex: 'averageResponseTime',
      key: 'averageResponseTime',
      width: 120,
      render: (time: number) => (
        <Tag color={getResponseTimeColor(time) === '#d9d9d9' ? 'default' : undefined} style={{ 
          color: getResponseTimeColor(time),
          borderColor: getResponseTimeColor(time)
        }}>
          {formatResponseTime(time)}
        </Tag>
      ),
    },
    {
      title: '响应时间范围',
      key: 'responseRange',
      width: 140,
      render: (record: CharacterDetail) => {
        if (record.fastestResponseTime === 0 || record.slowestResponseTime === 0) {
          return <Text type="secondary">--</Text>;
        }
        return (
          <Text style={{ fontSize: '11px' }}>
            {formatResponseTime(record.fastestResponseTime)} ~ {formatResponseTime(record.slowestResponseTime)}
          </Text>
        );
      },
    },
    {
      title: '最后练习',
      dataIndex: 'lastAttempt',
      key: 'lastAttempt',
      render: (timestamp: number) => (
        <Text style={{ fontSize: '11px', color: '#999' }}>
          {formatLastAttempt(timestamp)}
        </Text>
      ),
    },
  ];

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TableOutlined style={{ color: '#1890ff' }} />
          字符详细统计
          <Tag color="blue">{tableData.length} 个字符</Tag>
        </div>
      }
      size="small"
    >
      {/* 搜索和过滤控件 */}
      <div style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Input
            placeholder="搜索字符或罗马音..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          
          <Select
            value={filterBy}
            onChange={setFilterBy}
            style={{ width: 120 }}
          >
            <Option value="all">全部字符</Option>
            <Option value="practiced">已练习</Option>
            <Option value="unpracticed">未练习</Option>
          </Select>
          
          <Select
            value={sortBy}
            onChange={setSortBy}
            style={{ width: 140 }}
            prefix={<SortAscendingOutlined />}
          >
            <Option value="accuracy">按准确率排序</Option>
            <Option value="responseTime">按响应时间排序</Option>
            <Option value="attempts">按练习次数排序</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        rowKey="character"
        size="small"
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 个字符`,
        }}
        scroll={{ y: 400 }}
      />

      {/* 统计摘要 */}
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        backgroundColor: '#fafafa', 
        borderRadius: '6px',
        display: 'flex',
        justifyContent: 'space-around',
        fontSize: '12px'
      }}>
        <div>
          <Text strong>总字符数: </Text>
          <Text>{tableData.length}</Text>
        </div>
        <div>
          <Text strong>已练习: </Text>
          <Text style={{ color: '#52c41a' }}>
            {tableData.filter(item => item.attempts > 0).length}
          </Text>
        </div>
        <div>
          <Text strong>未练习: </Text>
          <Text style={{ color: '#faad14' }}>
            {tableData.filter(item => item.attempts === 0).length}
          </Text>
        </div>
        <div>
          <Text strong>需加强: </Text>
          <Text style={{ color: '#ff4d4f' }}>
            {tableData.filter(item => item.attempts > 0 && item.accuracy < 70).length}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default CharacterDetailTable;
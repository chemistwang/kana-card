import React from 'react';
import { Typography, Segmented, Row, Col, Switch, Divider } from 'antd';
import { FastForwardOutlined, ReloadOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';
import { PracticeMode, QuestionType } from '../types/kana';

const { Title, Text } = Typography;

const ModeSelector: React.FC = () => {
  const { settings, updateSettings, resetStatistics } = useKanaStore();

  const practiceModeOptions = [
    { label: '平假名', value: 'hiragana' as PracticeMode },
    { label: '片假名', value: 'katakana' as PracticeMode },
    { label: '混合', value: 'mixed' as PracticeMode },
  ];

  const questionTypeOptions = [
    { label: '假名→罗马音', value: 'kana-to-romaji' as QuestionType },
    { label: '假名→读音', value: 'kana-to-pronunciation' as QuestionType },
    { label: '罗马音→假名', value: 'romaji-to-kana' as QuestionType },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: '24px' }}>
        练习设置
      </Title>

      <Row gutter={[16, 24]}>
        <Col xs={24} sm={12}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              练习模式
            </Text>
            <Segmented
              options={practiceModeOptions}
              value={settings.practiceMode}
              onChange={(value) => updateSettings({ practiceMode: value as PracticeMode })}
              block
            />
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
              题目类型
            </Text>
            <Segmented
              options={questionTypeOptions}
              value={settings.questionType}
              onChange={(value) => updateSettings({ questionType: value as QuestionType })}
              block
              style={{ fontSize: '12px' }}
            />
          </div>
        </Col>
      </Row>

      <Divider style={{ margin: '24px 0 16px 0' }} />

      <Row gutter={[24, 16]}>
        <Col xs={12} sm={6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FastForwardOutlined style={{ color: '#52c41a' }} />
            <Text style={{ fontSize: '14px' }}>自动下一题</Text>
            <Switch
              size="small"
              checked={settings.autoNext}
              onChange={(checked) => updateSettings({ autoNext: checked })}
            />
          </div>
        </Col>

        <Col xs={12} sm={6}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              color: '#ff4d4f'
            }}
            onClick={resetStatistics}
          >
            <ReloadOutlined />
            <Text style={{ fontSize: '14px', color: '#ff4d4f' }}>重置统计</Text>
          </div>
        </Col>
      </Row>

      <div style={{ marginTop: '16px', color: '#999', fontSize: '12px' }}>
        <div>• 平假名：日语中最基础的文字系统</div>
        <div>• 片假名：主要用于外来语和专有名词</div>
        <div>• 混合模式：随机练习平假名和片假名</div>
      </div>
    </div>
  );
};

export default ModeSelector;
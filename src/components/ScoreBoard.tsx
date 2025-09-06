import React from 'react';
import { Typography, Statistic, Progress, Row, Col, Divider } from 'antd';
import { TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined, FireOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';

const { Title } = Typography;

const ScoreBoard: React.FC = () => {
  const { statistics, sessionQuestions, sessionCorrect, sessionStartTime } = useKanaStore();

  const sessionAccuracy = sessionQuestions > 0 ? Math.round((sessionCorrect / sessionQuestions) * 100) : 0;
  const sessionTime = Math.round((Date.now() - sessionStartTime) / 1000 / 60); // minutes
  
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return '#52c41a';
    if (accuracy >= 80) return '#faad14';
    if (accuracy >= 70) return '#fa8c16';
    return '#ff4d4f';
  };

  const getStreakCount = () => {
    // 计算当前连续正确次数
    let streak = 0;
    for (let i = statistics.totalQuestions - 1; i >= 0; i--) {
      // 这里需要从answerHistory中获取最近的结果
      // 暂时简化处理
      break;
    }
    return streak;
  };

  // 格式化响应时间显示
  const formatResponseTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${Math.round(timeMs)}ms`;
    } else {
      return `${(timeMs / 1000).toFixed(1)}s`;
    }
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrophyOutlined style={{ color: '#faad14' }} />
        成绩统计
      </Title>

      {/* 当前会话统计 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={5} style={{ marginBottom: '16px', color: '#1890ff' }}>
          本次练习
        </Title>
        
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="题数"
              value={sessionQuestions}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="正确"
              value={sessionCorrect}
              valueStyle={{ fontSize: '18px', color: '#52c41a' }}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="时长"
              value={sessionTime}
              suffix="分钟"
              valueStyle={{ fontSize: '18px' }}
            />
          </Col>
        </Row>

        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>正确率</span>
            <span style={{ color: getAccuracyColor(sessionAccuracy), fontWeight: 'bold' }}>
              {sessionAccuracy}%
            </span>
          </div>
          <Progress
            percent={sessionAccuracy}
            strokeColor={getAccuracyColor(sessionAccuracy)}
            size="small"
            showInfo={false}
          />
        </div>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 总体统计 */}
      <div>
        <Title level={5} style={{ marginBottom: '16px', color: '#722ed1' }}>
          总体表现
        </Title>
        
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="总题数"
              value={statistics.totalQuestions}
              prefix={<CheckCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ fontSize: '16px' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="总正确"
              value={statistics.correctAnswers}
              valueStyle={{ fontSize: '16px', color: '#52c41a' }}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: '16px' }}>
          <Col span={12}>
            <Statistic
              title="错误数"
              value={statistics.incorrectAnswers}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="连击"
              value={getStreakCount()}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ fontSize: '16px', color: '#fa8c16' }}
            />
          </Col>
        </Row>

        {statistics.averageResponseTime > 0 && (
          <Row gutter={16} style={{ marginTop: '16px' }}>
            <Col span={24}>
              <Statistic
                title="平均响应时间"
                value={formatResponseTime(statistics.averageResponseTime)}
                valueStyle={{ 
                  fontSize: '16px', 
                  color: statistics.averageResponseTime < 2000 ? '#52c41a' : '#faad14' 
                }}
              />
            </Col>
          </Row>
        )}

        <div style={{ marginTop: '16px' }}>
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
            <span>总体正确率</span>
            <span style={{ color: getAccuracyColor(statistics.accuracy), fontWeight: 'bold' }}>
              {Math.round(statistics.accuracy)}%
            </span>
          </div>
          <Progress
            percent={Math.round(statistics.accuracy)}
            strokeColor={getAccuracyColor(statistics.accuracy)}
            size="small"
            showInfo={false}
          />
        </div>
      </div>

      {/* 成就提示 */}
      {sessionAccuracy === 100 && sessionQuestions >= 5 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'linear-gradient(45deg, #faad14, #fa8c16)',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          🎉 完美表现！连续答对{sessionQuestions}题！
        </div>
      )}

      {sessionQuestions >= 20 && sessionAccuracy >= 90 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'linear-gradient(45deg, #52c41a, #389e0d)',
          borderRadius: '8px',
          color: 'white',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          ⭐ 学霸模式！高质量完成20+题目！
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
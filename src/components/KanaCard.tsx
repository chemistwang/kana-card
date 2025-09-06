import React, { useState, useEffect } from 'react';
import { Card, Typography, Input, Button, Space, Alert, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useKanaStore } from '../store/useKanaStore';

const { Title, Text } = Typography;

const KanaCard: React.FC = () => {
  const [userAnswer, setUserAnswer] = useState('');
  const [submittedAnswer, setSubmittedAnswer] = useState('');
  const { 
    currentQuestion, 
    submitAnswer, 
    generateNewQuestion, 
    showAnswer, 
    settings 
  } = useKanaStore();

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      setSubmittedAnswer(userAnswer.trim());
      submitAnswer(userAnswer.trim());
      setUserAnswer('');
    }
  };

  const handleNext = () => {
    generateNewQuestion();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showAnswer) {
      handleSubmit();
    } else if (e.key === 'Enter' && showAnswer) {
      handleNext();
    }
  };

  useEffect(() => {
    setUserAnswer('');
    setSubmittedAnswer('');
  }, [currentQuestion]);

  if (!currentQuestion) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Title level={3}>正在加载...</Title>
        </div>
      </Card>
    );
  }

  const getQuestionPrompt = () => {
    switch (currentQuestion.questionType) {
      case 'kana-to-romaji':
        return '请输入罗马音：';
      case 'kana-to-pronunciation':
        return '请输入读音：';
      case 'romaji-to-kana':
        return `请输入${settings.practiceMode === 'hiragana' ? '平假名' : 
          settings.practiceMode === 'katakana' ? '片假名' : '假名'}：`;
      default:
        return '请输入答案：';
    }
  };

  const getAnswerDisplay = () => {
    const { character, questionType } = currentQuestion;
    switch (questionType) {
      case 'kana-to-romaji':
        return character.romaji;
      case 'kana-to-pronunciation':
        return character.pronunciation;
      case 'romaji-to-kana':
        if (settings.practiceMode === 'hiragana') {
          return character.hiragana;
        } else if (settings.practiceMode === 'katakana') {
          return character.katakana;
        } else {
          return `${character.hiragana} / ${character.katakana}`;
        }
      default:
        return character.romaji;
    }
  };

  const isAnswerCorrect = currentQuestion.correctAnswers.some(
    answer => answer.toLowerCase() === submittedAnswer.toLowerCase().trim()
  );

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          fontSize: '120px', 
          fontWeight: 'bold', 
          color: '#1890ff',
          fontFamily: 'serif',
          lineHeight: '1.2',
          textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
        }}>
          {currentQuestion.displayText}
        </div>
        
        <Divider />
        
        <Text style={{ fontSize: '18px', color: '#666' }}>
          {getQuestionPrompt()}
        </Text>
      </div>

      {showAnswer ? (
        <div style={{ marginBottom: '24px' }}>
          <Alert
            message={
              <div>
                <Space align="center">
                  {isAnswerCorrect ? (
                    <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />
                  )}
                  <Text strong style={{ fontSize: '16px' }}>
                    {isAnswerCorrect ? '正确！' : '错误'}
                  </Text>
                </Space>
                <div style={{ marginTop: '8px' }}>
                  <Text>正确答案：</Text>
                  <Text strong style={{ fontSize: '18px', marginLeft: '8px' }}>
                    {getAnswerDisplay()}
                  </Text>
                </div>
                {!isAnswerCorrect && (
                  <div style={{ marginTop: '4px' }}>
                    <Text>您的答案：</Text>
                    <Text style={{ marginLeft: '8px' }}>
                      {submittedAnswer || '(未输入)'}
                    </Text>
                  </div>
                )}
              </div>
            }
            type={isAnswerCorrect ? 'success' : 'error'}
            showIcon={false}
            style={{ textAlign: 'left' }}
          />
          
          {!settings.autoNext && (
            <Button
              type="primary"
              size="large"
              onClick={handleNext}
              icon={<ArrowRightOutlined />}
              style={{ marginTop: '16px' }}
            >
              下一题
            </Button>
          )}
        </div>
      ) : (
        <div style={{ marginBottom: '24px' }}>
          <Input
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="在此输入答案"
            size="large"
            style={{ 
              fontSize: '20px', 
              textAlign: 'center',
              maxWidth: '300px',
              margin: '0 auto'
            }}
            autoFocus
          />
          
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!userAnswer.trim()}
            style={{ marginTop: '16px', marginLeft: '12px' }}
          >
            提交答案
          </Button>
        </div>
      )}

      <div style={{ color: '#999', fontSize: '14px' }}>
        <div>当前模式：
          {settings.practiceMode === 'hiragana' ? '平假名' : 
           settings.practiceMode === 'katakana' ? '片假名' : '混合模式'}
        </div>
        <div>题目类型：
          {settings.questionType === 'kana-to-romaji' ? '假名→罗马音' :
           settings.questionType === 'kana-to-pronunciation' ? '假名→读音' : '罗马音→假名'}
        </div>
      </div>
    </div>
  );
};

export default KanaCard;
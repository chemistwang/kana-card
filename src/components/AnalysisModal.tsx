import React from "react";
import { Modal, Typography, Button } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import AccuracyChart from "./AccuracyChart";

const { Title } = Typography;

interface AnalysisModalProps {
  open: boolean;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BarChartOutlined style={{ color: "#722ed1", fontSize: "20px" }} />
          <Title level={4} style={{ margin: 0 }}>
            学习分析
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
      bodyStyle={{
        padding: "20px",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* 中间部分：正确率图表 */}
        <AccuracyChart />
      </div>
    </Modal>
  );
};

export default AnalysisModal;

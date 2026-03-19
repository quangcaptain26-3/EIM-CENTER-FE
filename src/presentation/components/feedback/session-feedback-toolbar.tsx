import { Download, Upload } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ExportExcelButton } from "@/presentation/components/common/export-excel-button";

export interface SessionFeedbackToolbarProps {
  /** Có hiển thị toolbar hay không (đã check quyền ở page) */
  visible: boolean;

  /** Trigger tải template */
  onDownloadTemplate: () => void;
  isDownloadingTemplate?: boolean;
  showDownloadTemplate?: boolean;

  /** Trigger export báo cáo */
  onExportReport: () => void;
  isExportingReport?: boolean;
  showExportReport?: boolean;

  /** Trigger mở modal import */
  onOpenImport: () => void;
  showImportFeedback?: boolean;
}

/**
 * Toolbar action cho trang Session Feedback.
 * Chỉ render UI; không chứa orchestration/network để tránh page rối trách nhiệm.
 */
export const SessionFeedbackToolbar = ({
  visible,
  onDownloadTemplate,
  isDownloadingTemplate = false,
  showDownloadTemplate = true,
  onExportReport,
  isExportingReport = false,
  showExportReport = true,
  onOpenImport,
  showImportFeedback = true,
}: SessionFeedbackToolbarProps) => {
  if (!visible) return null;

  return (
    <div className="flex gap-2">
      {showDownloadTemplate && (
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={onDownloadTemplate}
          disabled={isDownloadingTemplate || isExportingReport}
          loading={isDownloadingTemplate}
          title="Tải template chuẩn để nhập nhận xét buổi học"
        >
          {!isDownloadingTemplate && <Download className="w-4 h-4" />}
          <span>Tải template nhận xét</span>
        </Button>
      )}

      {showImportFeedback && (
        <Button
          variant="secondary"
          className="flex items-center gap-2"
          onClick={onOpenImport}
          disabled={isDownloadingTemplate || isExportingReport}
          title="Mở cửa sổ import nhận xét từ template"
        >
          <Upload className="w-4 h-4" />
          <span>Nhập nhận xét</span>
        </Button>
      )}

      {showExportReport && (
        <ExportExcelButton
          onExport={onExportReport}
          isLoading={isExportingReport}
          params={undefined}
          variant="primary"
          label="Xuất báo cáo nhận xét"
          title="Xuất báo cáo nhận xét. Lưu ý: file export có thể chứa nhiều buổi, không dùng để import vào 1 buổi."
        />
      )}
    </div>
  );
};


import { useMemo, useState, useRef } from "react";
import { Upload, ShieldAlert, FileText, CheckCircle2, Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useDownloadFeedbackTemplate, useImportFeedbackExcel } from "@/presentation/hooks/feedback/use-feedback-mutations";
import { toastAdapter } from "@/infrastructure/adapters/toast.adapter";
import { mapHttpError } from "@/infrastructure/http/http-error.mapper";

interface ImportFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export const ImportFeedbackModal = ({ isOpen, onClose, sessionId }: ImportFeedbackModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const importOrchestration = useImportFeedbackExcel(sessionId);
  const downloadTemplateMutation = useDownloadFeedbackTemplate(sessionId);
  const errors = importOrchestration.errors;

  const summary = useMemo(() => {
    if (!importOrchestration.result) return null;
    return {
      processedCount: importOrchestration.processedCount,
      successCount: importOrchestration.successCount,
      errorCount: importOrchestration.errorCount,
      hasErrors: importOrchestration.result.hasErrors ?? (importOrchestration.errorCount > 0 || errors.length > 0),
      partialSuccess: importOrchestration.result.partialSuccess ?? (importOrchestration.successCount > 0 && (importOrchestration.errorCount > 0 || errors.length > 0)),
    };
  }, [errors.length, importOrchestration]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      setClientError(null);
      importOrchestration.resetResult();
      setFile(selected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setClientError(null);
      importOrchestration.resetResult();
      setFile(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setClientError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateFile = (f: File | null): string | null => {
    if (!f) return "Vui lòng chọn file Excel để import.";
    if (!f.name.toLowerCase().endsWith(".xlsx")) {
      return "File không đúng định dạng. Vui lòng chọn file .xlsx";
    }
    return null;
  };

  const handleClose = () => {
    if (importOrchestration.isPending) return;
    onClose();
    clearFile();
    importOrchestration.resetResult();
  };

  const handleDownloadTemplate = async () => {
    try {
      // UI chỉ trigger download, không cần parse hay xử lý blob tại đây.
      await downloadTemplateMutation.mutateAsync();
      toastAdapter.info("Đang tải template...");
    } catch (err) {
      toastAdapter.error(mapHttpError(err));
    }
  };

  const handleImport = () => {
    const validation = validateFile(file);
    if (validation) {
      setClientError(validation);
      return;
    }

    setClientError(null);
    importOrchestration.resetResult();

    importOrchestration.importFeedback(file as File, {
      onSuccess: (data) => {
        // Không spam toast: kết quả + lỗi chi tiết đã hiển thị ngay trong modal.
        // Chỉ nên toast khi cần “điểm nhấn” tối thiểu cho người dùng.
        if (data.successCount > 0 && data.errorCount === 0) {
          toastAdapter.success(`Import thành công (${data.successCount}/${data.processedCount} dòng).`);
        }
      },
      onError: (err) => {
        toastAdapter.error(mapHttpError(err));
      },
    });
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={importOrchestration.isPending}>
        Đóng
      </Button>
      <Button
        variant="primary"
        onClick={handleImport}
        disabled={!file || importOrchestration.isPending}
        loading={importOrchestration.isPending}
      >
        {importOrchestration.isPending ? "Đang import..." : "Import"}
      </Button>
    </>
  );

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Nhập nhận xét từ Excel"
      footer={footer}
      className="max-w-3xl"
      closeOnOutsideClick={!importOrchestration.isPending}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-sm text-slate-600 leading-relaxed">
          Tải template đúng chuẩn cho buổi học này, nhập dữ liệu, rồi upload file <strong>.xlsx</strong> để import hàng loạt.
        </div>
        <Button
          variant="secondary"
          onClick={handleDownloadTemplate}
          disabled={downloadTemplateMutation.isPending || importOrchestration.isPending}
          loading={downloadTemplateMutation.isPending}
          className="shrink-0"
        >
          <Download className="w-4 h-4 mr-2" />
          Tải template
        </Button>
      </div>

      <div className="mt-4">
        {!file ? (
          <div
            className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-8 flex flex-col items-center justify-center text-center hover:bg-slate-100 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-white p-4 rounded-full shadow-sm mb-3">
              <Upload className="w-7 h-7 text-slate-700" />
            </div>
            <div className="text-sm font-semibold text-slate-900">
              Kéo thả file vào đây hoặc bấm để chọn
            </div>
            <div className="text-xs text-slate-500 mt-1">Chỉ hỗ trợ định dạng .xlsx</div>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-emerald-900 flex items-center gap-2">
                File đã chọn <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-sm text-emerald-800 truncate" title={file.name}>
                {file.name}
              </div>
              <div className="text-xs text-emerald-700 mt-1">{(file.size / 1024).toFixed(2)} KB</div>
            </div>
            <Button
              variant="ghost"
              type="button"
              onClick={clearFile}
              disabled={importOrchestration.isPending}
            >
              Đổi file
            </Button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
        />

        {clientError && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {clientError}
          </div>
        )}

        {importOrchestration.isError && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {mapHttpError(importOrchestration.error)}
          </div>
        )}

        <div className="mt-4 bg-amber-50 rounded-lg p-4 flex gap-3 border border-amber-100 text-amber-900 text-sm">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="leading-relaxed">
            <strong>Lưu ý:</strong> Giữ nguyên header và thứ tự cột của template. Không đổi các cột read-only (session_id,
            student_id, ...). Nếu có lỗi, hệ thống sẽ báo chi tiết theo từng dòng bên dưới.
            <div className="mt-2">
              Trường hợp <strong>“Thành công một phần”</strong> nghĩa là <strong>một số dòng đã được ghi vào hệ thống</strong>.
              Bạn chỉ cần sửa các dòng lỗi rồi import lại (các dòng đã thành công sẽ được upsert theo cùng khóa buổi học + học viên).
            </div>
            <div className="mt-2">
              <strong>Không dùng file “báo cáo export” nhiều buổi</strong> để import vào một buổi học. Vì import là theo từng
              buổi (<code>session_id</code> trong file phải khớp với buổi đang import), nên nếu file có nhiều <code>session_id</code>
              bạn sẽ gặp lỗi <strong>SESSION_MISMATCH</strong> và kết quả dễ thành “thành công một phần”.
            </div>
          </div>
        </div>
      </div>

      {summary && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-slate-900">Kết quả import</div>
              {summary.partialSuccess && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Thành công một phần
                </span>
              )}
              {!summary.partialSuccess && !summary.hasErrors && summary.successCount > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Thành công
                </span>
              )}
              {!summary.partialSuccess && summary.hasErrors && summary.successCount === 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                  Thất bại
                </span>
              )}
            </div>
            <div className="text-sm text-slate-700">
              <strong>{summary.successCount}</strong> thành công / <strong>{summary.processedCount}</strong> dòng {" · "}
              <strong className={summary.hasErrors ? "text-red-700" : "text-emerald-700"}>
                {summary.errorCount}
              </strong>{" "}
              lỗi
            </div>
          </div>

          {errors.length > 0 && (
            <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 text-xs font-semibold text-slate-700 border-b border-slate-200">
                Lỗi theo dòng
              </div>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white sticky top-0">
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-slate-200">
                      <th className="px-4 py-2 whitespace-nowrap">Row</th>
                      <th className="px-4 py-2 whitespace-nowrap">Column</th>
                      <th className="px-4 py-2 whitespace-nowrap">ErrorCode</th>
                      <th className="px-4 py-2 min-w-[320px]">Message</th>
                      <th className="px-4 py-2 min-w-[180px]">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((e, idx) => (
                      <tr key={`${e.rowIndex}-${e.errorCode}-${idx}`} className="border-b border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-900 whitespace-nowrap">{e.rowIndex}</td>
                        <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{e.columnKey ?? "-"}</td>
                        <td className="px-4 py-2 text-slate-700 whitespace-nowrap">{e.errorCode}</td>
                        <td className="px-4 py-2 text-slate-800">{e.message}</td>
                        <td className="px-4 py-2 text-slate-700 break-all">{e.value ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

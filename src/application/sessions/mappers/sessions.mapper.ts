/**
 * src/application/sessions/mappers/sessions.mapper.ts
 * Chịu trách nhiệm chuyển đổi (mapping) format của dữ liệu trả về từ API Backend 
 * sang format Domain Model để Frontend sử dụng trực tiếp
 */

import { SessionType } from "../../../domain/sessions/models/session.model";
import type { SessionModel } from "../../../domain/sessions/models/session.model";
import type { SessionDetailDto } from "../dto/sessions.dto";

/**
 * Helper class chứa các logic tĩnh để map từ DTO sang Model.
 */
export class SessionMapper {
  /**
   * Chuyển đổi dữ liệu đơn trị từ API Backend (SessionDetailDto) 
   * thành cấu trúc Model cho giao diện Frontend (SessionModel)
   * @param dto Đối tượng Session trả về từ API
   * @returns Phiên bản Session Model đã được ánh xạ với frontend
   */
  static toModel(dto: SessionDetailDto): SessionModel {
    // Backend trả về TEST/MIDTERM/FINAL/NORMAL.
    // Frontend quy ước sử dụng QUIZ thay cho TEST.
    let type: SessionType = SessionType.NORMAL;
    
    switch (dto.sessionType) {
      case "TEST":
      case "QUIZ":
        type = SessionType.QUIZ;
        break;
      case "MIDTERM":
        type = SessionType.MIDTERM;
        break;
      case "FINAL":
        type = SessionType.FINAL;
        break;
      case "NORMAL":
      default:
        type = SessionType.NORMAL;
        break;
    }

    return {
      id: dto.id,
      classId: dto.classId,
      sessionDate: dto.sessionDate,
      unitNo: dto.unitNo,
      lessonNo: dto.lessonNo,
      lessonPattern: dto.lessonPattern ?? null,
      type: type,
      // Giáo viên giảng dạy thực tế là giáo viên dạy thay nếu có, ngược lại là giáo viên chính
      teacherEffectiveId: dto.coverTeacherId || dto.mainTeacherId,
      // Tên giáo viên sẽ được map sau khi kết hợp với thông tin Users/Staff hiện có của Class
      teacherEffectiveName: null,
    };
  }

  /**
   * Chuyển đổi một danh sách Session từ API thành danh sách các Session Domain Models 
   * @param dtos Array đầu vào nhận từ Backend
   * @returns Array của Frontend Domain Models
   */
  static toModelList(dtos: SessionDetailDto[]): SessionModel[] {
    if (!dtos) return [];
    return dtos.map((dto) => this.toModel(dto));
  }
}

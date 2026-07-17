/** แปลงรูปแบบวันที่ที่รับมาจาก Event ของ TUI Calendar ให้เป็นมาตรฐาน Date ของ JS */
export function parseTuiDate(tuiDate: any): Date {
  if (!tuiDate) return new Date();
  if (tuiDate instanceof Date) return tuiDate;
  if (typeof tuiDate.toDate === "function") return tuiDate.toDate();
  if (typeof tuiDate.getTime === "function") return new Date(tuiDate.getTime());
  if (tuiDate.d instanceof Date) return tuiDate.d;
  return new Date(tuiDate);
}

/** คำนวณหาวันที่จริง (Date) จากช่องตาราง (Cell Grid) ที่ถูกคลิก */
export function getCellDate(cell: Element, container: HTMLElement, calendarInstance: any): Date | null {
  if (!calendarInstance) return null;
  
  const cells = Array.from(container.querySelectorAll(".toastui-calendar-daygrid-cell"));
  const index = cells.indexOf(cell);
  if (index === -1) return null;

  const rangeStartObj = calendarInstance.getDateRangeStart();
  const rangeStartDate = typeof rangeStartObj.toDate === "function" 
    ? rangeStartObj.toDate() 
    : new Date(rangeStartObj);

  const clickedDate = new Date(rangeStartDate.getTime());
  clickedDate.setDate(clickedDate.getDate() + index);
  return clickedDate;
}

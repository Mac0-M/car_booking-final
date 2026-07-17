import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  public currentLang = signal<"th" | "en">(
    (localStorage.getItem("lang") as "th" | "en") || "th",
  );

  private dictionary: Record<string, { th: string; en: string }> = {
    // Nav & Sidebar
    Bookings: { th: "การจอง", en: "Bookings" },
    Management: { th: "การจัดการ", en: "Manage" },
    Directory: { th: "รายชื่อ", en: "Directory" },
    "View Profile": { th: "ดูโปรไฟล์", en: "View Profile" },
    Logout: { th: "ออกจากระบบ", en: "Logout" },
    "Clear Filters": { th: "ล้างตัวกรอง", en: "Clear Filters" },
    Filter: { th: "ตัวกรอง", en: "Filter" },
    "Close Menu": { th: "ปิดเมนู", en: "Close Menu" },
    "Open Menu": { th: "เปิดเมนู", en: "Open Menu" },

    // Tabs & View modes
    Active: { th: "ปัจจุบัน", en: "Active" },
    History: { th: "ประวัติ", en: "History" },
    Calendar: { th: "ปฏิทิน", en: "Calendar" },
    Grid: { th: "การ์ด", en: "Grid" },
    List: { th: "รายการ", en: "List" },
    Filters: { th: "ตัวกรอง", en: "Filters" },
    "Add Booking": { th: "จองรถยนต์", en: "Add Booking" },

    // Daily Sidebar
    "Daily Bookings for": {
      th: "รายการจองยานพาหนะประจำวันที่",
      en: "Daily Bookings for",
    },
    "No bookings for this day": {
      th: "ไม่มีรายการจองในวันนี้",
      en: "No bookings for this day",
    },

    // Booking Details Modal
    "Booking Details": { th: "รายละเอียดการจอง", en: "Booking Details" },
    "Summary of vehicle bookings and usage in the system": {
      th: "สรุปการจองและการใช้งานยานพาหนะในระบบ",
      en: "Summary of vehicle bookings and usage in the system",
    },
    Destination: { th: "จุดหมายปลายทาง", en: "Destination" },
    "Purpose / Note": { th: "วัตถุประสงค์ / หมายเหตุ", en: "Purpose / Note" },
    "Driver Name": { th: "ชื่อผู้ขับขี่", en: "Driver Name" },
    "Contact Number": { th: "เบอร์โทรติดต่อ", en: "Contact Number" },
    "Vehicle Details": { th: "รายละเอียดรถยนต์", en: "Vehicle Details" },
    Type: { th: "ประเภท", en: "Type" },
    "License Plate": { th: "เลขทะเบียน", en: "License Plate" },
    Status: { th: "สถานะ", en: "Status" },
    Close: { th: "ปิด", en: "Close" },
    "Cancel Booking": { th: "ยกเลิกการจอง", en: "Cancel Booking" },
    "Complete Booking": { th: "เสร็จสิ้นการใช้งาน", en: "Complete Booking" },
    "Enter Return Odometer Mileage": {
      th: "กรอกเลขไมล์เมื่อคืนรถ",
      en: "Enter Return Odometer Mileage",
    },
    "Start Odometer": { th: "เลขไมล์เริ่มต้น", en: "Start Odometer" },
    "End Odometer": { th: "เลขไมล์สิ้นสุด", en: "End Odometer" },
    "Enter current odometer reading to complete this booking": {
      th: "กรุณากรอกเลขไมล์ปัจจุบันเพื่อเสร็จสิ้นการจองนี้",
      en: "Enter current odometer reading to complete this booking",
    },

    // Statuses
    PENDING: { th: "รอดำเนินการ", en: "Pending" },
    CONFIRMED: { th: "ยืนยันแล้ว", en: "Confirmed" },
    COMPLETED: { th: "เสร็จสิ้น", en: "Completed" },
    CANCELLED: { th: "ยกเลิกแล้ว", en: "Cancelled" },

    "Switch Language": { th: "เปลี่ยนภาษา", en: "Switch Language" },

    // Alerts and Confirms
    "Profile saved successfully.": {
      th: "บันทึกโปรไฟล์สำเร็จแล้ว",
      en: "Profile saved successfully.",
    },
    "Profile saved successfully, but avatar image upload failed.": {
      th: "บันทึกข้อมูลสำเร็จ แต่รูปภาพโปรไฟล์อัปโหลดล้มเหลว",
      en: "Profile saved successfully, but avatar image upload failed.",
    },
    "An error occurred while saving profile data.": {
      th: "เกิดข้อผิดพลาดในการบันทึกข้อมูลโปรไฟล์",
      en: "An error occurred while saving profile data.",
    },
    "Are you sure you want to cancel this booking?": {
      th: "แน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?",
      en: "Are you sure you want to cancel this booking?",
    },
    "An error occurred while cancelling the booking. Please try again.": {
      th: "เกิดข้อผิดพลาดในการยกเลิกการจอง กรุณาลองใหม่อีกครั้ง",
      en: "An error occurred while cancelling the booking. Please try again.",
    },
    "An error occurred while completing the booking. Please try again.": {
      th: "เกิดข้อผิดพลาดในการทำรายการคืนรถ กรุณาลองใหม่อีกครั้ง",
      en: "An error occurred while completing the booking. Please try again.",
    },
    "Please enter a distance value greater than or equal to 0.": {
      th: "กรุณากรอกระยะทางที่มีค่ามากกว่าหรือเท่ากับ 0",
      en: "Please enter a distance value greater than or equal to 0.",
    },
    "Requested vehicle not found.": {
      th: "ไม่พบข้อมูลรถยนต์ที่ระบุ",
      en: "Requested vehicle not found.",
    },
    "An error occurred while saving the vehicle data.": {
      th: "เกิดข้อผิดพลาดในการบันทึกข้อมูลรถยนต์",
      en: "An error occurred while saving the vehicle data.",
    },
    "An error occurred while registering the new vehicle.": {
      th: "เกิดข้อผิดพลาดในการลงทะเบียนรถใหม่",
      en: "An error occurred while registering the new vehicle.",
    },
    "Are you sure you want to delete this vehicle from the system?": {
      th: "แน่ใจหรือไม่ว่าต้องการลบรถยนต์คันนี้ออกจากระบบ?",
      en: "Are you sure you want to delete this vehicle from the system?",
    },
    "An error occurred while deleting the vehicle.": {
      th: "เกิดข้อผิดพลาดในการลบรถยนต์",
      en: "An error occurred while deleting the vehicle.",
    },
    "Vehicle details saved successfully, but image upload failed.": {
      th: "บันทึกข้อมูลรถสำเร็จแล้ว แต่ไม่สามารถอัปโหลดรูปภาพได้",
      en: "Vehicle details saved successfully, but image upload failed.",
    },
    "Invalid email or password": {
      th: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      en: "Invalid email or password",
    },
    "You do not have permission to delete this user.": {
      th: "คุณไม่มีสิทธิ์ลบผู้ใช้งานรายนี้",
      en: "You do not have permission to delete this user.",
    },
    "Are you sure you want to delete this user from the system?": {
      th: "คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้ออกจากระบบ?",
      en: "Are you sure you want to delete this user from the system?",
    },
    "An error occurred while deleting the user.": {
      th: "เกิดข้อผิดพลาดในการลบผู้ใช้งาน",
      en: "An error occurred while deleting the user.",
    },
    "User registered successfully.": {
      th: "ลงทะเบียนผู้ใช้สำเร็จแล้ว",
      en: "User registered successfully.",
    },
    "An error occurred while creating the user.": {
      th: "เกิดข้อผิดพลาดในการสร้างผู้ใช้งานใหม่",
      en: "An error occurred while creating the user.",
    },
    "This vehicle is already booked. Please select another vehicle.": {
      th: "ยานพาหนะนี้ถูกจองไปแล้ว กรุณาเลือกยานพาหนะคันอื่น",
      en: "This vehicle is already booked. Please select another vehicle.",
    },
    "An error occurred while booking the vehicle. Please try again.": {
      th: "เกิดข้อผิดพลาดในการจองรถยนต์ กรุณาลองใหม่อีกครั้ง",
      en: "An error occurred while booking the vehicle. Please try again.",
    },
    "Registered on": { th: "ลงทะเบียนเมื่อ", en: "Registered on" },
    "No bookings found": { th: "ไม่พบรายการจอง", en: "No bookings found" },
    "There are currently no vehicle bookings matching the selected filters.": {
      th: "ไม่พบรายการจองตามตัวกรองที่เลือกในขณะนี้",
      en: "There are currently no vehicle bookings matching the selected filters.",
    },
    Ongoing: { th: "เดินทาง", en: "Ongoing" },
    Upcoming: { th: "รอเดินทาง", en: "Upcoming" },
    Completed: { th: "เสร็จสิ้น", en: "Completed" },
    Cancelled: { th: "ยกเลิกแล้ว", en: "Cancelled" },
    "No users found": { th: "ไม่พบผู้ใช้งาน", en: "No users found" },
    "There are currently no registered users in the system.": {
      th: "ไม่มีผู้ใช้งานลงทะเบียนอยู่ในระบบในขณะนี้",
      en: "There are currently no registered users in the system.",
    },
    "Register New Admin": {
      th: "ลงทะเบียนผู้ดูแลระบบใหม่",
      en: "Register New Admin",
    },
    "Register New User": {
      th: "ลงทะเบียนผู้ใช้งานใหม่",
      en: "Register New User",
    },
    times: { th: "ครั้ง", en: "times" },
    "Delete User": { th: "ลบผู้ใช้งาน", en: "Delete User" },
    "e.g. John Doe": { th: "เช่น นายสมชาย ดีใจ", en: "e.g. John Doe" },
    "e.g. john@company.com": {
      th: "เช่น john@company.com",
      en: "e.g. john@company.com",
    },
    "Minimum 6 characters": {
      th: "อย่างน้อย 6 ตัวอักษร",
      en: "Minimum 6 characters",
    },
    "e.g. 0812345678": { th: "เช่น 0812345678", en: "e.g. 0812345678" },
    "Creating...": { th: "กำลังสร้าง...", en: "Creating..." },
    "Create Account": { th: "สร้างบัญชีผู้ใช้", en: "Create Account" },
    "All Vehicle Types": { th: "ประเภทรถยนต์ทั้งหมด", en: "All Vehicle Types" },
    "All Status": { th: "สถานะทั้งหมด", en: "All Status" },
    "All Fuel Statuses": { th: "สถานะน้ำมันทั้งหมด", en: "All Fuel Statuses" },
    "Edit Vehicle": { th: "แก้ไขข้อมูลรถ", en: "Edit Vehicle" },
    "No vehicles found": { th: "ไม่พบรถยนต์", en: "No vehicles found" },
    "There are currently no vehicles matching the selected filters.": {
      th: "ไม่พบรถยนต์ตามตัวกรองที่เลือกในขณะนี้",
      en: "There are currently no vehicles matching the selected filters.",
    },
    Booked: { th: "ถูกจอง", en: "Booked" },
    "Booking Information Not Found": {
      th: "ไม่พบข้อมูลการจอง",
      en: "Booking Information Not Found",
    },
    "Please fill out the booking form and select a vehicle first.": {
      th: "กรุณากรอกฟอร์มการจองและเลือกยานพาหนะก่อน",
      en: "Please fill out the booking form and select a vehicle first.",
    },
    "Start New Booking": { th: "เริ่มการจองใหม่", en: "Start New Booking" },
    Back: { th: "ย้อนกลับ", en: "Back" },
    "Processing...": { th: "กำลังดำเนินการ...", en: "Processing..." },
    "Confirm Booking": { th: "ยืนยันการจอง", en: "Confirm Booking" },
    "Booking Confirmed!": {
      th: "ยืนยันการจองสำเร็จ!",
      en: "Booking Confirmed!",
    },
    "Your booking request has been processed and your vehicle is reserved.": {
      th: "คำขอการจองของคุณได้รับการประมวลผลและยานพาหนะได้รับการจองเรียบร้อยแล้ว",
      en: "Your booking request has been processed and your vehicle is reserved.",
    },
    "View Booking History": {
      th: "ดูประวัติการจอง",
      en: "View Booking History",
    },
    "Book Another Vehicle": {
      th: "จองรถยนต์คันอื่น",
      en: "Book Another Vehicle",
    },
    "Enter your full name": {
      th: "กรอกชื่อ-นามสกุลของคุณ",
      en: "Enter your full name",
    },
    "Enter your email address": {
      th: "กรอกอีเมลของคุณ",
      en: "Enter your email address",
    },
    "Enter mobile phone number": {
      th: "กรอกเบอร์โทรศัพท์มือถือ",
      en: "Enter mobile phone number",
    },
    "Enter new password (min. 6 characters)": {
      th: "กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)",
      en: "Enter new password (min. 6 characters)",
    },
    "Edit Profile": { th: "แก้ไขโปรไฟล์", en: "Edit Profile" },
    "Save Profile": { th: "บันทึกโปรไฟล์", en: "Save Profile" },
    "e.g. Toyota Hilux Revo (AB-1234)": {
      th: "เช่น โตโยต้า ไฮลักซ์ รีโว่ (กข-1234)",
      en: "e.g. Toyota Hilux Revo (AB-1234)",
    },
    "e.g. 4": { th: "เช่น 4", en: "e.g. 4" },
    "e.g. 1500": { th: "เช่น 1500", en: "e.g. 1500" },
    "seats / ที่นั่ง": { th: "ที่นั่ง", en: "seats" },
    "Refueled / เติมแล้ว": { th: "เติมแล้ว", en: "Refueled" },
    "Needs Refuel / ต้องเติม": { th: "ต้องเติม", en: "Needs Refuel" },
    "Fuel is fully loaded / Ready / น้ำมันเต็มถัง / พร้อมใช้งาน": {
      th: "น้ำมันเต็มถัง / พร้อมใช้งาน",
      en: "Fuel is fully loaded / Ready",
    },
    "Switch to History": { th: "สลับไปยังประวัติ", en: "Switch to History" },
    "Switch to Active Bookings": {
      th: "สลับไปยังจองปัจจุบัน",
      en: "Switch to Active Bookings",
    },
    "Edit Vehicle Details": {
      th: "แก้ไขรายละเอียดรถยนต์",
      en: "Edit Vehicle Details",
    },
    "Edit vehicle details in the system.": {
      th: "แก้ไขรายละเอียดรถยนต์ในระบบ",
      en: "Edit vehicle details in the system.",
    },
    "Fill in the details to register a new vehicle.": {
      th: "กรอกรายละเอียดเพื่อลงทะเบียนรถยนต์ใหม่",
      en: "Fill in the details to register a new vehicle.",
    },
    "Delete Vehicle": { th: "ลบรถยนต์", en: "Delete Vehicle" },
    Cancel: { th: "ยกเลิก", en: "Cancel" },
    "Save Vehicle": { th: "บันทึกข้อมูลรถ", en: "Save Vehicle" },
    "Saving...": { th: "กำลังบันทึก...", en: "Saving..." },
    "Search & Filters / ค้นหาและกรอง": {
      th: "ค้นหาและกรอง",
      en: "Search & Filters",
    },
    "License Plate / ทะเบียนรถ": { th: "ทะเบียนรถ", en: "License Plate" },
    "Search / ค้นหา": { th: "ค้นหา", en: "Search" },
    "User / ผู้ใช้งาน": { th: "ผู้ใช้งาน", en: "User" },
    "All Users / ผู้ใช้งานทั้งหมด": { th: "ผู้ใช้งานทั้งหมด", en: "All Users" },
    "Month / เดือน": { th: "เดือน", en: "Month" },
    "From Date/Time / ตั้งแต่วันเวลา": {
      th: "ตั้งแต่วันเวลา",
      en: "From Date/Time",
    },
    "To Date/Time / ถึงวันเวลา": { th: "ถึงวันเวลา", en: "To Date/Time" },
    "Booking Status / สถานะการจอง": { th: "สถานะการจอง", en: "Booking Status" },
    "All Statuses / สถานะทั้งหมด": { th: "สถานะทั้งหมด", en: "All Statuses" },
    "CONFIRMED / ยืนยันแล้ว (กำลังมาถึง)": {
      th: "ยืนยันแล้ว (กำลังมาถึง)",
      en: "CONFIRMED",
    },
    "COMPLETED / เสร็จสิ้น": { th: "เสร็จสิ้น", en: "COMPLETED" },
    "CANCELLED / ยกเลิกแล้ว": { th: "ยกเลิกแล้ว", en: "CANCELLED" },
    "Filter by User / กรองตามผู้ใช้": {
      th: "กรองตามผู้ใช้",
      en: "Filter by User",
    },
    "Filter by Month / กรองตามเดือน": {
      th: "กรองตามเดือน",
      en: "Filter by Month",
    },
    "Vehicle Type / ประเภทรถ": { th: "ประเภทรถ", en: "Vehicle Type" },
    Vehicles: { th: "ยานพาหนะ", en: "Vehicles" },
    Users: { th: "ผู้ใช้งาน", en: "Users" },
    "Search...": { th: "ค้นหา...", en: "Search..." },
    "Status / สถานะ": { th: "สถานะ", en: "Status" },
    "All Status / สถานะทั้งหมด": { th: "สถานะทั้งหมด", en: "All Status" },
    "Available / พร้อมใช้งาน": { th: "พร้อมใช้งาน", en: "Available" },
    "Unavailable / ไม่พร้อมใช้งาน": { th: "ไม่พร้อมใช้งาน", en: "Unavailable" },
    Available: { th: "พร้อมใช้งาน", en: "Available" },
    Unavailable: { th: "ไม่พร้อมใช้งาน", en: "Unavailable" },
    available: { th: "พร้อมใช้งาน", en: "Available" },
    unavailable: { th: "ไม่พร้อมใช้งาน", en: "Unavailable" },
    booked: { th: "ถูกจอง", en: "Booked" },
    Select: { th: "เลือก", en: "Select" },
    "Fuel Status / สถานะน้ำมัน": { th: "สถานะน้ำมัน", en: "Fuel Status" },
    "All Fuel Statuses / สถานะน้ำมันทั้งหมด": {
      th: "สถานะน้ำมันทั้งหมด",
      en: "All Fuel Statuses",
    },
    "Refueled / เติมน้ำมันแล้ว": { th: "เติมน้ำมันแล้ว", en: "Refueled" },
    "Needs Refuel / ต้องเติมน้ำมัน": {
      th: "ต้องเติมน้ำมัน",
      en: "Needs Refuel",
    },
    "No filters available for Users List": {
      th: "ไม่มีตัวกรองสำหรับรายชื่อผู้ใช้งาน",
      en: "No filters available for Users List",
    },
    "Add New Vehicle": { th: "เพิ่มรถยนต์ใหม่", en: "Add New Vehicle" },
    Search: { th: "ค้นหา", en: "Search" },
    "Fuel Status": { th: "สถานะน้ำมัน", en: "Fuel Status" },
    "Book New Vehicle": { th: "จองยานพาหนะใหม่", en: "Book New Vehicle" },
    "Select a Vehicle": { th: "เลือกยานพาหนะ", en: "Select a Vehicle" },
    "Confirm Travel Details": {
      th: "ยืนยันรายละเอียดการเดินทาง",
      en: "Confirm Travel Details",
    },
    "Car Booking Details": {
      th: "รายละเอียดการจองรถยนต์",
      en: "Car Booking Details",
    },
    "Departure Date & Time / ออกเดินทาง": {
      th: "ออกเดินทาง",
      en: "Departure Date & Time",
    },
    "Return Date & Time /เดินทางกลับ": {
      th: "เดินทางกลับ",
      en: "Return Date & Time",
    },
    "Destination / จุดหมาย": { th: "จุดหมายปลายทาง", en: "Destination" },
    "Purpose of Use / วัตถุประสงค์": {
      th: "วัตถุประสงค์",
      en: "Purpose of Use",
    },
    "Book for / จองให้": { th: "จองให้", en: "Book for" },
    "Checking vehicle availability...": {
      th: "กำลังตรวจสอบสถานะว่างของยานพาหนะ...",
      en: "Checking vehicle availability...",
    },
    "Find Available Vehicles": {
      th: "ค้นหายานพาหนะที่ว่าง",
      en: "Find Available Vehicles",
    },
    "Please enter phone number": {
      th: "กรุณากรอกเบอร์โทรศัพท์",
      en: "Please enter phone number",
    },
    "Please enter your mobile phone number so that the coordinator can contact you about this trip.":
      {
        th: "กรุณากรอกเบอร์โทรศัพท์มือถือของคุณเพื่อให้ผู้ประสานงานสามารถติดต่อคุณเกี่ยวกับการเดินทางครั้งนี้",
        en: "Please enter your mobile phone number so that the coordinator can contact you about this trip.",
      },
    "Save Phone Number": { th: "บันทึกเบอร์โทรศัพท์", en: "Save Phone Number" },
    "e.g. branch office...": {
      th: "เช่น สาขาย่อย...",
      en: "e.g. branch office...",
    },
    "e.g. client meeting...": {
      th: "เช่น ประชุมลูกค้า...",
      en: "e.g. client meeting...",
    },
    "Phone number is required.": {
      th: "จำเป็นต้องกรอกเบอร์โทรศัพท์",
      en: "Phone number is required.",
    },
    "Phone number must be 10 digits.": {
      th: "เบอร์โทรศัพท์ต้องมีความยาว 10 หลัก",
      en: "Phone number must be 10 digits.",
    },
    "An error occurred while checking vehicle availability. Please try again.":
      {
        th: "เกิดข้อผิดพลาดในการตรวจสอบยานพาหนะที่ว่าง กรุณาลองใหม่อีกครั้ง",
        en: "An error occurred while checking vehicle availability. Please try again.",
      },
    Today: { th: "วันนี้", en: "Today" },
    Apply: { th: "ตกลง", en: "Apply" },
    Booking: { th: "กรอกข้อมูล", en: "Booking" },
    "Choose Car": { th: "เลือกรถ", en: "Choose Car" },
    Confirm: { th: "ยืนยัน", en: "Confirm" },
    "Booking Summary": { th: "สรุปรายการจอง", en: "Booking Summary" },
    "Please review your travel details before confirming the booking.": {
      th: "กรุณาตรวจสอบรายละเอียดการเดินทางของคุณก่อนยืนยันการจอง",
      en: "Please review your travel details before confirming the booking.",
    },
    "Trip Details": { th: "รายละเอียดการเดินทาง", en: "Trip Details" },
    "Confirm Complete": { th: "ยืนยันเสร็จสิ้น", en: "Confirm Complete" },
    "No Vehicles Available": {
      th: "ไม่มีรถยนต์ว่างในขณะนี้",
      en: "No Vehicles Available",
    },
    "Sorry, no vehicles are available for your selected time slot. Please try a different date or time.":
      {
        th: "ขออภัย ไม่มีรถยนต์ว่างในช่วงเวลาที่คุณเลือก กรุณาลองเปลี่ยนวันหรือเวลาอื่น",
        en: "Sorry, no vehicles are available for your selected time slot. Please try a different date or time.",
      },
  };

  public setLanguage(lang: "th" | "en"): void {
    this.currentLang.set(lang);
    localStorage.setItem("lang", lang);
  }

  public toggleLanguage(): void {
    this.setLanguage(this.currentLang() === "th" ? "en" : "th");
  }

  public translate(
    key: string,
    lang: "th" | "en" = this.currentLang(),
  ): string {
    if (!key) return "";

    // 1. Check dictionary exact match
    if (this.dictionary[key]) {
      return this.dictionary[key][lang];
    }

    // 2. Check bilingual format "English / Thai" or similar
    if (key.includes(" / ")) {
      const parts = key.split(" / ");
      if (parts.length === 2) {
        return lang === "en" ? parts[0].trim() : parts[1].trim();
      }
    }

    // 3. Check for pattern matches or substring translation (like suffix "Registered on")
    for (const dictKey of Object.keys(this.dictionary)) {
      if (key.startsWith(dictKey)) {
        const remaining = key.substring(dictKey.length);
        return this.dictionary[dictKey][lang] + remaining;
      }
    }

    return key;
  }
}

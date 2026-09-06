const connectDB = require("../config/db");
const Teacher = require("../models/Teacher");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const Fee = require("../models/Fee");

const askForTeacher = async () => {
  let teacher = await Teacher.findOne({ email: "demo@classpilot.local" });

  if (!teacher) {
    teacher = await Teacher.create({
      name: "Demo Teacher",
      email: "demo@classpilot.local",
      password: "demo1234",
      instituteName: "Demo Academy",
      phone: "9876543210",
    });
  }

  return teacher;
};

const demoBatches = [
  {
    batchName: "Math Foundation",
    class: "Class 8",
    subject: "Mathematics",
    teacherName: "Demo Teacher",
    days: ["Mon", "Wed", "Fri"],
    timing: "4:00 PM - 5:15 PM",
    maxStudents: 18,
    monthlyFee: 2500,
    description: "Concept building and practice for middle school learners.",
    colorTag: "#3B82F6",
    isActive: true,
  },
  {
    batchName: "Science Lab",
    class: "Class 9",
    subject: "Science",
    teacherName: "Demo Teacher",
    days: ["Tue", "Thu", "Sat"],
    timing: "5:30 PM - 7:00 PM",
    maxStudents: 20,
    monthlyFee: 2800,
    description: "Hands-on science practice with revision worksheets.",
    colorTag: "#10B981",
    isActive: true,
  },
  {
    batchName: "English Writing",
    class: "Class 10",
    subject: "English",
    teacherName: "Demo Teacher",
    days: ["Mon", "Tue", "Thu"],
    timing: "6:00 PM - 7:30 PM",
    maxStudents: 16,
    monthlyFee: 2600,
    description: "Grammar, writing skills, and board exam preparation.",
    colorTag: "#F59E0B",
    isActive: true,
  },
];

const demoStudents = [
  {
    fullName: "Aarav Sharma",
    phone: "9876500011",
    email: "aarav.sharma@example.com",
    parentName: "Rohit Sharma",
    parentPhone: "9876500012",
    parentEmail: "rohit@example.com",
    address: "Sector 12, Jaipur",
    schoolName: "St. Xavier School",
    class: "Class 8",
    dateOfBirth: "2013-02-14",
    admissionDate: "2024-04-10",
    monthlyFee: 2500,
    status: "Active",
    batchName: "Math Foundation",
  },
  {
    fullName: "Diya Verma",
    phone: "9876500021",
    email: "diya.verma@example.com",
    parentName: "Anil Verma",
    parentPhone: "9876500022",
    parentEmail: "anil@example.com",
    address: "Mansarovar, Jaipur",
    schoolName: "Bluebell Academy",
    class: "Class 8",
    dateOfBirth: "2012-11-05",
    admissionDate: "2024-05-08",
    monthlyFee: 2500,
    status: "Active",
    batchName: "Math Foundation",
  },
  {
    fullName: "Kabir Singh",
    phone: "9876500031",
    email: "kabir.singh@example.com",
    parentName: "Harpreet Singh",
    parentPhone: "9876500032",
    parentEmail: "harpreet@example.com",
    address: "Sanganer, Jaipur",
    schoolName: "Riverside Public School",
    class: "Class 9",
    dateOfBirth: "2013-07-20",
    admissionDate: "2024-06-02",
    monthlyFee: 2800,
    status: "Active",
    batchName: "Science Lab",
  },
  {
    fullName: "Meher Khan",
    phone: "9876500041",
    email: "meher.khan@example.com",
    parentName: "Shahid Khan",
    parentPhone: "9876500042",
    parentEmail: "shahid@example.com",
    address: "Vaishali Nagar, Jaipur",
    schoolName: "Modern Public School",
    class: "Class 9",
    dateOfBirth: "2012-09-12",
    admissionDate: "2024-04-16",
    monthlyFee: 2800,
    status: "On Hold",
    batchName: "Science Lab",
  },
  {
    fullName: "Riya Malhotra",
    phone: "9876500051",
    email: "riya.malhotra@example.com",
    parentName: "Vikram Malhotra",
    parentPhone: "9876500052",
    parentEmail: "vikram@example.com",
    address: "Malviya Nagar, Jaipur",
    schoolName: "St. Anne's School",
    class: "Class 10",
    dateOfBirth: "2012-01-18",
    admissionDate: "2024-03-14",
    monthlyFee: 2600,
    status: "Active",
    batchName: "English Writing",
  },
  {
    fullName: "Vihaan Gupta",
    phone: "9876500061",
    email: "vihaan.gupta@example.com",
    parentName: "Puneet Gupta",
    parentPhone: "9876500062",
    parentEmail: "puneet@example.com",
    address: "C-Scheme, Jaipur",
    schoolName: "DPS Jaipur",
    class: "Class 10",
    dateOfBirth: "2011-10-30",
    admissionDate: "2024-05-20",
    monthlyFee: 2600,
    status: "Active",
    batchName: "English Writing",
  },
];

const ensureTeacherPendingFees = async (teacher) => {
  const students = await Student.find({ teacher: teacher._id }).populate("batch", "batchName monthlyFee");

  if (!students.length) return 0;

  let created = 0;
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  for (const student of students) {
    const existingFee = await Fee.findOne({
      teacher: teacher._id,
      student: student._id,
      month,
      year,
    });

    if (existingFee) continue;

    const amount = student.monthlyFee ?? student.batch?.monthlyFee ?? 2500;
    await Fee.create({
      teacher: teacher._id,
      student: student._id,
      batch: student.batch?._id || null,
      month,
      year,
      amount,
      lateFee: 150,
      paidAmount: 0,
      dueDate: new Date(year, month - 1, 10),
      status: "Overdue",
    });

    created += 1;
  }

  return created;
};

const seedDemoData = async () => {
  await connectDB();

  const teacher = await askForTeacher();

  const pendingCreated = await ensureTeacherPendingFees(teacher);

  const existingBatches = await Batch.find({ teacher: teacher._id });
  if (existingBatches.length === 0) {
    const createdBatches = await Promise.all(
      demoBatches.map((batch) =>
        Batch.create({
          ...batch,
          teacher: teacher._id,
        })
      )
    );

    for (const student of demoStudents) {
      const batch = createdBatches.find((entry) => entry.batchName === student.batchName);
      if (!batch) continue;

      const existingStudent = await Student.findOne({
        teacher: teacher._id,
        fullName: student.fullName,
      });

      if (!existingStudent) {
        const createdStudent = await Student.create({
          ...student,
          teacher: teacher._id,
          batch: batch._id,
          dateOfBirth: new Date(student.dateOfBirth),
          admissionDate: new Date(student.admissionDate),
        });

        const month = new Date().getMonth() + 1;
        const year = new Date().getFullYear();

        await Fee.create({
          teacher: teacher._id,
          student: createdStudent._id,
          batch: batch._id,
          month,
          year,
          amount: student.monthlyFee,
          lateFee: 150,
          paidAmount: 0,
          dueDate: new Date(year, month - 1, 10),
          status: "Overdue",
        });
      }
    }

    console.log(`Created demo teacher, ${createdBatches.length} batches, ${demoStudents.length} students, and pending fee reminders.`);
    return;
  }

  if (pendingCreated > 0) {
    console.log(`Created ${pendingCreated} pending fee reminder(s) for existing demo students.`);
    return;
  }

  const existingStudents = await Student.countDocuments({ teacher: teacher._id });
  console.log(`Demo data already exists for teacher ${teacher.name}. Existing students: ${existingStudents}.`);
};

seedDemoData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

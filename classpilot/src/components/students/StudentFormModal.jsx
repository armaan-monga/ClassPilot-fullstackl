import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { createStudent, updateStudent } from "../../services/students";
import { toISODate } from "../../utils/formatters";

export default function StudentFormModal({ open, onClose, onSaved, batches, student }) {
  const isEdit = Boolean(student);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        student
          ? {
              ...student,
              batch: student.batch?._id || student.batch,
              admissionDate: student.admissionDate ? toISODate(student.admissionDate) : "",
              joiningDate: student.joiningDate ? toISODate(student.joiningDate) : "",
              dateOfBirth: student.dateOfBirth ? toISODate(student.dateOfBirth) : "",
            }
          : { status: "Active" }
      );
    }
  }, [open, student, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateStudent(student._id, data);
        toast.success("Student updated");
      } else {
        await createStudent(data);
        toast.success("Student added");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save student");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Student" : "Add Student"} width="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          placeholder="Rahul Verma"
          {...register("fullName", { required: "Full name is required" })}
          error={errors.fullName?.message}
        />
        <Select
          label="Batch"
          {...register("batch", { required: "Please select a batch" })}
          error={errors.batch?.message}
        >
          <option value="">Select a batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.batchName} ({b.class})
            </option>
          ))}
        </Select>

        <Input label="Phone Number" placeholder="98765 43210" {...register("phone")} />
        <Input label="School Name" placeholder="DAV Public School" {...register("schoolName")} />

        <Input label="Parent Name" placeholder="Suresh Verma" {...register("parentName")} />
        <Input label="Parent Phone" placeholder="98765 12345" {...register("parentPhone")} />

        <Input label="Class" placeholder="Class 10" {...register("class")} />
        <Input
          label="Monthly Fee (₹)"
          type="number"
          placeholder="2000"
          {...register("monthlyFee", { required: "Monthly fee is required", min: 0 })}
          error={errors.monthlyFee?.message}
        />

        <Input label="Date of Birth" type="date" {...register("dateOfBirth")} />
        <Input label="Admission Date" type="date" {...register("admissionDate")} />

        <Select label="Status" {...register("status")}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On Hold">On Hold</option>
        </Select>
        <Input label="Address" placeholder="House no, street, city" {...register("address")} />

        <div className="sm:col-span-2">
          <label className="label-text">Notes</label>
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Anything worth remembering about this student..."
            {...register("notes")}
          />
        </div>

        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save Changes" : "Add Student"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createBatch, updateBatch } from "../../services/batches";
import { BATCH_COLOR_PRESETS, WEEKDAYS } from "../../utils/constants";

export default function BatchFormModal({ open, onClose, onSaved, batch }) {
  const isEdit = Boolean(batch);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const selectedColor = watch("colorTag");
  const selectedDays = watch("days") || [];

  useEffect(() => {
    if (open) {
      reset(
        batch
          ? { ...batch, days: batch.days || [] }
          : { colorTag: BATCH_COLOR_PRESETS[0], days: [], maxStudents: 30 }
      );
    }
  }, [open, batch, reset]);

  const toggleDay = (day) => {
    const next = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
    setValue("days", next);
  };

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateBatch(batch._id, data);
        toast.success("Batch updated");
      } else {
        await createBatch(data);
        toast.success("Batch created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save batch");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Edit Batch" : "Create Batch"} width="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Batch Name"
          placeholder="Morning Batch"
          {...register("batchName", { required: "Batch name is required" })}
          error={errors.batchName?.message}
        />
        <Input
          label="Class"
          placeholder="Class 10"
          {...register("class", { required: "Class is required" })}
          error={errors.class?.message}
        />
        <Input label="Subject" placeholder="Mathematics" {...register("subject")} />
        <Input label="Teacher Name" placeholder="Priya Sharma" {...register("teacherName")} />
        <Input label="Timing" placeholder="5:00 PM - 6:30 PM" {...register("timing")} />
        <Input
          label="Monthly Fee (₹)"
          type="number"
          {...register("monthlyFee", { required: "Monthly fee is required", min: 0 })}
          error={errors.monthlyFee?.message}
        />
        <Input label="Max Students" type="number" {...register("maxStudents", { min: 1 })} />

        <div>
          <label className="label-text">Color Tag</label>
          <div className="flex flex-wrap gap-2">
            {BATCH_COLOR_PRESETS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setValue("colorTag", c)}
                className={`h-8 w-8 rounded-full transition-transform ${
                  selectedColor === c ? "scale-110 ring-2 ring-offset-2 ring-ink/20" : ""
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label-text">Days</label>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedDays.includes(day) ? "bg-iris-500 text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="label-text">Description</label>
          <textarea rows={2} className="input-field resize-none" {...register("description")} />
        </div>

        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? "Save Changes" : "Create Batch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

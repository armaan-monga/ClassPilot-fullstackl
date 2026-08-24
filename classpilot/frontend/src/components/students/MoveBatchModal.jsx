import { useState } from "react";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import Button from "../ui/Button";
import { moveStudentBatch } from "../../api/students";

export default function MoveBatchModal({ open, onClose, onMoved, student, batches }) {
  const [targetBatch, setTargetBatch] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMove = async () => {
    if (!targetBatch) return toast.error("Choose a batch first");
    setLoading(true);
    try {
      await moveStudentBatch(student._id, targetBatch);
      toast.success("Student moved");
      onMoved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't move student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Move ${student?.fullName || "student"}`} width="max-w-sm">
      <p className="mb-4 text-sm text-ink/55">Choose the batch to move this student into.</p>
      <Select value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)}>
        <option value="">Select a batch</option>
        {batches
          .filter((b) => b._id !== (student?.batch?._id || student?.batch))
          .map((b) => (
            <option key={b._id} value={b._id}>
              {b.batchName} ({b.class})
            </option>
          ))}
      </Select>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleMove} loading={loading}>
          Move Student
        </Button>
      </div>
    </Modal>
  );
}

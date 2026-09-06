import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Save, Building2, User, Palette } from "lucide-react";
import { getSettings, updateSettings } from "../services/settings";
import { updateProfile } from "../services/auth";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { BATCH_COLOR_PRESETS } from "../utils/constants";

export default function Settings() {
  const { teacher, updateLocalTeacher } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm();

  const themeColor = watch("themeColor");

  useEffect(() => {
    getSettings()
      .then((res) => reset(res.data.data))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateSettings(data);
      await updateProfile({
        instituteName: data.instituteName,
        name: data.teacherName,
        themeColor: data.themeColor,
        currency: data.currency,
      });
      updateLocalTeacher({ instituteName: data.instituteName, themeColor: data.themeColor });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading settings..." />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Settings</h1>
        <p className="text-sm text-ink/50">Make ClassPilot feel like yours.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
            <Building2 size={17} className="text-petrol-500" /> Institute Details
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Institute Name" {...register("instituteName")} />
            <Input label="Institute Logo URL" placeholder="https://..." {...register("instituteLogo")} />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
            <User size={17} className="text-petrol-500" /> Teacher Profile
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Teacher Name" {...register("teacherName")} />
            <Select label="Currency" {...register("currency")}>
              <option value="INR">₹ Indian Rupee (INR)</option>
              <option value="USD">$ US Dollar (USD)</option>
              <option value="GBP">£ British Pound (GBP)</option>
            </Select>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
            <Palette size={17} className="text-petrol-500" /> Appearance & Reminders
          </h3>
          <div className="mb-4">
            <label className="label-text">Theme Color</label>
            <div className="flex flex-wrap gap-2">
              {BATCH_COLOR_PRESETS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue("themeColor", c)}
                  className={`h-8 w-8 rounded-full transition-transform ${
                    themeColor === c ? "scale-110 ring-2 ring-offset-2 ring-ink/20" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Fee Reminder Day (of month)"
              type="number"
              min={1}
              max={28}
              {...register("feeReminderDate")}
            />
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm font-medium text-ink/70">
                <input type="checkbox" {...register("lateFeeEnabled")} className="h-4 w-4 rounded accent-petrol-500" />
                Enable Late Fee
              </label>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" icon={Save} loading={saving}>
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

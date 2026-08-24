import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GraduationCap, MailCheck } from "lucide-react";
import { forgotPassword } from "../api/auth";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar-gradient p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <GraduationCap size={28} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-bold">ClassPilot</h1>
        </div>

        <div className="glass-card-solid p-7">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-meadow-100">
                <MailCheck size={26} className="text-meadow-600" />
              </div>
              <h2 className="font-display text-lg font-bold text-ink">Check your email</h2>
              <p className="text-sm text-ink/55">
                If an account exists for that email, we've sent reset instructions.
              </p>
              <Link to="/login" className="mt-2 text-sm font-semibold text-iris-600 hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 font-display text-xl font-bold text-ink">Reset your password</h2>
              <p className="mb-6 text-sm text-ink/50">
                Enter your email and we'll send you reset instructions.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@institute.com"
                  {...register("email", { required: "Email is required" })}
                  error={errors.email?.message}
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send Reset Link
                </Button>
              </form>
              <p className="mt-6 text-center text-sm text-ink/55">
                Remembered it?{" "}
                <Link to="/login" className="font-semibold text-iris-600 hover:underline">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

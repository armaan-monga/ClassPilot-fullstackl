import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't log you in. Check your details.");
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
          <p className="text-sm text-white/60">Run your tuition classes, the simple way</p>
        </div>

        <div className="glass-card-solid p-7">
          <h2 className="mb-1 font-display text-xl font-bold text-ink">Welcome back</h2>
          <p className="mb-6 text-sm text-ink/50">Log in to your ClassPilot dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="relative">
              <Mail size={17} className="absolute left-4 top-[38px] text-ink/35" />
              <Input
                label="Email"
                type="email"
                placeholder="you@institute.com"
                className="[&_input]:pl-10"
                {...register("email", { required: "Email is required" })}
                error={errors.email?.message}
              />
            </div>

            <div className="relative">
              <Lock size={17} className="absolute left-4 top-[38px] text-ink/35" />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="[&_input]:pl-10 [&_input]:pr-10"
                {...register("password", { required: "Password is required" })}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-[38px] text-ink/35 hover:text-ink/60"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="flex justify-end -mt-1">
              <Link to="/forgot-password" className="text-xs font-semibold text-iris-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="mt-1 w-full">
              Log In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/55">
            New to ClassPilot?{" "}
            <Link to="/register" className="font-semibold text-iris-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

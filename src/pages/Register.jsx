import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Register() {
  const { register: registerTeacher } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerTeacher({
        name: data.name,
        email: data.email,
        password: data.password,
        instituteName: data.instituteName,
        phone: data.phone,
      });
      toast.success("Account created! Let's set things up.");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Couldn't create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar-gradient p-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
            <GraduationCap size={28} strokeWidth={2.2} />
          </div>
          <h1 className="font-display text-2xl font-bold">ClassPilot</h1>
          <p className="text-sm text-white/60">Set up your institute in under a minute</p>
        </div>

        <div className="glass-card-solid p-7">
          <h2 className="mb-1 font-display text-xl font-bold text-ink">Create your account</h2>
          <p className="mb-6 text-sm text-ink/50">Free to start — no card required</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Your Name"
              placeholder="Priya Sharma"
              {...register("name", { required: "Name is required" })}
              error={errors.name?.message}
            />
            <Input
              label="Institute / Tuition Name"
              placeholder="Sharma Tuition Classes"
              {...register("instituteName", { required: "Institute name is required" })}
              error={errors.instituteName?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="you@institute.com"
                {...register("email", { required: "Email is required" })}
                error={errors.email?.message}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="98765 43210"
                {...register("phone")}
              />
            </div>
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "Minimum 6 characters" },
              })}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === watch("password") || "Passwords don't match",
              })}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" loading={loading} className="mt-1 w-full">
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink/55">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-iris-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

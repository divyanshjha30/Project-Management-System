import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/api";
import { X, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PasswordMode = "select" | "current" | "forgot";
type ForgotPasswordStep = "email" | "otp" | "newPassword";

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const { user, refreshUser } = useAuth();
  const [mode, setMode] = useState<PasswordMode>("select");
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>("email");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const resetForm = () => {
    setMode("select");
    setForgotStep("email");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEmail(user?.email || "");
    setOtp("");
    setResetToken("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
    setMessage(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChangeWithCurrent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem("token", response.token);
      }

      setMessage({ type: "success", text: "Password changed successfully!" });
      await refreshUser();
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setMessage({ type: "success", text: "OTP sent to your email!" });
      setForgotStep("otp");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to send OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/verify-reset-otp", { email, otp });
      setResetToken(response.resetToken);
      setMessage({ type: "success", text: "OTP verified! Set your new password." });
      setForgotStep("newPassword");
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Invalid OTP" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (forgotNewPassword !== forgotConfirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (forgotNewPassword.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters long" });
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post("/auth/reset-password", {
        resetToken,
        newPassword: forgotNewPassword,
      });

      if (response.token) {
        apiClient.setToken(response.token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      setMessage({ type: "success", text: "Password reset successfully!" });
      await refreshUser();
      
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to reset password" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={handleClose}
    >
      <div
        className="glass rounded-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neo-icon w-10 h-10 flex items-center justify-center rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Change Password</h2>
              <p className="text-sm opacity-70">Update your account password</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="neo-icon w-8 h-8 flex items-center justify-center rounded-lg hover:opacity-80 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-4 rounded-lg border flex items-center gap-3 ${
                message.type === "success"
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {mode === "select" && (
            <div className="space-y-3">
              <button
                onClick={() => setMode("current")}
                className="w-full glass-soft rounded-lg p-4 hover:glass transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 opacity-70" />
                  <div>
                    <p className="font-medium">Use Current Password</p>
                    <p className="text-sm opacity-70">I know my current password</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("forgot")}
                className="w-full glass-soft rounded-lg p-4 hover:glass transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 opacity-70" />
                  <div>
                    <p className="font-medium">Forgot Password</p>
                    <p className="text-sm opacity-70">I don't remember my password</p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === "current" && (
            <form onSubmit={handleChangeWithCurrent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMode("select")}
                  className="flex-1 btn-ghost"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                  disabled={loading}
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && forgotStep === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setMode("select")} className="flex-1 btn-ghost" disabled={loading}>Back</button>
                <button type="submit" className="flex-1 btn-primary" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</button>
              </div>
            </form>
          )}

          {mode === "forgot" && forgotStep === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-field w-full text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs opacity-50 mt-2">Check your email for the 6-digit code</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setForgotStep("email")} className="flex-1 btn-ghost" disabled={loading}>Back</button>
                <button type="submit" className="flex-1 btn-primary" disabled={loading}>{loading ? "Verifying..." : "Verify OTP"}</button>
              </div>

              <button type="button" onClick={handleSendOTP} className="w-full text-sm opacity-70 hover:opacity-100 transition" disabled={loading}>
                Didn't receive code? Resend OTP
              </button>
            </form>
          )}

          {mode === "forgot" && forgotStep === "newPassword" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Enter new password"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Confirm new password"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="w-full btn-primary" disabled={loading}>{loading ? "Resetting..." : "Reset Password"}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
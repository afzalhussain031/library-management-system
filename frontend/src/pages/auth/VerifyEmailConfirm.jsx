import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { auth } from "../../services/api";

export default function VerifyEmailConfirm() {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      try {
        const data = await auth.verifyEmail(uidb64, token);
        if (!cancelled) {
          setStatus("success");
          setMessage(data.detail || "Email verified successfully.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err?.response?.data?.detail ||
              "Verification failed. The link may be invalid or expired."
          );
        }
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [uidb64, token]);

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-semibold text-gray-900">
              Verifying your email...
            </h1>
            <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-xl font-semibold text-green-700">
              Email verified
            </h1>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-6 bg-yellow-400 hover:bg-yellow-300 px-6 py-3 rounded-full text-sm font-semibold text-gray-900"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-red-600">
              Verification failed
            </h1>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
            <Link
              to="/login"
              className="inline-block mt-6 bg-yellow-400 hover:bg-yellow-300 px-6 py-3 rounded-full text-sm font-semibold text-gray-900"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

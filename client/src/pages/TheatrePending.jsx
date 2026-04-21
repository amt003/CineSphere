import React from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, CheckCircle2, Building2 } from "lucide-react";

const TheatrePending = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8 text-center">
          {/* Icon with animation */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            Application Received
          </h1>
          <p className="text-gray-400 mb-6">
            Thank you for registering your theatre!
          </p>

          {/* Status Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <p className="text-blue-400 font-semibold">Under Review</p>
            </div>
            <p className="text-gray-300 text-sm">
              Our team is reviewing your theatre information
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-gray-300 text-sm font-medium">
                  Application Submitted
                </p>
                <p className="text-gray-500 text-xs">Just now</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-gray-300 text-sm font-medium">
                  Review in Progress
                </p>
                <p className="text-gray-500 text-xs">24–48 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-gray-300 text-sm font-medium">
                  Approval Email Sent
                </p>
                <p className="text-gray-500 text-xs">Once approved</p>
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <p className="text-amber-400 text-sm">
              We'll review your theatre details and send you a confirmation
              email. Once approved, you can log in and set up your showtimes and
              pricing.
            </p>
          </div>

          {/* Action Button */}
          <Link
            to="/"
            className="inline-block w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition"
          >
            Back to Home
          </Link>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-gray-400 text-sm">
              Questions?{" "}
              <a
                href="mailto:support@cinesphere.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Not a theatre owner?{" "}
            <Link to="/" className="text-cyan-400 hover:text-cyan-300">
              Book movies as a customer
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default TheatrePending;

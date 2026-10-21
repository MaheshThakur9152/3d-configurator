import React, { useState } from 'react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base md:text-lg font-bold text-gray-900 font-sans">
              Interested, Enquire?
            </h2>
            <span className="text-xs text-gray-500 font-sans">
              I am interested in this design.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        {submitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-gray-900">Enquiry Received!</h3>
            <p className="text-sm text-gray-600">
              Thank you for reaching out. A jewelry specialist will contact you shortly with your custom quote.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>

            {/* Message Rich Text Toolbar & Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Message (Optional)
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:border-gray-900 transition-colors">
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-gray-600 text-xs flex-wrap">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">↶</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">↷</button>
                  <span className="w-[1px] h-3 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 font-bold hover:bg-gray-200 rounded">B</button>
                  <button type="button" className="p-1 italic hover:bg-gray-200 rounded">I</button>
                  <button type="button" className="p-1 underline hover:bg-gray-200 rounded">U</button>
                  <button type="button" className="p-1 line-through hover:bg-gray-200 rounded">S</button>
                  <span className="w-[1px] h-3 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded font-semibold">H1</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded font-semibold">H2</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded font-semibold">H3</button>
                  <span className="w-[1px] h-3 bg-gray-300 mx-1" />
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">☰</button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded">☷</button>
                </div>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about what you're looking for..."
                  className="w-full p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none resize-none bg-white"
                />
              </div>
            </div>

            {/* Mock reCAPTCHA Box */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between w-64">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCaptchaChecked}
                  onChange={(e) => setIsCaptchaChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-gray-900 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-gray-700">I'm not a robot</span>
              </label>
              <div className="flex flex-col items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#3b82f6">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.5h-2v-2h2zm0-4h-2V7h2z" />
                </svg>
                <span className="text-[8px] text-gray-400">reCAPTCHA</span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 px-5 bg-gray-900 hover:bg-black text-white rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Submit Enquiry
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

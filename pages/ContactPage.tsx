import React, { useState } from 'react';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate backend submission
    console.log("Form Submitted:", formData);
    setSubmitted(true);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto overflow-y-auto h-full flex flex-col">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium mb-6 transition-colors self-start">
        <ArrowLeft size={20} />
        <span>Back to Chat</span>
      </Link>

      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Contact Support</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Have questions or feedback? Reach out to the Dr.Suji team.</p>

        {submitted ? (
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-8 text-center">
            <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-teal-800 dark:text-teal-300 mb-2">Message Sent!</h2>
            <p className="text-teal-700 dark:text-teal-400">Thank you for reaching out. Our team will get back to you shortly.</p>
            <button 
              onClick={() => setSubmitted(false)}
              className="mt-6 text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-200 underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Message</label>
              <textarea
                required
                rows={5}
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-white"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md"
            >
              <Send size={18} /> Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
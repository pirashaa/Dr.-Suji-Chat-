import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => {
  // Static version control for legal documents
  const LEGAL_VERSION = "1.2";
  const LAST_UPDATED = "February 24, 2025";

  return (
    <div className="p-8 max-w-4xl mx-auto overflow-y-auto h-full">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Chat</span>
      </Link>

      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Terms and Conditions</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
          <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Version {LEGAL_VERSION}
          </span>
          <span className="flex items-center gap-1">
            Last Updated: {LAST_UPDATED}
          </span>
        </div>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
        <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white">1. Introduction</h2>
        <p>
          Welcome to Dr.Suji Chat. By accessing our platform, you agree to these terms. 
          These terms govern your use of our AI-powered medical assistant services.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">2. Medical Disclaimer</h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 border-l-4 border-red-500 rounded-r-lg my-6">
          <strong className="block text-red-700 dark:text-red-400 mb-2 uppercase tracking-wide text-xs">Critical Warning</strong>
          <p className="m-0 text-red-800 dark:text-red-200">
            Dr.Suji Chat is an AI-based information tool, not a doctor. 
            The content provided is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. 
            Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
          </p>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">3. User Responsibilities</h2>
        <p>
          You agree not to use the service for emergency situations. In case of a medical emergency, call emergency services immediately.
          You are responsible for verifying any information provided by the AI before taking action.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">4. AI Limitations</h2>
        <p>
          While we strive for accuracy, AI models can hallucinate or provide incorrect information. We do not guarantee the accuracy, completeness, or timeliness of responses.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">5. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. We will always post the most current version on this page. 
          The "Last Updated" date at the top of this policy indicates when the latest changes were made.
        </p>
      </div>
    </div>
  );
};

export default TermsPage;
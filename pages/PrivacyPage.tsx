import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-3 text-slate-900 dark:text-white">Privacy Policy</h1>
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
        <h2 className="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-white">1. Data Collection</h2>
        <p>
          We collect conversation history to provide contextual responses. 
          In this version of the application, data is stored locally on your device via browser LocalStorage.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">2. HIPAA & GDPR Compliance</h2>
        <p>
          We are committed to protecting your health data. 
          Although this is a demonstration environment, we adhere to principles of data minimization.
          In a production environment, all personal health information (PHI) is encrypted at rest and in transit according to HIPAA and GDPR standards.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">3. Third-Party AI Processors</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 my-4">
          <p className="m-0 text-blue-800 dark:text-blue-200 text-sm">
            <strong>Note:</strong> Anonymized query data is processed by Google Gemini API to generate responses. 
            We advise against sharing personally identifiable information (PII) like names, specific addresses, or social security numbers in the chat.
          </p>
        </div>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">4. User Rights</h2>
        <p>
          You have the right to delete your conversation history at any time using the delete function in the sidebar. 
          This immediately removes the data from your local device storage.
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">5. Updates to Policy</h2>
        <p>
          We may update this privacy policy from time to time. The date at the top of this page indicates the last revision.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;
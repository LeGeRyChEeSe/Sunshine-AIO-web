import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const tools = [
  { value: 'sunshine-aio', label: 'Sunshine-AIO' },
  { value: 'moonlight', label: 'Moonlight' },
  { value: 'sunshine', label: 'Sunshine' },
  { value: 'virtual-display', label: 'Virtual Display Driver' },
  { value: 'playnite', label: 'Playnite' },
  { value: 'playnite-watcher', label: 'Playnite Watcher' },
];

const categories = [
  { value: 'tool-issue', label: 'Tool Issue' },
  { value: 'installation', label: 'Installation Problem' },
  { value: 'configuration', label: 'Configuration Help' },
  { value: 'performance', label: 'Performance Issue' },
  { value: 'compatibility', label: 'Compatibility Problem' },
  { value: 'feature-request', label: 'Feature Request' },
  { value: 'website', label: 'Website Issue' },
  { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];

export default function Contact() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState('');
  const [fileError, setFileError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFileError('');

    if (selectedFiles.length > MAX_FILES) {
      setFileError(t('contact.form.errors.tooManyFiles', { max: MAX_FILES }));
      return;
    }

    const invalidFiles = selectedFiles.filter(
      file => !ALLOWED_TYPES.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      setFileError(t('contact.form.errors.invalidType'));
      return;
    }

    const oversizedFiles = selectedFiles.filter(
      file => file.size > MAX_FILE_SIZE
    );
    if (oversizedFiles.length > 0) {
      setFileError(t('contact.form.errors.fileTooBig', { size: '5MB' }));
      return;
    }

    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      const formData = new FormData(form);
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {t('contact.thankYou.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {t('contact.thankYou.message')}
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gradient-sunshine text-white rounded-lg font-semibold hover:opacity-90 transition"
            >
              <Home className="mr-2 h-5 w-5" />
              {t('contact.thankYou.backHome')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunshine-violet/10 to-sunshine-blue/10 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
          >
            <input type="hidden" name="form-name" value="contact" />
            <p className="hidden">
              <label>
                Don't fill this out if you're human: <input name="bot-field" />
              </label>
            </p>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              {t('contact.title')}
            </h1>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.category')}
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                >
                  <option value="">{t('contact.form.selectCategory')}</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {t(`contact.form.categories.${cat.value}`)}
                    </option>
                  ))}
                </select>
              </div>

              {category === 'tool-issue' && (
                <div>
                  <label htmlFor="tool" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('contact.form.tool')}
                  </label>
                  <select
                    name="tool"
                    id="tool"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                  >
                    <option value="">{t('contact.form.selectTool')}</option>
                    {tools.map((tool) => (
                      <option key={tool.value} value={tool.value}>
                        {tool.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('contact.form.attachments')}
                </label>
                <input
                  type="file"
                  name="attachments"
                  onChange={handleFileChange}
                  multiple
                  accept={ALLOWED_TYPES.join(',')}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sunshine-violet"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('contact.form.attachmentHelp')}
                </p>
                {fileError && (
                  <div className="mt-2 flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">{fileError}</span>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {t('contact.form.selectedFiles', { count: files.length })}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-gradient-sunshine text-white rounded-lg font-semibold hover:opacity-90 transition"
              >
                {t('contact.form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
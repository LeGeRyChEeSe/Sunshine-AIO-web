import { faCheckCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';

const tools = [
  {
    id: 'sunshine-aio',
    translationKey: 'sunshine',
    github: 'https://github.com/LeGeRyChEeSe/Sunshine-AIO',
    recommended: true,
    type: 'server',
    size: 'large',
  },
  {
    id: 'moonlight',
    translationKey: 'moonlight',
    website: 'https://moonlight-stream.org',
    recommended: true,
    type: 'client',
    size: 'large',
  },
  {
    id: 'sunshine',
    translationKey: 'sunshine_base',
    github: 'https://github.com/LizardByte/Sunshine',
    downloadUrl:
      'https://github.com/LizardByte/Sunshine/releases/latest/download/sunshine-windows-installer.exe',
  },
  {
    id: 'virtual-display',
    translationKey: 'virtual_display',
    github: 'https://github.com/itsmikethetech/Virtual-Display-Driver',
    isDisplayDriver: true,
    win10Url:
      'https://github.com/itsmikethetech/Virtual-Display-Driver/releases/tag/23.10.20.2',
    win11Url:
      'https://github.com/itsmikethetech/Virtual-Display-Driver/releases/tag/23.12.2HDR',
  },
  {
    id: 'playnite',
    translationKey: 'playnite',
    github: 'https://github.com/JosefNemec/Playnite',
    downloadUrl:
      'https://github.com/JosefNemec/Playnite/releases/latest/download/Playnite.exe',
  },
  {
    id: 'playnite-watcher',
    translationKey: 'playnite_watcher',
    github: 'https://github.com/Nonary/PlayNiteWatcher',
    downloadUrl:
      'https://github.com/Nonary/PlayNiteWatcher/releases/latest/download/PlayNiteWatcher.zip',
  },
];

export default function Tools() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const scriptUrl = 'https://sunshine-aio.com/script.ps1';

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50/50 to-primary-100/50 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          {t('tools.title')}
        </h1>

        <div className="md:space-y-6 space-y-8 ">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`p-6 rounded-xl ${tool.recommended
                ? tool.type === 'server'
                  ? 'bg-gradient-to-r from-violet-500/90 to-violet-600/90 dark:from-violet-600/90 dark:to-violet-700/90 text-white'
                  : 'bg-gradient-to-r from-blue-500/90 to-blue-600/90 dark:from-blue-600/90 dark:to-blue-700/90 text-white'
                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'
                } ${tool.size === 'large' ? 'transform scale-105' : ''}`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between overflow-hidden">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className={`text-xl font-semibold ${tool.recommended
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-900 dark:text-white'
                        }`}
                    >
                      {t(`tools.${tool.translationKey}.name`)}
                    </h2>
                    {tool.recommended && (
                      <span className="px-2 py-1 text-gray-900 dark:text-white text-sm bg-white/20 rounded-full">
                        {t('tools.recommended')}
                      </span>
                    )}
                    {tool.type && (
                      <span
                        className={`px-2 py-1 text-sm rounded-full ${tool.type === 'server'
                          ? 'bg-violet-800/30 border border-violet-400/30 text-gray-900 dark:text-white'
                          : 'bg-blue-800/30 border border-blue-400/30 text-gray-900 dark:text-white'
                          }`}
                      >
                        {t(
                          tool.type === 'server'
                            ? 'tools.serverInstall'
                            : 'tools.clientInstall'
                        )}
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 ${tool.recommended
                      ? 'text-gray-900 dark:text-white/90'
                      : 'text-gray-600 dark:text-gray-300'
                      }`}
                  >
                    {t(`tools.${tool.translationKey}.description`)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    {tool.github && (
                      <a
                        href={tool.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center ${tool.recommended
                          ? 'text-white/90 hover:text-white'
                          : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                          }`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        {t('tools.viewGithub')}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-center">
                  {tool.website ? (
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-2 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition"
                    >
                      <ExternalLink className="h-5 w-5 mr-2" />
                      {t('tools.visitWebsite')}
                    </a>
                  ) : tool.isDisplayDriver ? (
                    <div className="inline-flex flex-wrap items-center justify-center gap-2">
                      <a
                        href={tool.win10Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        {t('tools.windows10')}
                      </a>
                      <a
                        href={tool.win11Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 transition"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        {t('tools.windows11')}
                      </a>
                    </div>
                  ) : tool.id === 'sunshine-aio' ? (
                    <div className="text-center flex flex-wrap mx-auto items-center justify-center">
                      <div className="mb-6 font-bold text-white">
                        <h2 className="text-2xl md:text-2xl text-white font-semibold mb-2">
                          {t('hero.commandNote')}
                        </h2>
                      </div>

                      <div className="flex flex-wrap max-w-max items-center justify-center p-4 shadow-md bg-gradient-to-br bg-gray-800/90 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl overflow-hidden">
                        <pre className="text-sm leading-relaxed whitespace-pre-wrap mr-4">
                          <code>
                            <span className="token keyword">irm</span> <span className="token string">{scriptUrl}</span> | <span className="token operator">iex</span>
                          </code>
                        </pre>

                        <div>
                          <CopyToClipboard
                            text={`irm ${scriptUrl} | iex`}
                            onCopy={() => setCopied(true)}
                          >
                            <button
                              type="button"
                              className="inline-flex bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition shadow-lg px-4 py-3"
                            >
                              {copied ? (
                                <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5" />
                              ) : (
                                <FontAwesomeIcon icon={faCopy} className="h-5 w-5" />
                              )}
                            </button>
                          </CopyToClipboard>
                        </div>
                      </div>
                    </div>
                  ) : (
                    tool.downloadUrl && (
                      <a
                        href={tool.downloadUrl}
                        className={`inline-flex items-center px-6 py-2 rounded-full font-semibold transition bg-primary-600 text-white hover:bg-primary-700`}
                      >
                        <Download className="h-5 w-5 mr-2" />
                        {t('tools.download')}
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

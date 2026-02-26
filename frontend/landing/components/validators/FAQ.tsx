'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string | JSX.Element;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'How much can I realistically earn?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>Junior Quant Example (50k CHULO):</strong>
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-3">
            <li>Conservative: $3,000-$4,000/month</li>
            <li>Average: $4,275/month</li>
            <li>Best case: $6,000+/month (if CHULO price increases)</li>
          </ul>
          <p className="mb-2">
            <strong>Earnings depend on:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>CHULO price (volatile)</li>
            <li>Network activity (# of signals validated)</li>
            <li>Your uptime (&gt;99% recommended)</li>
          </ol>
        </div>
      ),
    },
    {
      question: 'Do I need to be technical?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>No!</strong> Setup is 5 minutes of copy-paste:
          </p>
          <pre className="bg-slate-900 p-4 rounded-lg text-sm font-mono mb-3 overflow-x-auto">
            {`wget https://chulobots.com/validator.tar.gz
tar -xzf validator.tar.gz
cd validator && cp .env.example .env
nano .env  # Add your wallet
docker-compose up -d`}
          </pre>
          <p>If you can rent a VPS and use SSH, you can run a validator.</p>
        </div>
      ),
    },
    {
      question: 'What are the risks?',
      answer: (
        <div>
          <p className="mb-2">
            <strong>Main risks:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-3">
            <li>
              <strong>CHULO price volatility:</strong> Price could go down (or up)
            </li>
            <li>
              <strong>Slashing:</strong> Vote against majority = -1% penalty (rare)
            </li>
            <li>
              <strong>Downtime penalties:</strong> Offline &gt;24hrs = -0.5% penalty
            </li>
            <li>
              <strong>Operating costs:</strong> VPS + RPC (~$74/month)
            </li>
          </ol>
          <p className="mb-2">
            <strong>Mitigation:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Monitor your node (set up alerts)</li>
            <li>Use reliable VPS provider</li>
            <li>Keep backups</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'Can I unstake anytime?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>Yes, but with 7-day cooldown:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-2 mb-3">
            <li>Initiate unstake on app.chulobots.com</li>
            <li>Wait 7 days</li>
            <li>Claim CHULO back to wallet</li>
          </ol>
          <p className="mb-2">
            <strong>During cooldown:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Validator inactive (no validations)</li>
            <li>No rewards earned</li>
            <li>Can&apos;t restake until cooldown complete</li>
          </ul>
        </div>
      ),
    },
    {
      question: 'What if my validator goes offline?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>Short outage (&lt;1 hour):</strong> No penalty, resume when back
          </p>
          <p className="mb-3">
            <strong>Long outage (&gt;24 hours):</strong> -0.5% stake penalty + missed rewards
          </p>
          <p className="mb-2">
            <strong>Best practice:</strong> Set up monitoring (Grafana dashboard included)
          </p>
        </div>
      ),
    },
    {
      question: 'Can I run multiple validators?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>Yes!</strong> Many operators run 2-5 validators.
          </p>
          <p className="mb-2">
            <strong>Requirements:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Separate wallet per validator</li>
            <li>Separate stake per validator (50k each)</li>
            <li>Can run on same VPS or separate</li>
          </ul>
          <p>
            <strong>Example:</strong> 3 validators × $4,275/month = $12,825/month
          </p>
        </div>
      ),
    },
    {
      question: 'How do rewards work?',
      answer: (
        <div>
          <p className="mb-3">
            <strong>Automatic:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>Validation rewards credited after each validation</li>
            <li>Burn pool distributed daily</li>
            <li>Claim rewards anytime (or compound)</li>
          </ul>
          <p>
            <strong>No manual claiming required</strong> - rewards accumulate automatically.
          </p>
        </div>
      ),
    },
    {
      question: 'What hardware do I need?',
      answer: (
        <div>
          <p className="mb-2">
            <strong>Minimum specs:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-3">
            <li>2 CPU cores</li>
            <li>4GB RAM</li>
            <li>50GB SSD</li>
            <li>10Mbps internet</li>
            <li>95%+ uptime</li>
          </ul>
          <p>
            <strong>Recommended VPS:</strong> DigitalOcean ($24/month), Linode ($24/month), AWS
            t3.medium ($30/month)
          </p>
        </div>
      ),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to know about becoming a validator
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden hover:border-chulo/30 transition-all duration-300"
              >
                {/* Question */}
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                  <svg
                    className={`w-6 h-6 text-chulo-light flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-300 leading-relaxed border-t border-slate-700">
                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-chulo/10 to-green-600/10 border-2 border-chulo/30 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-3">Still have questions?</h3>
            <p className="text-gray-400 mb-6">Join our Discord community for 24/7 support</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://discord.gg/chulobots"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-chulo hover:bg-chulo-dark text-black font-semibold rounded-lg transition-colors duration-200"
              >
                Join Discord
              </a>
              <a
                href="https://docs.chulobots.com/validators"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Read Full Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

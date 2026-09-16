import { useState } from 'react';
import { useLang, t } from '../lib/i18n';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const lang = useLang();
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: 'general',
    lottery: '',
    drawCode: '',
    message: '',
  });
  const [state, setState] = useState<FormState>('idle');

  const subjectOptions = [
    { value: 'general',    label: t(lang, 'subjectGeneral') },
    { value: 'correction', label: t(lang, 'subjectCorrection') },
    { value: 'feedback',   label: t(lang, 'subjectFeedback') },
    { value: 'privacy',    label: t(lang, 'subjectPrivacy') },
    { value: 'other',      label: t(lang, 'subjectOther') },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState('submitting');

    // Using Formspree — replace YOUR_FORM_ID with your Formspree form ID
    // Sign up free at formspree.io and create a form to get the ID
    try {
      const res = await fetch('https://formspree.io/f/mgodjgey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: subjectOptions.find(s => s.value === form.subject)?.label,
          lottery: form.lottery,
          drawCode: form.drawCode,
          message: form.message,
        }),
      });
      if (res.ok) {
        setState('success');
        setForm({ name: '', email: '', subject: 'general', lottery: '', drawCode: '', message: '' });
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  }

  return (
    <main className="page">
      <div className="container">
        <div className="hero">
          <h1>{t(lang, 'contactH1')}</h1>
          <p>{t(lang, 'contactSubtitle')}</p>
        </div>

        <div className="contact-grid">
          {/* Contact form */}
          <div className="contact-form-card">
            <h2>{t(lang, 'contactSendMessage')}</h2>
            <p className="contact-form-card__sub">{t(lang, 'contactReplyTime')}</p>

            {state === 'success' ? (
              <div className="contact-success">
                <div className="contact-success__icon">✅</div>
                <h3>{t(lang, 'contactSentTitle')}</h3>
                <p>Thank you for reaching out. We'll get back to you at <strong>{form.email || 'your email'}</strong> within 2 business days.</p>
                <button className="button" onClick={() => setState('idle')}>{t(lang, 'contactSendAnother')}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="name">{t(lang, 'contactYourName')}</label>
                    <input
                      id="name" name="name" type="text"
                      placeholder="e.g. Rajan Kumar"
                      value={form.name} onChange={handleChange}
                      required className="input"
                    />
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="email">{t(lang, 'contactEmail')}</label>
                    <input
                      id="email" name="email" type="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange}
                      required className="input"
                    />
                  </div>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="subject">{t(lang, 'contactSubject')}</label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="input">
                    {subjectOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {form.subject === 'correction' && (
                  <div className="contact-form__row">
                    <div className="contact-form__field">
                      <label htmlFor="lottery">{t(lang, 'contactLotteryName')}</label>
                      <input
                        id="lottery" name="lottery" type="text"
                        placeholder="e.g. Karunya, Sthree Sakthi"
                        value={form.lottery} onChange={handleChange}
                        className="input"
                      />
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="drawCode">{t(lang, 'contactDrawCode')}</label>
                      <input
                        id="drawCode" name="drawCode" type="text"
                        placeholder="e.g. KR-753"
                        value={form.drawCode} onChange={handleChange}
                        className="input"
                      />
                    </div>
                  </div>
                )}

                <div className="contact-form__field">
                  <label htmlFor="message">{t(lang, 'contactMessage')}</label>
                  <textarea
                    id="message" name="message"
                    placeholder={
                      form.subject === 'correction'
                        ? 'Please describe what is incorrect and provide the correct information with a source link if available.'
                        : t(lang, 'contactHowCanWeHelp')
                    }
                    value={form.message} onChange={handleChange}
                    required rows={5} className="input contact-form__textarea"
                  />
                </div>

                {state === 'error' && (
                  <div className="contact-error">
                    {t(lang, 'contactErrorMsg')}
                  </div>
                )}

                <button type="submit" className="button" disabled={state === 'submitting'}>
                  {state === 'submitting' ? t(lang, 'contactSending') : t(lang, 'contactSendBtn')}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="contact-sidebar">
            <div className="contact-info-card">
              <div className="contact-info-card__icon">📧</div>
              <h3>{t(lang, 'contactEmailLabel')}</h3>
              <p>support@keralaticketresults.in</p>
              <span className="contact-info-card__note">{t(lang, 'contactResponseNote')}</span>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">🕐</div>
              <h3>{t(lang, 'contactSupportHours')}</h3>
              <p>Monday – Saturday</p>
              <span className="contact-info-card__note">{t(lang, 'contactHoursNote')}</span>
            </div>

            <div className="contact-info-card contact-info-card--warning">
              <div className="contact-info-card__icon">⚠️</div>
              <h3>{t(lang, 'contactImportantNotice')}</h3>
              <p>We are an independent informational website. For official prize claims, ticket validation, or legal matters, please contact the <strong>Kerala State Lottery Department</strong> directly.</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">📋</div>
              <h3>{t(lang, 'contactForCorrections')}</h3>
              <p>Please include the lottery name, draw code, what is incorrect, and the correct information with an official source link.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

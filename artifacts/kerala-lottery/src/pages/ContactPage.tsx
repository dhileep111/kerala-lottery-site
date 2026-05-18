import { useState } from 'react';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
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
    { value: 'general',    label: 'General Enquiry' },
    { value: 'correction', label: 'Result Correction' },
    { value: 'feedback',   label: 'Website Feedback' },
    { value: 'privacy',    label: 'Privacy / Data Request' },
    { value: 'other',      label: 'Other' },
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
          <h1>Contact Us</h1>
          <p>Result corrections, feedback, or general questions — we read every message.</p>
        </div>

        <div className="contact-grid">
          {/* Contact form */}
          <div className="contact-form-card">
            <h2>Send a Message</h2>
            <p className="contact-form-card__sub">We aim to reply within 2 business days.</p>

            {state === 'success' ? (
              <div className="contact-success">
                <div className="contact-success__icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. We'll get back to you at <strong>{form.email || 'your email'}</strong> within 2 business days.</p>
                <button className="button" onClick={() => setState('idle')}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      id="name" name="name" type="text"
                      placeholder="e.g. Rajan Kumar"
                      value={form.name} onChange={handleChange}
                      required className="input"
                    />
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      id="email" name="email" type="email"
                      placeholder="you@example.com"
                      value={form.email} onChange={handleChange}
                      required className="input"
                    />
                  </div>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="subject">Subject *</label>
                  <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="input">
                    {subjectOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {form.subject === 'correction' && (
                  <div className="contact-form__row">
                    <div className="contact-form__field">
                      <label htmlFor="lottery">Lottery Name</label>
                      <input
                        id="lottery" name="lottery" type="text"
                        placeholder="e.g. Karunya, Sthree Sakthi"
                        value={form.lottery} onChange={handleChange}
                        className="input"
                      />
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="drawCode">Draw Code</label>
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
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message" name="message"
                    placeholder={
                      form.subject === 'correction'
                        ? 'Please describe what is incorrect and provide the correct information with a source link if available.'
                        : 'How can we help you?'
                    }
                    value={form.message} onChange={handleChange}
                    required rows={5} className="input contact-form__textarea"
                  />
                </div>

                {state === 'error' && (
                  <div className="contact-error">
                    Something went wrong. Please try again or email us directly.
                  </div>
                )}

                <button type="submit" className="button" disabled={state === 'submitting'}>
                  {state === 'submitting' ? 'Sending…' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="contact-sidebar">
            <div className="contact-info-card">
              <div className="contact-info-card__icon">📧</div>
              <h3>Email</h3>
              <p>support@keralaticketresults.in</p>
              <span className="contact-info-card__note">Response within 2 business days</span>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">🕐</div>
              <h3>Support Hours</h3>
              <p>Monday – Saturday</p>
              <span className="contact-info-card__note">9:00 AM – 6:00 PM IST</span>
            </div>

            <div className="contact-info-card contact-info-card--warning">
              <div className="contact-info-card__icon">⚠️</div>
              <h3>Important Notice</h3>
              <p>We are an independent informational website. For official prize claims, ticket validation, or legal matters, please contact the <strong>Kerala State Lottery Department</strong> directly.</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-card__icon">📋</div>
              <h3>For Result Corrections</h3>
              <p>Please include the lottery name, draw code, what is incorrect, and the correct information with an official source link.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

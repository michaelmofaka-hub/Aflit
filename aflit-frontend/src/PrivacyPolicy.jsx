
import './App.css'

function PrivacyPolicy({onback}) {
  return (
    <main className="privacy-page">
      <header className="privacy-header">
        <a className="brand" href="/">
          Aflit<span>.</span>
        </a>
        <a href="/">Back to home</a>
      </header>

      <article className="privacy-content">
        <p className="privacy-eyebrow">LEGAL & PRIVACY</p>

        <h1>Privacy Policy</h1>
        <p className="privacy-updated">
          Last updated: November 12, 2026
        </p>

        <p>
          Aflit is a creator intelligence and analytics
          platform that helps creators understand their
          performance, monitor audience growth, and explore
          monetization opportunities.
        </p>

        <p>
          This policy explains how Aflit collects, uses,
          stores, and protects information when you use
          our services.
        </p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We may collect the following information:</p>
          <ul>
            <li>Account details, including username and email.</li>
            <li>Authentication and account security information.</li>
            <li>YouTube channel and video information you authorize us to access.</li>
            <li>Channel statistics, including subscribers and views.</li>
            <li>Video performance information, including views, likes, and comments.</li>
            <li>Technical information needed to operate and secure Aflit.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Information</h2>
          <p>We use information to:</p>
          <ul>
            <li>Operate and maintain your Aflit account.</li>
            <li>Display creator and channel analytics.</li>
            <li>Track performance over time.</li>
            <li>Generate creator insights and recommendations.</li>
            <li>Improve platform functionality and security.</li>
            <li>Respond to support requests.</li>
          </ul>
        </section>

        <section>
          <h2>3. Google and YouTube Data</h2>
          <p>
            When you connect YouTube, Aflit accesses information
            permitted by the Google permissions you authorize.
            This information is used to provide creator analytics
            and related features.
          </p>
          <p>
            Aflit's use and transfer of information received
            from Google APIs complies with the Google API
            Services User Data Policy, including its Limited
            Use requirements.
          </p>
          <p>
            Aflit does not sell Google user data or use it
            for advertising.
          </p>
          <p>
            You can revoke Aflit's access through your
            Google Account security settings.
          </p>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <p>
            We use technical and organizational measures
            designed to protect information against
            unauthorized access, loss, or misuse.
            No online service can guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>5. Sharing Information</h2>
          <p>
            Aflit does not sell personal information.
            Information may be processed by service providers
            necessary to operate the platform, or disclosed
            when required by law.
          </p>
        </section>

        <section>
          <h2>6. Data Retention and Deletion</h2>
          <p>
            We retain information for as long as necessary
            to provide our services and meet applicable
            legal obligations.
          </p>
          <p>
            To request account or personal data deletion,
            contact us at:
          </p>
          <a href="mailto:michaelmofaka@gmail.com">
            michaelmofaka@gmail.com
          </a>
          <p>
            You can also revoke Aflit's access to your
            Google account through Google Account settings.
          </p>
        </section>

        <section>
          <h2>7. Your Privacy Rights</h2>
          <p>
            Depending on applicable law, you may request
            access to, correction of, or deletion of your
            personal information.
          </p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>
            Aflit is not intended for children under 13.
            We do not knowingly collect personal information
            from children under 13.
          </p>
        </section>

        <section>
          <h2>9. Policy Updates</h2>
          <p>
            We may update this policy as Aflit develops.
            Updates will be published on this page with
            a revised date.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For privacy questions, support, or deletion
            requests, contact:
          </p>
          <a href="mailto:michaelmofaka@gmail.com">
            michaelmofaka@gmail.com
          </a>
        </section>
      </article>

      <footer className="privacy-footer">
        © {new Date().getFullYear()} Aflit. All rights reserved.
      </footer>
    </main>
  )
}

export default PrivacyPolicy

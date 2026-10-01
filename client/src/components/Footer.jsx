import React from 'react';

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer-inner">
      <span>© {new Date().getFullYear()} BachBuddy. All rights reserved.</span>
      <div className="site-footer-contact">
        <a href="mailto:infobachbuddy@gmail.com">infobachbuddy@gmail.com</a>
        <span>•</span>
        <a href="tel:+919302992820">+91 93029 92820</a>
      </div>
    </div>
  </footer>
);

export default Footer;
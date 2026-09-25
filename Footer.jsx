import React from 'react';
import './style.css'; // Footer styles
import { FaInstagram, FaFacebookF, FaTwitter, FaTelegramPlane } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="footer">
      {/* Links Section */}
      <div className="footer-column">
        <h3>Links</h3>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Services</a></li>
          <li><a href="#">Support</a></li>
        </ul>
      </div>

      {/* About Website Section */}
      <div className="footer-column">
        <h3>About the Website</h3>
        <p>
          MovieApp allows you to stay updated with the latest movies and TV shows in the world of cinema in high quality.
          Enjoy various features such as searching for movies, watching trailers, and accessing complete information.
        </p>
      </div>

      {/* Social Media Section */}
      <div className="footer-column">
        <h3>Social Media</h3>
        <div className="footer-socials">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="instagram" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="telegram" aria-label="Telegram">
            <FaTelegramPlane />
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-column">
        <p>&copy; All rights reserved. Movie App.</p>
      </div>
    </footer>
  );
}

export default Footer;
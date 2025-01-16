import React from 'react';

export const Footer = () => {
  return (
    <footer className="flex justify-center py-6 text-sm text-center">
      <span className="flex flex-row items-center gap-2">
        <p>Built with ☕️ by </p>
        <a
          href="https://github.com/Sushant041"
          target="_blank"
          rel="noopener noreferrer"
        >Sushant</a>
        &
        <a
          href="https://github.com/preyanshu"
          target="_blank"
          rel="noopener noreferrer"
        >Preyanshu</a>
      </span>
    </footer>
  );
}

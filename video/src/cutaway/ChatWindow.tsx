import React from 'react';
import {C} from '../theme';
import {SANS, MONO} from '../fonts';

// A generic chat window, deliberately competent: the answer it gives is correct
// and the question is one somebody had to think of first. Nothing here is a
// Baton surface, so it carries none of Baton's chrome.

export const CHAT = {left: 300, top: 300, width: 880, height: 452};

const Bubble: React.FC<{
  side: 'user' | 'bot';
  children: React.ReactNode;
  opacity: number;
}> = ({side, children, opacity}) => (
  <div
    style={{
      display: 'flex',
      justifyContent: side === 'user' ? 'flex-end' : 'flex-start',
      opacity,
    }}
  >
    <div
      style={{
        maxWidth: 640,
        background: side === 'user' ? C.navy : 'rgba(15,34,56,0.065)',
        color: side === 'user' ? C.cream : C.navy,
        borderRadius: 13,
        padding: '15px 19px 17px',
        fontFamily: SANS,
        fontSize: 21,
        lineHeight: 1.44,
      }}
    >
      {children}
    </div>
  </div>
);

export const ChatWindow: React.FC<{
  /** 0 -> 1 across the typing of the question */
  ask: number;
  /** 0 -> 1 across the arrival of the answer */
  answer: number;
  /** caret visible while the question is being typed */
  caret: boolean;
}> = ({ask, answer, caret}) => {
  const q = 'Summarise the Sentrix filing thread.';
  const a = 'Module 3 sign-off was requested on 4 September. Eleven messages, five recipients.';

  const qShown = q.slice(0, Math.round(ask * q.length));
  const aShown = a.slice(0, Math.round(answer * a.length));

  return (
    <div
      style={{
        width: CHAT.width,
        height: CHAT.height,
        background: C.cream,
        border: '1px solid rgba(15,34,56,0.16)',
        borderRadius: 12,
        boxShadow: '0 22px 56px rgba(0,0,0,0.38)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* window chrome, so it reads as a chat window with no label needed */}
      <div
        style={{
          height: 54,
          flex: '0 0 auto',
          borderBottom: '1px solid rgba(15,34,56,0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '0 22px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 11,
              height: 11,
              borderRadius: 999,
              background: 'rgba(15,34,56,0.18)',
            }}
          />
        ))}
        <div
          style={{
            marginLeft: 14,
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: 2.4,
            color: C.grey,
          }}
        >
          CHAT
        </div>
      </div>

      {/* the exchange */}
      <div
        style={{
          flex: '1 1 auto',
          padding: '26px 24px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <Bubble side="user" opacity={ask > 0 ? 1 : 0}>
          {qShown}
          {caret ? (
            <span style={{opacity: 0.7}}>|</span>
          ) : null}
        </Bubble>
        <Bubble side="bot" opacity={answer > 0 ? 1 : 0}>
          {aShown}
        </Bubble>
      </div>

      {/* the prompt box: the whole interface is this one hole to type into */}
      <div
        style={{
          flex: '0 0 auto',
          padding: '18px 24px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 46,
            borderRadius: 9,
            border: '1px solid rgba(15,34,56,0.16)',
            background: 'rgba(15,34,56,0.03)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            fontFamily: SANS,
            fontSize: 17,
            color: 'rgba(138,150,163,0.95)',
          }}
        >
          Ask anything
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 9,
            background: 'rgba(15,34,56,0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={18} height={18} viewBox="0 0 18 18">
            <path
              d="M3 9 H14 M9.5 4.5 L14 9 L9.5 13.5"
              fill="none"
              stroke="rgba(15,34,56,0.42)"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

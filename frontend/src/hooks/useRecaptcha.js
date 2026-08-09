import { useState, useEffect, useRef, useCallback } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
const SCRIPT_ID = 'recaptcha-v2-script';

/**
 * Carga reCAPTCHA v2 si hay VITE_RECAPTCHA_SITE_KEY.
 * Devuelve { siteKey, token, captchaRef } para montar el widget.
 */
export function useRecaptcha() {
  const [token, setToken] = useState(null);
  const captchaRef = useRef(null);
  const widgetId = useRef(null);

  const renderWidget = useCallback(() => {
    if (!RECAPTCHA_SITE_KEY || !captchaRef.current || !window.grecaptcha?.render) {
      return;
    }

    if (widgetId.current !== null) {
      try {
        window.grecaptcha.reset(widgetId.current);
        setToken(null);
      } catch {
        // ignore
      }
      return;
    }

    widgetId.current = window.grecaptcha.render(captchaRef.current, {
      sitekey: RECAPTCHA_SITE_KEY,
      callback: (value) => setToken(value),
      'expired-callback': () => setToken(null),
      'error-callback': () => setToken(null),
    });
  }, []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;

    const tryRender = () => {
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(renderWidget);
      } else {
        renderWidget();
      }
    };

    if (window.grecaptcha?.render) {
      tryRender();
      return;
    }

    let script = document.getElementById(SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener('load', tryRender);
    return () => script.removeEventListener('load', tryRender);
  }, [renderWidget]);

  return {
    siteKey: RECAPTCHA_SITE_KEY,
    token,
    captchaRef,
    reset: renderWidget,
  };
}

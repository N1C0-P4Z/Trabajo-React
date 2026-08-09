import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../services/apiConfig';

const SCRIPT_ID = 'recaptcha-v2-script';

/**
 * Carga reCAPTCHA v2.
 * Site key: primero del API (/v1/config), si no hay usa VITE_RECAPTCHA_SITE_KEY (dev local).
 */
export function useRecaptcha() {
  const [siteKey, setSiteKey] = useState('');
  const [token, setToken] = useState(null);
  const captchaRef = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadSiteKey = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/config`);
        const text = await res.text();
        if (res.ok && text) {
          const data = JSON.parse(text);
          if (!cancelled && data.recaptchaSiteKey) {
            setSiteKey(data.recaptchaSiteKey);
            return;
          }
        }
      } catch {
        // fallback a env de Vite
      }

      const fromEnv = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
      if (!cancelled) setSiteKey(fromEnv);
    };

    loadSiteKey();
    return () => {
      cancelled = true;
    };
  }, []);

  const renderWidget = useCallback(() => {
    if (!siteKey || !captchaRef.current || !window.grecaptcha?.render) {
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
      sitekey: siteKey,
      callback: (value) => setToken(value),
      'expired-callback': () => setToken(null),
      'error-callback': () => setToken(null),
    });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;

    // el div del widget puede montarse en el mismo tick; esperar un frame
    const scheduleRender = () => {
      requestAnimationFrame(() => {
        if (window.grecaptcha?.ready) {
          window.grecaptcha.ready(renderWidget);
        } else {
          renderWidget();
        }
      });
    };

    if (window.grecaptcha?.render) {
      scheduleRender();
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

    script.addEventListener('load', scheduleRender);
    return () => script.removeEventListener('load', scheduleRender);
  }, [siteKey, renderWidget]);

  return {
    siteKey,
    token,
    captchaRef,
    reset: renderWidget,
  };
}

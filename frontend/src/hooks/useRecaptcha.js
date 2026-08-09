import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '../services/apiConfig';

const SCRIPT_ID = 'recaptcha-v2-script';

/**
 * Carga reCAPTCHA v2 desde GET /v1/config.
 * loading=true hasta saber si hay captcha; ready cuando el widget está usable (o no hace falta).
 */
export function useRecaptcha() {
  const [siteKey, setSiteKey] = useState('');
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  const setCaptchaRef = useCallback((node) => {
    containerRef.current = node;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const res = await fetch(`${API_BASE}/v1/config`);
        const text = await res.text();
        if (res.ok && text) {
          const data = JSON.parse(text);
          if (!cancelled) {
            const enabled = Boolean(data.recaptchaEnabled && data.recaptchaSiteKey);
            setRequired(enabled);
            setSiteKey(enabled ? data.recaptchaSiteKey : '');
            if (!enabled) setWidgetReady(true);
          }
          return;
        }
      } catch {
        // fallback Vite (solo local)
      }

      if (!cancelled) {
        const fromEnv = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';
        setRequired(Boolean(fromEnv));
        setSiteKey(fromEnv);
        if (!fromEnv) setWidgetReady(true);
      }
    };

    loadConfig().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.grecaptcha?.render) {
      return false;
    }

    if (widgetId.current !== null) {
      try {
        window.grecaptcha.reset(widgetId.current);
        setToken(null);
        setWidgetReady(true);
        return true;
      } catch {
        widgetId.current = null;
      }
    }

    try {
      containerRef.current.innerHTML = '';
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (value) => {
          setToken(value);
          setWidgetReady(true);
        },
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      });
      setWidgetReady(true);
      return true;
    } catch (err) {
      console.error('No se pudo renderizar reCAPTCHA:', err);
      return false;
    }
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey || loading) return;

    let cancelled = false;
    let tries = 0;

    const tryRender = () => {
      if (cancelled) return;
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          if (!cancelled) renderWidget();
        });
      } else if (!renderWidget() && tries < 40) {
        tries += 1;
        setTimeout(tryRender, 100);
      }
    };

    if (window.grecaptcha?.render) {
      tryRender();
      return () => {
        cancelled = true;
      };
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
    // por si el script ya estaba cacheado
    if (window.grecaptcha) tryRender();

    return () => {
      cancelled = true;
      script.removeEventListener('load', tryRender);
    };
  }, [siteKey, loading, renderWidget]);

  const canSubmit = !loading && (!required || Boolean(token));

  return {
    siteKey,
    required,
    loading,
    token,
    canSubmit,
    captchaRef: setCaptchaRef,
    widgetReady,
  };
}

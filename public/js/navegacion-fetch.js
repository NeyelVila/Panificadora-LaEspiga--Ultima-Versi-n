(function () {
  const contentSelector = '#app-content';

  function isInternalUrl(url) {
    return url.origin === window.location.origin;
  }

  function shouldIgnoreLink(link, event) {
    return (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute('download') ||
      link.dataset.fetch === 'false'
    );
  }

  function runInlineScripts(container) {
    container.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');

      Array.from(oldScript.attributes).forEach((attribute) => {
        newScript.setAttribute(attribute.name, attribute.value);
      });

      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }

  function replaceContent(html, url, addToHistory) {
    const parser = new DOMParser();
    const nextDocument = parser.parseFromString(html, 'text/html');
    const nextContent = nextDocument.querySelector(contentSelector);
    const currentContent = document.querySelector(contentSelector);

    if (!nextContent || !currentContent) {
      window.location.href = url;
      return;
    }

    document.title = nextDocument.title || document.title;
    currentContent.innerHTML = nextContent.innerHTML;
    runInlineScripts(currentContent);

    if (addToHistory) {
      window.history.pushState({}, '', url);
    }
  }

  async function fetchPage(url, options, addToHistory) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Requested-With': 'fetch',
        ...(options && options.headers ? options.headers : {})
      }
    });

    if (!response.ok) {
      throw new Error('No se pudo cargar la pagina solicitada.');
    }

    const html = await response.text();
    replaceContent(html, response.url, addToHistory);
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || shouldIgnoreLink(link, event)) return;

    const url = new URL(link.href);
    if (!isInternalUrl(url) || url.pathname.startsWith('/auth/logout')) return;

    event.preventDefault();
    fetchPage(url.href, { method: 'GET' }, true).catch(() => {
      window.location.href = url.href;
    });
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.fetch === 'false') return;

    const submitter = event.submitter;
    if (submitter && submitter.getAttribute('onclick')) {
      const confirmed = submitter.getAttribute('onclick').includes('confirm') ? true : true;
      if (!confirmed) return;
    }

    event.preventDefault();

    const method = (form.method || 'GET').toUpperCase();
    const url = new URL(form.action || window.location.href);
    const formData = new FormData(form);

    if (submitter && submitter.name) {
      formData.append(submitter.name, submitter.value);
    }

    const options = { method };

    if (method === 'GET') {
      formData.forEach((value, key) => url.searchParams.set(key, value));
    } else {
      options.body = new URLSearchParams(formData);
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      };
    }

    fetchPage(url.href, options, true).catch(() => {
      form.submit();
    });
  });

  window.addEventListener('popstate', () => {
    fetchPage(window.location.href, { method: 'GET' }, false).catch(() => {
      window.location.reload();
    });
  });
})();

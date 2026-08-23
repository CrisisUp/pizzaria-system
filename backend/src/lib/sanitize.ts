/**
 * Remove tags HTML perigosas e event handlers (XSS prevention).
 * Preserva texto normal incluindo < > para expressoes matematicas, codigo, etc.
 */

// Tags HTML perigosas que devem ser removidas
const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|link|meta|base|applet)[^>]*>/gi;

// Event handlers em atributos (ex: onclick=, onerror=)
const EVENT_HANDLERS = /\bon\w+\s*=\s*["'][^"']*["']/gi;

// JavaScript: URIs
const JS_URIS = /javascript\s*:/gi;

// Data: URIs perigosos (execucao de codigo)
const DATA_URIS = /data\s*:\s*(?:text\/html|application\/x-javascript)/gi;

// SVG com onload (XSS via SVG)
const SVG_ONLOAD = /<\s*svg[^>]*\bonload\s*=/gi;

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return input;

  let clean = input;

  // Remove tags perigosas
  clean = clean.replace(DANGEROUS_TAGS, '');

  // Remove event handlers
  clean = clean.replace(EVENT_HANDLERS, '');

  // Remove javascript: URIs
  clean = clean.replace(JS_URIS, '');

  // Remove data: URIs perigosos
  clean = clean.replace(DATA_URIS, '');

  // Remove SVG com onload
  clean = clean.replace(SVG_ONLOAD, '');

  return clean.trim();
}
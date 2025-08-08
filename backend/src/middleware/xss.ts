import { Request, Response, NextFunction } from 'express';
import xss from 'xss';
import { logger } from './logging';

// XSS options interface
interface XssOptions {
  whiteList?: {
    [key: string]: string[];
  };
  stripIgnoreTag?: boolean;
  stripIgnoreTagBody?: boolean;
  css?: boolean;
  allowCommentTag?: boolean;
}

// Default XSS options
const defaultOptions: XssOptions = {
  whiteList: {
    a: ['href', 'title', 'target'],
    b: [],
    blockquote: ['cite'],
    br: [],
    caption: [],
    code: [],
    dd: [],
    div: [],
    dl: [],
    dt: [],
    em: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hr: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    span: [],
    strong: [],
    sub: [],
    sup: [],
    table: ['width', 'border', 'align', 'valign'],
    tbody: [],
    td: ['width', 'colspan', 'align', 'valign'],
    th: ['width', 'colspan', 'align', 'valign'],
    thead: [],
    tr: ['rowspan', 'align', 'valign'],
    u: [],
    ul: []
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: true,
  css: false,
  allowCommentTag: false
};

// XSS middleware factory
export const createXssMiddleware = (options: XssOptions = {}) => {
  const xssOptions = { ...defaultOptions, ...options };

  // Create XSS filter
  const xssFilter = new xss.FilterXSS(xssOptions);

  // XSS middleware
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xssFilter.process(req.body[key]);
        }
      });
    }

    // Sanitize request query
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = xssFilter.process(req.query[key] as string);
        }
      });
    }

    // Sanitize request params
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = xssFilter.process(req.params[key]);
        }
      });
    }

    next();
  };
};

// XSS helper functions
export const xssHelpers = {
  // Get XSS white list
  getXssWhiteList: (): any => {
    return defaultOptions.whiteList;
  },

  // Get XSS strip ignore tag
  getXssStripIgnoreTag: (): boolean => {
    return defaultOptions.stripIgnoreTag!;
  },

  // Get XSS strip ignore tag body
  getXssStripIgnoreTagBody: (): boolean => {
    return defaultOptions.stripIgnoreTagBody!;
  },

  // Get XSS CSS
  getXssCss: (): boolean => {
    return defaultOptions.css!;
  },

  // Get XSS allow comment tag
  getXssAllowCommentTag: (): boolean => {
    return defaultOptions.allowCommentTag!;
  }
}; 
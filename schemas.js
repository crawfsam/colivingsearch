const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: { 
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.colivingSchema = Joi.object({
    coliving: Joi.object({
        name: Joi.string().required().escapeHTML(),
        city: Joi.string().required().escapeHTML(),
        country: Joi.string().required().escapeHTML(),
        address: Joi.string().required().escapeHTML(),
        url: Joi.string().required().escapeHTML(),
    }).required(),
});


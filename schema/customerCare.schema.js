const { object, string, TypeOf } = require("zod");

/**
 * @openapi
 * components:
 *  schemas:
 *    CustomerCare:
 *      type: object
 *      properties:
 *        customerName:
 *          type: string
 *          required: true
 *        customerEmail:
 *          type: string
 *          required: true
 *        customerPhone:
 *          type: string
 *        inquiry:
 *          type: string
 *          required: true
 *        complaint:
 *          type: string
 *        resolution:
 *          type: string
 *        status:
 *          type: string
 *          default: Open
 *        createdAt:
 *          type: string
 *          format: date-time
 *          default: 'current date and time'
 */
const createCustomerCareSchema = object({
  body: object({
    customerName: string({
      required_error: "customerName is required",
    }),
    customerEmail: string({
      required_error: "customerEmail is required",
    }),
    inquiry: string({
      required_error: "inquiry is required",
    }),
  }),
});
module.exports = createCustomerCareSchema;
